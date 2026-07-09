import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, setSessionCookie } from "@/lib/auth.server";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 });
  }

  const user = await prisma.usuario.findFirst({
    where: { email: email.toLowerCase().trim(), activo: true },
  });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    // Generic error to avoid user enumeration
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  }

  await setSessionCookie(user.usuarioId);

  // Update last access
  await prisma.usuario.update({
    where: { usuarioId: user.usuarioId },
    data: { ultimoAcceso: new Date() },
  });

  return NextResponse.json({ ok: true, nombre: user.nombre, rol: user.rol });
}
