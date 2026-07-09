import { prisma } from "@/lib/prisma";
import Link from "next/link";
import NuevoProductoForm from "@/components/admin/NuevoProductoForm";

export const metadata = { title: "Nuevo Producto | Admin KLP" };

export default async function NuevoProductoPage() {
  const [marcas, generos, concentraciones, tiposVariante] = await Promise.all([
    prisma.marca.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      select: { marcaId: true, nombre: true },
    }),
    prisma.genero.findMany({
      orderBy: { nombre: "asc" },
      select: { generoId: true, nombre: true },
    }),
    prisma.concentracion.findMany({
      orderBy: { nombre: "asc" },
      select: { concentracionId: true, nombre: true, abreviatura: true },
    }),
    prisma.tipoVariante.findMany({
      orderBy: { orden: "asc" },
      select: { tipoVarianteId: true, nombre: true, mlEquivalente: true },
    }),
  ]);

  return (
    <div className="max-w-2xl">
      {/* Breadcrumb */}
      <div className="mb-5 flex items-center gap-2 text-xs text-white/30">
        <Link href="/admin/productos" className="transition hover:text-white">
          Productos
        </Link>
        <span>/</span>
        <span className="text-white/60">Nuevo</span>
      </div>

      <div className="mb-6">
        <h1 className="font-display text-xl text-white">Nuevo Producto</h1>
        <p className="mt-0.5 text-xs text-white/30">
          El producto se crea inactivo y sin imagen. Edítalo después para completarlo.
        </p>
      </div>

      <NuevoProductoForm
        marcas={marcas}
        generos={generos}
        concentraciones={concentraciones}
        tiposVariante={tiposVariante}
      />
    </div>
  );
}
