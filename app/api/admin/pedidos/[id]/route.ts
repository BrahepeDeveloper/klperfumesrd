import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth.server";
import { sendOrderConfirmation } from "@/lib/email";

const VALID_ESTADOS = ["Pendiente", "Confirmado", "Enviado", "Entregado", "Cancelado"] as const;

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const pedidoId = parseInt(id, 10);
  if (isNaN(pedidoId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  let body: { estado?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  if (!body.estado || !(VALID_ESTADOS as readonly string[]).includes(body.estado)) {
    return NextResponse.json(
      { error: `Estado inválido. Valores permitidos: ${VALID_ESTADOS.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.pedido.findUnique({
      where: { pedidoId },
      select: { estado: true },
    });

    await prisma.pedido.update({
      where: { pedidoId },
      data: { estado: body.estado },
    });

    // Send confirmation email only when transitioning to Confirmado
    if (body.estado === "Confirmado" && existing?.estado !== "Confirmado") {
      sendOrderConfirmation(pedidoId).catch((e) =>
        console.error("[email] sendOrderConfirmation failed:", e)
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Admin pedido update error:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
