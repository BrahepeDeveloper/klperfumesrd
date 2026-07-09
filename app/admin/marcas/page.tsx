import { prisma } from "@/lib/prisma";
import AdminMarcaRow from "@/components/admin/AdminMarcaRow";

export const metadata = { title: "Marcas | Admin KLP" };

export default async function AdminMarcasPage() {
  const marcas = await prisma.marca.findMany({
    orderBy: { nombre: "asc" },
    select: {
      marcaId: true,
      nombre: true,
      slug: true,
      activo: true,
      _count: { select: { productos: true } },
    },
  });

  const totalProductos = marcas.reduce((sum, m) => sum + m._count.productos, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-white">Marcas</h1>
        <p className="mt-0.5 text-sm text-white/40">
          {marcas.length} marcas · {totalProductos.toLocaleString("es-DO")} productos
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-bg-secondary/[0.02]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/30">
                Marca
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/30">
                Productos
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/30">
                Estado
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {marcas.map((m) => (
              <AdminMarcaRow key={m.marcaId} marca={m} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
