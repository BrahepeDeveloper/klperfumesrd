import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getStats() {
  const [totalProductos, totalMarcas, sinFamilia, sinImagen] = await Promise.all([
    prisma.producto.count({ where: { activo: true } }),
    prisma.marca.count({ where: { activo: true } }),
    prisma.producto.count({
      where: { activo: true, familiasOlfativas: { none: {} } },
    }),
    prisma.producto.count({
      where: { activo: true, imagenes: { none: {} } },
    }),
  ]);
  return { totalProductos, totalMarcas, sinFamilia, sinImagen };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const statCards = [
    {
      label: "Productos activos",
      value: stats.totalProductos.toLocaleString("es-DO"),
      href: "/admin/productos",
      color: "from-brand-cyan/20 to-brand-emerald/20",
    },
    {
      label: "Marcas",
      value: stats.totalMarcas.toLocaleString("es-DO"),
      href: "/admin/marcas",
      color: "from-purple-500/20 to-pink-500/20",
    },
    {
      label: "Sin familia olfativa",
      value: stats.sinFamilia.toLocaleString("es-DO"),
      href: "/admin/productos?filter=sin-familia",
      color:
        stats.sinFamilia > 0
          ? "from-amber-500/20 to-orange-500/20"
          : "from-green-500/20 to-emerald-500/20",
      alert: stats.sinFamilia > 0,
    },
    {
      label: "Sin imagen",
      value: stats.sinImagen.toLocaleString("es-DO"),
      href: "/admin/productos?filter=sin-imagen",
      color:
        stats.sinImagen > 0
          ? "from-red-500/20 to-rose-500/20"
          : "from-green-500/20 to-emerald-500/20",
      alert: stats.sinImagen > 0,
    },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl text-white">Dashboard</h1>
      <p className="mt-1 text-sm text-white/40">
        Resumen general del catálogo KL Perfumes RD.
      </p>

      {/* Stats grid */}
      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4 md:gap-4">
        {statCards.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group relative overflow-hidden rounded-2xl border border-white/5 bg-bg-secondary/5 p-5 transition hover:bg-bg-secondary/8"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-40`}
            />
            <div className="relative">
              {s.alert && (
                <span className="mb-2 inline-block rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-400">
                  Acción requerida
                </span>
              )}
              <p className="font-display text-3xl font-bold text-white">{s.value}</p>
              <p className="mt-1 text-xs text-white/50">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40">
          Acciones Rápidas
        </h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href="/admin/productos/nuevo"
            className="flex items-center gap-2 rounded-xl bg-bg-secondary/5 border border-white/8 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-bg-secondary/10 hover:text-white"
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
          <Link
            href="/admin/productos?filter=sin-familia"
            className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 text-sm font-semibold text-amber-400 transition hover:bg-amber-500/20"
          >
            Etiquetar familias olfativas
          </Link>
          <Link
            href="/catalogo"
            target="_blank"
            className="flex items-center gap-2 rounded-xl bg-bg-secondary/5 border border-white/8 px-4 py-2.5 text-sm font-semibold text-white/50 transition hover:text-white"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Ver tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
