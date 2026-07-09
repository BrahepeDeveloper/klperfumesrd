import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.DATABASE_URL ?? "";

  // Diagnóstico de la URL (sin exponer la contraseña)
  const urlInfo = {
    usesPooler: url.includes("pooler.supabase.com"),
    usesPgbouncer: url.includes("pgbouncer=true"),
    port: url.includes(":6543") ? "6543 (pooler)" : url.includes(":5432") ? "5432 (directo)" : "?",
    host: url.split("@")[1]?.split(":")[0] ?? "?",
  };

  try {
    const [ocasion, temporada, familia, genero, marca] = await Promise.all([
      prisma.ocasion.findMany({ orderBy: { nombre: "asc" } }),
      prisma.temporada.findMany({ orderBy: { nombre: "asc" } }),
      prisma.familiaOlfativa.findMany({ orderBy: { nombre: "asc" } }),
      prisma.genero.findMany({ orderBy: { nombre: "asc" } }),
      prisma.marca.findMany({ take: 3 }),
    ]);

    return NextResponse.json({
      ok: true,
      urlInfo,
      counts: {
        ocasion: ocasion.length,
        temporada: temporada.length,
        familia: familia.length,
        genero: genero.length,
        marca: marca.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        urlInfo,
        error: error instanceof Error ? error.message : String(error),
        errorName: error instanceof Error ? error.name : "Unknown",
      },
      { status: 500 }
    );
  }
}
