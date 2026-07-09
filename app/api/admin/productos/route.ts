import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth.server";

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let n = 2;
  while (await prisma.producto.findUnique({ where: { slug }, select: { productoId: true } })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

type VarianteInput = {
  tipoVarianteId: number;
  precio: number;
  precioComparacion: number | null;
  stock: number;
};

type Body = {
  nombre: string;
  marcaId: number;
  generoId: number;
  concentracionId: number | null;
  descripcionCorta: string | null;
  variantes: VarianteInput[];
};

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  if (!body.nombre?.trim() || !body.marcaId || !body.generoId) {
    return NextResponse.json({ error: "Campos obligatorios faltantes" }, { status: 400 });
  }
  if (!body.variantes || body.variantes.length === 0) {
    return NextResponse.json({ error: "Se requiere al menos una variante" }, { status: 400 });
  }
  if (body.variantes.some((v) => !v.precio || v.precio <= 0)) {
    return NextResponse.json({ error: "Todas las variantes deben tener un precio válido" }, { status: 400 });
  }

  try {
    const slug = await uniqueSlug(toSlug(body.nombre.trim()));

    const producto = await prisma.$transaction(async (tx) => {
      const p = await tx.producto.create({
        data: {
          nombre: body.nombre.trim(),
          slug,
          marcaId: body.marcaId,
          generoId: body.generoId,
          concentracionId: body.concentracionId ?? null,
          descripcionCorta: body.descripcionCorta?.trim() || null,
          activo: false,
          destacado: false,
        },
      });

      await tx.variantePrecio.createMany({
        data: body.variantes.map((v) => ({
          productoId: p.productoId,
          tipoVarianteId: v.tipoVarianteId,
          precio: v.precio,
          precioComparacion: v.precioComparacion ?? null,
          stock: v.stock ?? 0,
          activo: true,
        })),
      });

      return p;
    });

    return NextResponse.json({ productoId: producto.productoId }, { status: 201 });
  } catch (e) {
    console.error("Admin create producto error:", e);
    return NextResponse.json({ error: "Error al crear el producto" }, { status: 500 });
  }
}
