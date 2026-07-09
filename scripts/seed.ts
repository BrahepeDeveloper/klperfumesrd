// Inserta el catálogo real (data/catalog.json) en SQL Server vía Prisma.
// Idempotente: se puede correr varias veces sin duplicar datos (usa upsert).
//
// Prerrequisito: database/02_seed_lookups.sql y database/03_seed_lookups_update.sql
// ya deben haberse ejecutado contra la base de datos (Generos, TiposVariante,
// FamiliasOlfativas deben tener datos).
//
// Uso: npm run db:seed

import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

type CatalogVariant = {
  tipo: string;
  precio: number;
  stock: number;
  activo: boolean;
};

type CatalogProduct = {
  sourceId: number;
  sku: string | null;
  name: string;
  slug: string;
  marca: string;
  genero: string;
  esSet: boolean;
  descripcionCorta: string | null;
  familiaOlfativa: string | null;
  activo: boolean;
  contenidoMlOriginal: number | null;
  imagenOriginalUrl: string | null;
  variantes: CatalogVariant[];
};

type Catalog = {
  products: CatalogProduct[];
};

function slugify(str: string): string {
  return (
    str
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "marca"
  );
}

async function main() {
  const catalogPath = path.join(__dirname, "..", "data", "catalog.json");
  const catalog: Catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

  const [generos, tiposVariante, familias] = await Promise.all([
    prisma.genero.findMany(),
    prisma.tipoVariante.findMany(),
    prisma.familiaOlfativa.findMany(),
  ]);

  if (generos.length === 0 || tiposVariante.length === 0 || familias.length === 0) {
    throw new Error(
      "Las tablas de catálogo (Generos/TiposVariante/FamiliasOlfativas) están vacías. " +
        "Corre primero database/02_seed_lookups.sql y database/03_seed_lookups_update.sql contra la base de datos."
    );
  }

  const generoIdPorNombre = new Map(generos.map((g) => [g.nombre, g.generoId]));
  const tipoVarianteIdPorNombre = new Map(tiposVariante.map((t) => [t.nombre, t.tipoVarianteId]));
  const familiaIdPorNombre = new Map(familias.map((f) => [f.nombre, f.familiaId]));

  const marcaCache = new Map<string, number>();
  async function getOrCreateMarcaId(nombre: string): Promise<number> {
    const cached = marcaCache.get(nombre);
    if (cached) return cached;
    const marca = await prisma.marca.upsert({
      where: { nombre },
      update: {},
      create: { nombre, slug: slugify(nombre) },
    });
    marcaCache.set(nombre, marca.marcaId);
    return marca.marcaId;
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let variantesOmitidas = 0;

  for (const p of catalog.products) {
    const generoId = generoIdPorNombre.get(p.genero);
    if (!generoId) {
      console.warn(`Producto ${p.sourceId} (${p.name}): género "${p.genero}" no encontrado, se omite.`);
      skipped++;
      continue;
    }

    const marcaId = await getOrCreateMarcaId(p.marca);
    const familiaId = p.familiaOlfativa ? familiaIdPorNombre.get(p.familiaOlfativa) : undefined;

    const existing = await prisma.producto.findUnique({ where: { slug: p.slug } });

    const producto = await prisma.producto.upsert({
      where: { slug: p.slug },
      update: {
        nombre: p.name,
        marcaId,
        generoId,
        contenidoMlOriginal: p.contenidoMlOriginal,
        descripcionCorta: p.descripcionCorta,
        sku: p.sku,
        activo: p.activo,
      },
      create: {
        nombre: p.name,
        slug: p.slug,
        marcaId,
        generoId,
        contenidoMlOriginal: p.contenidoMlOriginal,
        descripcionCorta: p.descripcionCorta,
        sku: p.sku,
        activo: p.activo,
      },
    });

    existing ? updated++ : created++;

    if (p.imagenOriginalUrl) {
      const existingImg = await prisma.productoImagen.findFirst({
        where: { productoId: producto.productoId, esPrincipal: true },
      });
      if (existingImg) {
        await prisma.productoImagen.update({
          where: { imagenId: existingImg.imagenId },
          data: { urlWebp: p.imagenOriginalUrl, textoAlternativo: p.name },
        });
      } else {
        await prisma.productoImagen.create({
          data: {
            productoId: producto.productoId,
            urlWebp: p.imagenOriginalUrl,
            textoAlternativo: p.name,
            esPrincipal: true,
            orden: 0,
          },
        });
      }
    }

    if (familiaId) {
      await prisma.productoFamiliaOlfativa.upsert({
        where: { productoId_familiaId: { productoId: producto.productoId, familiaId } },
        update: {},
        create: { productoId: producto.productoId, familiaId },
      });
    }

    for (const v of p.variantes) {
      const tipoVarianteId = tipoVarianteIdPorNombre.get(v.tipo);
      if (!tipoVarianteId) {
        console.warn(`Producto ${p.sourceId} (${p.name}): tipo de variante "${v.tipo}" no encontrado, se omite.`);
        variantesOmitidas++;
        continue;
      }
      await prisma.variantePrecio.upsert({
        where: { productoId_tipoVarianteId: { productoId: producto.productoId, tipoVarianteId } },
        update: { precio: v.precio, stock: v.stock, activo: v.activo },
        create: {
          productoId: producto.productoId,
          tipoVarianteId,
          precio: v.precio,
          stock: v.stock,
          activo: v.activo,
        },
      });
    }
  }

  console.log(
    `Listo. Productos creados: ${created}, actualizados: ${updated}, omitidos: ${skipped}. Variantes omitidas: ${variantesOmitidas}.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
