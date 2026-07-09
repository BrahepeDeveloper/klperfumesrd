import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import AdminProductRow from "@/components/admin/AdminProductRow";

const PAGE_SIZE = 30;

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

async function getProducts(params: Awaited<SearchParams>) {
  const q = params.q as string | undefined;
  const filter = params.filter as string | undefined;
  const page = Math.max(1, parseInt((params.page as string) ?? "1", 10));

  const where: Prisma.ProductoWhereInput = {
    ...(q && {
      OR: [
        { nombre: { contains: q } },
        { marca: { nombre: { contains: q } } },
      ],
    }),
    ...(filter === "sin-familia" && { familiasOlfativas: { none: {} } }),
    ...(filter === "sin-imagen" && { imagenes: { none: {} } }),
    ...(filter === "inactivo" && { activo: false }),
  };

  const [total, items] = await Promise.all([
    prisma.producto.count({ where }),
    prisma.producto.findMany({
      where,
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      orderBy: { nombre: "asc" },
      include: {
        marca: true,
        genero: true,
        imagenes: { where: { esPrincipal: true }, take: 1 },
        variantes: { where: { activo: true }, orderBy: { precio: "asc" }, take: 1 },
        familiasOlfativas: { include: { familia: true }, take: 1 },
      },
    }),
  ]);

  return { total, items, page, totalPages: Math.ceil(total / PAGE_SIZE) };
}

function buildUrl(
  base: string,
  extra: Record<string, string | undefined>
): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(extra)) {
    if (v) qs.set(k, v);
  }
  const str = qs.toString();
  return `${base}${str ? "?" + str : ""}`;
}

export default async function AdminProductosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const { total, items, page, totalPages } = await getProducts(params);
  const q = params.q as string | undefined;
  const filter = params.filter as string | undefined;

  const FILTERS = [
    { label: "Todos", value: undefined },
    { label: "Sin familia olfativa", value: "sin-familia" },
    { label: "Sin imagen", value: "sin-imagen" },
    { label: "Inactivos", value: "inactivo" },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-white">Productos</h1>
          <p className="mt-0.5 text-sm text-white/40">
            {total.toLocaleString("es-DO")} productos
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="flex items-center gap-2 rounded-xl brand-gradient-bg px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo producto
        </Link>
      </div>

      {/* Search + filters */}
      <div className="mb-5 flex flex-wrap gap-3">
        <form className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre o marca..."
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-brand-cyan"
          />
          <button
            type="submit"
            className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            Buscar
          </button>
          {q && (
            <Link
              href="/admin/productos"
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/50 transition hover:text-white"
            >
              Limpiar
            </Link>
          )}
        </form>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.label}
              href={buildUrl("/admin/productos", { filter: f.value, q })}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                filter === f.value
                  ? "border-brand-cyan bg-brand-cyan/10 text-brand-cyan"
                  : "border-white/10 text-white/50 hover:border-white/20 hover:text-white"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/3">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left">
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-white/40">
                Producto
              </th>
              <th className="hidden px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-white/40 md:table-cell">
                Marca
              </th>
              <th className="hidden px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-white/40 lg:table-cell">
                Familia
              </th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-white/40">
                Precio
              </th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-white/40">
                Estado
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map((p) => (
              <AdminProductRow key={p.productoId} product={p} />
            ))}
          </tbody>
        </table>

        {items.length === 0 && (
          <div className="py-16 text-center text-sm text-white/30">
            No se encontraron productos.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <span className="text-white/40">
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildUrl("/admin/productos", {
                  q,
                  filter,
                  page: String(page - 1),
                })}
                className="rounded-lg border border-white/10 px-4 py-2 text-white/60 transition hover:text-white"
              >
                ← Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildUrl("/admin/productos", {
                  q,
                  filter,
                  page: String(page + 1),
                })}
                className="rounded-lg border border-white/10 px-4 py-2 text-white/60 transition hover:text-white"
              >
                Siguiente →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
