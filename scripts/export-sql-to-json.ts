import "dotenv/config";
import * as fs from "fs";
import * as path from "path";

const sql = require("mssql");

const sqlConfig = {
  server: "localhost",
  database: "KLPerfumesDB",
  user: "klperfumes_app",
  password: "KLp3rf37356Rd_2026!",
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

const tables = [
  "Marcas",
  "Generos",
  "Concentraciones",
  "FamiliasOlfativas",
  "Temporadas",
  "Ocasiones",
  "NotasOlfativas",
  "TiposVariante",
  "Productos",
  "ProductoImagenes",
  "VariantesPrecios",
  "ProductoNotas",
  "ProductoFamiliaOlfativa",
  "ProductoTemporada",
  "ProductoOcasion",
  "Usuarios",
  "Clientes",
  "Pedidos",
  "DetallePedidos",
];

async function exportToJson() {
  console.log("📤 Exportando datos de SQL Server a JSON\n");

  let sqlPool: any;
  const outputDir = path.join(process.cwd(), "scripts/exports");

  // Crear directorio si no existe
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    sqlPool = new sql.ConnectionPool(sqlConfig);
    await sqlPool.connect();
    console.log("✓ Conectado a SQL Server\n");

    const allData: Record<string, any[]> = {};

    for (const table of tables) {
      try {
        const result = await sqlPool.request().query(`SELECT * FROM [${table}]`);
        allData[table] = result.recordset;
        console.log(`  ✓ ${table}: ${result.recordset.length} registros`);
      } catch (e: any) {
        console.error(`  ❌ ${table}: ${e.message}`);
      }
    }

    // Guardar todo en un único JSON
    const outputFile = path.join(outputDir, "klperfumes-export.json");
    fs.writeFileSync(outputFile, JSON.stringify(allData, null, 2));

    console.log(`\n📁 Datos exportados a: ${outputFile}`);
    console.log(`📊 Total de tablas: ${Object.keys(allData).length}`);
    console.log(`\n✅ Exportación completada`);
    console.log(`\nPróximo paso: Importar los datos en Supabase SQL Editor`);
    console.log(`Archivo: scripts/exports/klperfumes-export.json`);
  } catch (e: any) {
    console.error("❌ Error:", e.message);
    process.exit(1);
  } finally {
    if (sqlPool) await sqlPool.close();
  }
}

exportToJson();
