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

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const marcaId = parseInt(id, 10);
  if (isNaN(marcaId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  let body: { nombre?: string; activo?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  try {
    const data: { nombre?: string; slug?: string; activo?: boolean } = {};
    if (body.nombre !== undefined) {
      data.nombre = body.nombre.trim();
      data.slug = toSlug(body.nombre);
    }
    if (body.activo !== undefined) data.activo = body.activo;

    await prisma.marca.update({ where: { marcaId }, data });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Unique constraint") || msg.includes("unique")) {
      return NextResponse.json(
        { error: "Ya existe una marca con ese nombre" },
        { status: 409 }
      );
    }
    console.error("Admin marca update error:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
