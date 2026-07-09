import { prisma } from "@/lib/prisma";
import ProductCard, { type ProductCardData } from "@/components/ProductCard";
import Link from "next/link";

async function getProductsOnSale(): Promise<ProductCardData[]> {
  const productos = await prisma.producto.findMany({
    where: {
      activo: true,
      variantes: {
        some: {
          activo: true,
          precioComparacion: { not: null },
        },
      },
    },
    take: 48,
    orderBy: { fechaCreacion: "desc" },
    include: {
      marca: true,
      genero: true,
      imagenes: { where: { esPrincipal: true }, take: 1 },
      variantes: {
        where: { activo: true, precioComparacion: { not: null } },
        orderBy: { precio: "asc" },
        take: 1,
      },
      familiasOlfativas: { include: { familia: true }, take: 1 },
    },
  });

  return productos.map((p) => {
    const v = p.variantes[0];
    return {
      slug: p.slug,
      nombre: p.nombre,
      marca: p.marca.nombre,
      genero: p.genero.nombre,
      imagenUrl: p.imagenes[0]?.urlWebp ?? null,
      precioDesde: v ? Number(v.precio) : 0,
      familiaOlfativa: p.familiasOlfativas[0]?.familia.nombre ?? null,
    };
  });
}

export const metadata = {
  title: "Ofertas | KL Perfumes RD",
  description: "Las mejores ofertas en perfumes originales y decants. Fragancias de lujo al mejor precio en República Dominicana.",
};

export default async function OfertasPage() {
  const products = await getProductsOnSale();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-10">
      <div className="mb-10 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-emerald">
          Precios Especiales
        </span>
        <h1 className="font-display mt-3 text-4xl text-ink">Ofertas</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Fragancias originales con precios especiales por tiempo limitado.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-cream-dark py-24 text-center">
          <p className="font-display text-2xl text-ink">Sin ofertas activas</p>
          <p className="mt-2 text-sm text-ink-soft">
            Pronto tendremos nuevas promociones. Síguenos para enterarte.
          </p>
          <Link
            href="/catalogo"
            className="mt-8 rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-ink/80"
          >
            Ver catálogo completo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
