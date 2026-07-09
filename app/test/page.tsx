export default function TestPage() {
  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>✅ Servidor está funcionando</h1>
      <p>Si ves esto, Next.js está corriendo correctamente en Vercel.</p>
      <hr style={{ margin: "2rem 0" }} />
      <h2>Diagnóstico:</h2>
      <ul>
        <li>✅ Build completado</li>
        <li>✅ Servidor respondiendo</li>
        <li>⏳ Verificando conexión a base de datos...</li>
      </ul>
      <p style={{ marginTop: "2rem", fontSize: "0.9rem", color: "#666" }}>
        Si no ves la página de inicio, el problema está en la conexión a Supabase.
      </p>
    </div>
  );
}
