import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth.server";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const productoId = parseInt(id, 10);
  if (isNaN(productoId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  let body: {
    descripcionCorta?: string;
    activo?: boolean;
    destacado?: boolean;
    generoId?: number;
    concentracionId?: number | null;
    familiaIds?: number[];
    variantes?: {
      varianteId: number;
      precio: number;
      precioComparacion: number | null;
      stock: number;
      activo: boolean;
    }[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Update main product
      await tx.producto.update({
        where: { productoId },
        data: {
          ...(body.descripcionCorta !== undefined && {
            descripcionCorta: body.descripcionCorta || null,
          }),
          ...(body.activo !== undefined && { activo: body.activo }),
          ...(body.destacado !== undefined && { destacado: body.destacado }),
          ...(body.generoId !== undefined && { generoId: body.generoId }),
          ...(body.concentracionId !== undefined && {
            concentracionId: body.concentracionId,
          }),
          fechaActualizacion: new Date(),
        },
      });

      // Sync familias olfativas
      if (body.familiaIds !== undefined) {
        await tx.productoFamiliaOlfativa.deleteMany({ where: { productoId } });
        if (body.familiaIds.length > 0) {
          await tx.productoFamiliaOlfativa.createMany({
            data: body.familiaIds.map((familiaId) => ({ productoId, familiaId })),
          });
        }
      }

      // Update variants
      if (body.variantes) {
        for (const v of body.variantes) {
          await tx.variantePrecio.update({
            where: { varianteId: v.varianteId },
            data: {
              precio: v.precio,
              precioComparacion: v.precioComparacion ?? null,
              stock: v.stock,
              activo: v.activo,
            },
          });
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Admin product update error:", e);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
