import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import PedidoEstadoSelector from "@/components/admin/PedidoEstadoSelector";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Pedido #${id} | Admin KLP` };
}

const ESTADO_BADGE: Record<string, string> = {
  Pendiente:  "bg-yellow-500/10 text-yellow-400",
  Confirmado: "bg-blue-500/10 text-blue-400",
  Enviado:    "bg-purple-500/10 text-purple-400",
  Entregado:  "bg-emerald-500/10 text-emerald-400",
  Cancelado:  "bg-red-500/10 text-red-400",
};

export default async function PedidoDetailPage({ params }: Props) {
  const { id } = await params;
  const pedidoId = parseInt(id, 10);
  if (isNaN(pedidoId)) notFound();

  const pedido = await prisma.pedido.findUnique({
    where: { pedidoId },
    include: {
      cliente: true,
      detalles: {
        include: {
          variante: {
            include: {
              tipoVariante: true,
              producto: { include: { marca: true } },
            },
          },
        },
        orderBy: { detalleId: "asc" },
      },
    },
  });

  if (!pedido) notFound();

  const fecha = new Date(pedido.fechaCreacion).toLocaleDateString("es-DO", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <div className="mb-5 flex items-center gap-2 text-xs text-white/30">
        <Link href="/admin/pedidos" className="transition hover:text-white">Pedidos</Link>
        <span>/</span>
        <span className="text-white/60">#{pedido.pedidoId}</span>
      </div>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-xl text-white">Pedido #{pedido.pedidoId}</h1>
          <p className="mt-0.5 text-xs capitalize text-white/30">{fecha}</p>
        </div>
        <PedidoEstadoSelector pedidoId={pedido.pedidoId} estadoActual={pedido.estado} />
      </div>

      <div className="space-y-5">
        {/* Cliente */}
        <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-white/30">
            Cliente
          </h2>
          {pedido.cliente ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/25">Nombre</p>
                <p className="mt-0.5 text-sm text-white/80">{pedido.cliente.nombre}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/25">Email</p>
                <p className="mt-0.5 text-sm text-white/80">{pedido.cliente.email}</p>
              </div>
              {pedido.cliente.telefono && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-white/25">Teléfono</p>
                  <p className="mt-0.5 text-sm text-white/80">{pedido.cliente.telefono}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-white/40">Sin cliente asociado</p>
          )}
        </section>

        {/* Dirección */}
        {pedido.direccionEnvio && (
          <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-white/30">
              Dirección de Envío
            </h2>
            <p className="whitespace-pre-wrap text-sm text-white/70">{pedido.direccionEnvio}</p>
          </section>
        )}

        {/* Items */}
        <section className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
          <div className="p-5 pb-0">
            <h2 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-white/30">
              Productos
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-white/5">
                <th className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-white/25">Producto</th>
                <th className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-white/25">Variante</th>
                <th className="px-5 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-white/25">Cant.</th>
                <th className="px-5 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-white/25">Precio</th>
                <th className="px-5 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-white/25">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pedido.detalles.map((d) => (
                <tr key={d.detalleId}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-white/90">{d.variante.producto.nombre}</p>
                    <p className="text-[11px] text-white/40">{d.variante.producto.marca.nombre}</p>
                  </td>
                  <td className="px-5 py-3 text-white/60">{d.variante.tipoVariante.nombre}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-white/70">{d.cantidad}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-white/70">
                    {formatPrice(Number(d.precioUnitario))}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums font-semibold text-white">
                    {formatPrice(Number(d.subtotal))}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10">
                <td colSpan={4} className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-white/40">
                  Total
                </td>
                <td className="px-5 py-3 text-right text-base font-bold text-white">
                  {formatPrice(Number(pedido.total))}
                </td>
              </tr>
            </tfoot>
          </table>
        </section>

        {/* Meta */}
        <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-white/30">
            Información del Pedido
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/25">Estado</p>
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${ESTADO_BADGE[pedido.estado] ?? "bg-white/10 text-white/50"}`}>
                {pedido.estado}
              </span>
            </div>
            {pedido.metodoPago && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/25">Método de Pago</p>
                <p className="mt-0.5 text-sm text-white/80">{pedido.metodoPago}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
