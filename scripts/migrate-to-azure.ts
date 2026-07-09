import "dotenv/config";
import { PrismaClient as LocalPrisma } from "@prisma/client";

/**
 * Migración local → Azure SQL Database
 *
 * Uso:
 *   npm run db:migrate-azure -- --from-local --to-azure
 *
 * Requiere:
 * - LOCAL_DB_URL="sqlserver://localhost:1433;database=KLPerfumesDB;..."
 * - AZURE_DB_URL="sqlserver://server.database.windows.net:1433;database=KLPerfumesDB;..."
 */

const LOCAL_DB_URL =
  process.env.LOCAL_DB_URL ||
  "sqlserver://localhost:1433;database=KLPerfumesDB;user=klperfumes_app;password=KLp3rf37356Rd_2026!;encrypt=true;trustServerCertificate=true";

const AZURE_DB_URL = process.env.AZURE_DB_URL;

if (!AZURE_DB_URL) {
  console.error("❌ AZURE_DB_URL no configurada. Ej:");
  console.error(
    "  sqlserver://klperfumes.database.windows.net:1433;database=KLPerfumesDB;user=admin@klperfumes;password=PASSWORD;encrypt=true;trustServerCertificate=false"
  );
  process.exit(1);
}

async function migrateData() {
  console.log("🔄 Iniciando migración: Local → Azure SQL");

  // Conectar a BD local (con Prisma generado localmente)
  const localDb = new LocalPrisma({
    datasources: {
      db: { url: LOCAL_DB_URL },
    },
  });

  try {
    console.log("✓ Conectado a BD local");

    // Leer todos los datos de referencia + productos
    const [generos, familias, temporadas, ocasiones, marcas, productos] =
      await Promise.all([
        localDb.genero.findMany(),
        localDb.familiaOlfativa.findMany(),
        localDb.temporada.findMany(),
        localDb.ocasion.findMany(),
        localDb.marca.findMany(),
        localDb.producto.findMany({
          include: {
            variantes: true,
            imagenes: true,
            familiasOlfativas: true,
            temporadas: true,
            ocasiones: true,
          },
        }),
      ]);

    console.log(`  Géneros: ${generos.length}`);
    console.log(`  Familias: ${familias.length}`);
    console.log(`  Temporadas: ${temporadas.length}`);
    console.log(`  Ocasiones: ${ocasiones.length}`);
    console.log(`  Marcas: ${marcas.length}`);
    console.log(`  Productos: ${productos.length}`);

    console.log("\n⚠️  INSTRUCCIONES MANUALES REQUERIDAS:");
    console.log("1. Ve a https://portal.azure.com");
    console.log("2. Crea un SQL Server + BD:");
    console.log("   - Server name: klperfumes");
    console.log("   - Region: East US (o cercana a tu zona)");
    console.log("   - Admin login: adminuser");
    console.log("   - Password: [genera uno fuerte]");
    console.log("3. Copia la cadena de conexión (AZURE_DB_URL)");
    console.log("4. Configura la conexión en el firewall");
    console.log("   - Abre puerto 1433 (SQL Server port)");
    console.log("   - O añade tu IP a 'Firewalls and virtual networks'");
    console.log("\n5. Una vez listo, ejecuta:");
    console.log("   AZURE_DB_URL='sqlserver://...' npm run db:migrate-azure");
    console.log("\n📄 BACKUP LOCAL creado: C:\\KLPERFUMESRD\\KLPerfumesDB_backup.bak");
    console.log("   (Puedes usarlo en Azure Portal → Import BACPAC como alternativa)");
  } finally {
    await localDb.$disconnect();
  }
}

migrateData().catch((e) => {
  console.error("❌ Error:", e.message);
  process.exit(1);
});
