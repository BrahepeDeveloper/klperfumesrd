import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DebugPage() {
  let error = null;
  let marcas = null;

  try {
    marcas = await prisma.marca.findMany({ take: 1 });
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace", fontSize: "0.9rem" }}>
      <h1>🔍 Debug Page</h1>

      <h2>Conexión a Base de Datos:</h2>
      {error ? (
        <div style={{
          background: "#fee",
          padding: "1rem",
          borderRadius: "4px",
          border: "1px solid #f99"
        }}>
          <strong>❌ ERROR:</strong>
          <pre>{error}</pre>
        </div>
      ) : marcas !== null ? (
        <div style={{
          background: "#efe",
          padding: "1rem",
          borderRadius: "4px",
          border: "1px solid #9f9"
        }}>
          <strong>✅ Conexión exitosa!</strong>
          <p>Marcas encontradas: {marcas.length}</p>
          {marcas.length > 0 && <pre>{JSON.stringify(marcas[0], null, 2)}</pre>}
        </div>
      ) : (
        <p>⏳ Conectando...</p>
      )}

      <h2 style={{ marginTop: "2rem" }}>Env vars:</h2>
      <pre>
DATABASE_URL: {process.env.DATABASE_URL?.substring(0, 50)}...
NODE_ENV: {process.env.NODE_ENV}
VERCEL_ENV: {process.env.VERCEL_ENV}
      </pre>
    </div>
  );
}
