import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Pedidos | Admin KLP" };

const ESTADOS = ["Todos", "Pendiente", "Confirmado", "Enviado", "Entregado", "Cancelado"] as const;
const PAGE_SIZE = 25;

type SearchParams = Promise<{ estado?: string; page?: string }>;

function estadoBadge(estado: string) {
  const map: Record<string, string> = {
    Pendiente:   "bg-yellow-500/10 text-yellow-400",
    Confirmado:  "bg-blue-500/10 text-blue-400",
    Enviado:     "bg-purple-500/10 text-purple-400",
    Entregado:   "bg-emerald-500/10 text-emerald-400",
    Cancelado:   "bg-red-500/10 text-red-400",
  };
  return map[estado] ?? "bg-bg-secondary/10 text-white/50";
}

export default async function AdminPedidosPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const estadoFilter = params.estado && params.estado !== "Todos" ? params.estado : undefined;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const where = estadoFilter ? { estado: estadoFilter } : {};

  const [total, pedidos, counts] = await Promise.all([
    prisma.pedido.count({ where }),
    prisma.pedido.findMany({
      where,
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      orderBy: { fechaCreacion: "desc" },
      include: {
        cliente: { select: { nombre: true, email: true, telefono: true } },
        detalles: {
          select: { cantidad: true, precioUnitario: true },
        },
      },
    }),
    // Count per estado for tab badges
    prisma.pedido.groupBy({
      by: ["estado"],
      _count: { estado: true },
    }),
  ]);

  const countMap = Object.fromEntries(counts.map((c) => [c.estado, c._count.estado]));
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const activeEstado = params.estado ?? "Todos";

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl text-white">Pedidos</h1>
        <p className="mt-0.5 text-sm text-white/40">{total} pedidos</p>
      </div>

      {/* Estado tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {ESTADOS.map((e) => {
          const count = e === "Todos"
            ? counts.reduce((s, c) => s + c._count.estado, 0)
            : countMap[e] ?? 0;
          const active = activeEstado === e;
          return (
            <Link
              key={e}
              href={e === "Todos" ? "/admin/pedidos" : `/admin/pedidos?estado=${e}`}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? "border-brand-cyan bg-brand-cyan/10 text-accent-blue"
                  : "border-white/10 text-white/50 hover:border-white/20 hover:text-white"
              }`}
            >
              {e}
              {count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  active ? "bg-brand-cyan/20" : "bg-bg-secondary/10"
                }`}>
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-bg-secondary/[0.02]">
        {pedidos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-4xl">📦</p>
            <p className="mt-4 text-sm font-medium text-white/50">No hay pedidos aún</p>
            <p className="mt-1 text-xs text-white/25">
              Los pedidos aparecerán aquí cuando los clientes realicen compras.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/30">#</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/30">Cliente</th>
                <th className="hidden px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/30 md:table-cell">Items</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/30">Total</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/30">Estado</th>
                <th className="hidden px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/30 lg:table-cell">Fecha</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pedidos.map((p) => (
                <tr key={p.pedidoId} className="transition hover:bg-bg-secondary/[0.02]">
                  <td className="px-4 py-3 font-mono text-xs text-white/40">#{p.pedidoId}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-white/90">
                      {p.cliente?.nombre ?? "Cliente desconocido"}
                    </p>
                    <p className="text-[11px] text-white/40">{p.cliente?.email}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-white/50 md:table-cell">
                    {p.detalles.reduce((s, d) => s + d.cantidad, 0)} unid.
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-white">
                    {formatPrice(Number(p.total))}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${estadoBadge(p.estado)}`}>
                      {p.estado}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-white/40 lg:table-cell">
                    {new Date(p.fechaCreacion).toLocaleDateString("es-DO", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/pedidos/${p.pedidoId}`}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/50 transition hover:border-white/20 hover:text-white"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <span className="text-white/40">Página {page} de {totalPages}</span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/pedidos?${estadoFilter ? `estado=${estadoFilter}&` : ""}page=${page - 1}`}
                className="rounded-lg border border-white/10 px-4 py-2 text-white/60 transition hover:text-white"
              >
                ← Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/pedidos?${estadoFilter ? `estado=${estadoFilter}&` : ""}page=${page + 1}`}
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
