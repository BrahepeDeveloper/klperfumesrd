import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AdminProductForm from "@/components/admin/AdminProductForm";

type Props = { params: Promise<{ id: string }> };

async function getData(id: string) {
  const productoId = parseInt(id, 10);
  if (isNaN(productoId)) return null;

  const [product, familias, generos, concentraciones] = await Promise.all([
    prisma.producto.findUnique({
      where: { productoId },
      include: {
        marca: true,
        genero: true,
        concentracion: true,
        imagenes: { orderBy: [{ esPrincipal: "desc" }, { orden: "asc" }] },
        variantes: {
          include: { tipoVariante: true },
          orderBy: { tipoVariante: { orden: "asc" } },
        },
        familiasOlfativas: { include: { familia: true } },
        temporadas: { include: { temporada: true } },
        ocasiones: { include: { ocasion: true } },
      },
    }),
    prisma.familiaOlfativa.findMany({ orderBy: { nombre: "asc" } }),
    prisma.genero.findMany({ orderBy: { nombre: "asc" } }),
    prisma.concentracion.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  return { product, familias, generos, concentraciones };
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const data = await getData(id);
  if (!data?.product) return {};
  return { title: `Editar: ${data.product.nombre} | Admin KLP` };
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const data = await getData(id);
  if (!data?.product) notFound();

  const { product, familias, generos, concentraciones } = data;

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-xl text-white">{product.nombre}</h1>
        <p className="mt-1 text-xs text-white/40">{product.marca.nombre}</p>
      </div>
      <AdminProductForm
        product={{
          productoId: product.productoId,
          nombre: product.nombre,
          slug: product.slug,
          descripcionCorta: product.descripcionCorta ?? "",
          descripcionLarga: product.descripcionLarga ?? "",
          activo: product.activo,
          destacado: product.destacado,
          generoId: product.generoId,
          concentracionId: product.concentracionId,
          contenidoMlOriginal: product.contenidoMlOriginal,
          familias: product.familiasOlfativas.map((pf) => ({
            familiaId: pf.familiaId,
            nombre: pf.familia.nombre,
          })),
          variantes: product.variantes.map((v) => ({
            varianteId: v.varianteId,
            nombre: v.tipoVariante.nombre,
            precio: Number(v.precio),
            precioComparacion: v.precioComparacion
              ? Number(v.precioComparacion)
              : null,
            stock: v.stock,
            activo: v.activo,
          })),
          imagenes: product.imagenes.map((i) => ({
            imagenId: i.imagenId,
            urlWebp: i.urlWebp,
            esPrincipal: i.esPrincipal,
          })),
        }}
        options={{ familias, generos, concentraciones }}
      />
    </div>
  );
}
