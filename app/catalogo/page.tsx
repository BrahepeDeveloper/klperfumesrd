import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { Metadata } from "next";
import ProductCard, { type ProductCardData } from "@/components/ProductCard";
import CatalogSidebar from "@/components/CatalogSidebar";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catálogo de Perfumes",
  description:
    "Explora más de 650 fragancias originales y decants. Filtra por género, familia olfativa, marca y más. Envíos a toda República Dominicana.",
  openGraph: {
    title: "Catálogo de Perfumes | KL Perfumes RD",
    description: "Más de 650 fragancias originales y decants de las mejores casas del mundo.",
  },
};

const PAGE_SIZE = 24;

type SearchParams = { [key: string]: string | string[] | undefined };

async function getFilterOptions() {
  const [generos, familias, temporadas, ocasiones, marcas] = await Promise.all([
    prisma.genero.findMany({ orderBy: { nombre: "asc" } }),
    prisma.familiaOlfativa.findMany({ orderBy: { nombre: "asc" } }),
    prisma.temporada.findMany({ orderBy: { nombre: "asc" } }),
    prisma.ocasion.findMany({ orderBy: { nombre: "asc" } }),
    prisma.marca.findMany({
      where: { activo: true, productos: { some: { activo: true } } },
      orderBy: { nombre: "asc" },
      select: { nombre: true, slug: true },
    }),
  ]);
  return { generos, familias, temporadas, ocasiones, marcas };
}

async function getProducts(params: SearchParams) {
  const generoSlug = params.genero as string | undefined;
  const familiaSlug = params.familia as string | undefined;
  const temporadaSlug = params.temporada as string | undefined;
  const ocasionSlug = params.ocasion as string | undefined;
  const marcaSlug = params.marca as string | undefined;
  const precioMinRaw = params.precioMin as string | undefined;
  const precioMaxRaw = params.precioMax as string | undefined;
  const precioMin = precioMinRaw ? parseFloat(precioMinRaw) : undefined;
  const precioMax = precioMaxRaw ? parseFloat(precioMaxRaw) : undefined;
  const page = Math.max(1, parseInt((params.page as string) ?? "1", 10));

  const where: Prisma.ProductoWhereInput = {
    activo: true,
    ...(generoSlug && { genero: { slug: generoSlug } }),
    ...(familiaSlug && {
      familiasOlfativas: { some: { familia: { slug: familiaSlug } } },
    }),
    ...(temporadaSlug && {
      temporadas: { some: { temporada: { slug: temporadaSlug } } },
    }),
    ...(ocasionSlug && {
      ocasiones: { some: { ocasion: { slug: ocasionSlug } } },
    }),
    ...(marcaSlug && { marca: { slug: marcaSlug } }),
    ...((precioMin !== undefined || precioMax !== undefined) && {
      variantes: {
        some: {
          activo: true,
          precio: {
            ...(precioMin !== undefined && { gte: precioMin }),
            ...(precioMax !== undefined && { lte: precioMax }),
          },
        },
      },
    }),
  };

  const [total, productos] = await Promise.all([
    prisma.producto.count({ where }),
    prisma.producto.findMany({
      where,
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      orderBy: { fechaCreacion: "desc" },
      include: {
        marca: true,
        genero: true,
        imagenes: { where: { esPrincipal: true }, take: 1 },
        variantes: { where: { activo: true } },
        familiasOlfativas: { include: { familia: true }, take: 1 },
      },
    }),
  ]);

  const cards: ProductCardData[] = productos.map((p) => {
    const precios = p.variantes.map((v) => Number(v.precio)).filter((n) => n > 0);
    return {
      slug: p.slug,
      nombre: p.nombre,
      marca: p.marca.nombre,
      genero: p.genero.nombre,
      imagenUrl: p.imagenes[0]?.urlWebp ?? null,
      precioDesde: precios.length > 0 ? Math.min(...precios) : 0,
      familiaOlfativa: p.familiasOlfativas[0]?.familia.nombre ?? null,
    };
  });

  return { cards, total, page, totalPages: Math.ceil(total / PAGE_SIZE) };
}

function buildUrl(
  filters: Record<string, string | undefined>,
  page?: number
): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v) qs.set(k, v);
  }
  if (page && page > 1) qs.set("page", page.toString());
  const str = qs.toString();
  return `/catalogo${str ? "?" + str : ""}`;
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [filterOptions, { cards, total, page, totalPages }] = await Promise.all([
    getFilterOptions(),
    getProducts(params),
  ]);

  const active = {
    genero: params.genero as string | undefined,
    familia: params.familia as string | undefined,
    temporada: params.temporada as string | undefined,
    ocasion: params.ocasion as string | undefined,
    marca: params.marca as string | undefined,
    precioMin: params.precioMin as string | undefined,
    precioMax: params.precioMax as string | undefined,
  };

  const hasPrecio = !!(active.precioMin || active.precioMax);
  const hasFilters = Object.values(active).some(Boolean);
  const activeCount =
    [active.genero, active.familia, active.temporada, active.ocasion, active.marca].filter(Boolean).length +
    (hasPrecio ? 1 : 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-10">
      {/* Page title */}
      <div className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-emerald">
          Colección Completa
        </span>
        <h1 className="font-display mt-2 text-4xl text-ink">
          Catálogo de Fragancias
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          {total.toLocaleString("es-DO")} productos disponibles
        </p>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {active.genero && (
            <Link
              href={buildUrl({ ...active, genero: undefined })}
              className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white"
            >
              {filterOptions.generos.find((g) => g.slug === active.genero)?.nombre}
              <span className="ml-1 opacity-60">✕</span>
            </Link>
          )}
          {active.familia && (
            <Link
              href={buildUrl({ ...active, familia: undefined })}
              className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white"
            >
              {filterOptions.familias.find((f) => f.slug === active.familia)?.nombre}
              <span className="ml-1 opacity-60">✕</span>
            </Link>
          )}
          {active.temporada && (
            <Link
              href={buildUrl({ ...active, temporada: undefined })}
              className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white"
            >
              {filterOptions.temporadas.find((t) => t.slug === active.temporada)?.nombre}
              <span className="ml-1 opacity-60">✕</span>
            </Link>
          )}
          {active.ocasion && (
            <Link
              href={buildUrl({ ...active, ocasion: undefined })}
              className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white"
            >
              {filterOptions.ocasiones.find((o) => o.slug === active.ocasion)?.nombre}
              <span className="ml-1 opacity-60">✕</span>
            </Link>
          )}
          {active.marca && (
            <Link
              href={buildUrl({ ...active, marca: undefined })}
              className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white"
            >
              {filterOptions.marcas.find((m) => m.slug === active.marca)?.nombre}
              <span className="ml-1 opacity-60">✕</span>
            </Link>
          )}
          {hasPrecio && (
            <Link
              href={buildUrl({ ...active, precioMin: undefined, precioMax: undefined })}
              className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white"
            >
              {active.precioMin && active.precioMax
                ? `RD$${Number(active.precioMin).toLocaleString("es-DO")} – RD$${Number(active.precioMax).toLocaleString("es-DO")}`
                : active.precioMin
                ? `Desde RD$${Number(active.precioMin).toLocaleString("es-DO")}`
                : `Hasta RD$${Number(active.precioMax).toLocaleString("es-DO")}`}
              <span className="ml-1 opacity-60">✕</span>
            </Link>
          )}
          <Link
            href="/catalogo"
            className="text-xs font-semibold text-ink-soft underline underline-offset-4"
          >
            Limpiar todo
          </Link>
        </div>
      )}

      {/* Layout: grid on desktop, stack on mobile */}
      <div className="lg:grid lg:grid-cols-[224px_1fr] lg:items-start lg:gap-10">
        <CatalogSidebar
          filterOptions={filterOptions}
          activeFilters={active}
          activeCount={activeCount}
        />

        <main className="min-w-0">
          {cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-cream py-24 text-center">
              <p className="font-display text-xl text-ink">Sin resultados</p>
              <p className="mt-2 text-sm text-ink-soft">
                Prueba con otros filtros o amplía tu búsqueda.
              </p>
              <Link
                href="/catalogo"
                className="mt-6 rounded-lg border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white"
              >
                Ver todo el catálogo
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {cards.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>

              {totalPages > 1 && (
                <nav className="mt-12 flex items-center justify-center gap-3">
                  {page > 1 ? (
                    <Link
                      href={buildUrl(active, page - 1)}
                      className="rounded-lg border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white"
                    >
                      ← Anterior
                    </Link>
                  ) : (
                    <span className="rounded-lg border border-ink/5 px-5 py-2.5 text-sm font-semibold text-ink-soft/40 cursor-not-allowed select-none">
                      ← Anterior
                    </span>
                  )}
                  <span className="text-sm text-ink-soft">
                    {page} / {totalPages}
                  </span>
                  {page < totalPages ? (
                    <Link
                      href={buildUrl(active, page + 1)}
                      className="rounded-lg border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white"
                    >
                      Siguiente →
                    </Link>
                  ) : (
                    <span className="rounded-lg border border-ink/5 px-5 py-2.5 text-sm font-semibold text-ink-soft/40 cursor-not-allowed select-none">
                      Siguiente →
                    </span>
                  )}
                </nav>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
