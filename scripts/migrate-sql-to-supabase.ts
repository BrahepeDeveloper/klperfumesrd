import "dotenv/config";

/**
 * Migración: SQL Server → Supabase PostgreSQL
 *
 * Uso:
 *   npx tsx scripts/migrate-sql-to-supabase.ts
 *
 * Requiere .env con:
 * - DATABASE_URL (PostgreSQL Supabase)
 * - LOCAL_DB_URL (SQL Server local, opcional — default a BRAHEPE:1433)
 */

const sql = require("mssql");
const pg = require("pg");

const LOCAL_DB_URL =
  process.env.LOCAL_DB_URL ||
  "sqlserver://localhost:1433;database=KLPerfumesDB;user=klperfumes_app;password=KLp3rf37356Rd_2026!;encrypt=true;trustServerCertificate=true";

const SUPABASE_URL = process.env.DATABASE_URL;

if (!SUPABASE_URL) {
  console.error("❌ DATABASE_URL no configurada");
  process.exit(1);
}

// Parsear conexión SQL Server
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

// Configurar cliente PostgreSQL
const pgClient = new pg.Client(SUPABASE_URL);

async function migrate() {
  console.log("🚀 Iniciando migración SQL Server → Supabase\n");

  let sqlPool: any;
  try {
    // Conectar a SQL Server
    sqlPool = new sql.ConnectionPool(sqlConfig);
    await sqlPool.connect();
    console.log("✓ Conectado a SQL Server");

    // Conectar a Supabase
    await pgClient.connect();
    console.log("✓ Conectado a Supabase PostgreSQL\n");

    // Orden de inserción (respeta foreign keys)
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

    const tableMappings: Record<string, { pg: string; columns: string[] }> = {
      Marcas: { pg: "marca", columns: ["MarcaId", "nombre", "slug", "LogoUrl", "activo"] },
      Generos: { pg: "genero", columns: ["GeneroId", "nombre", "slug"] },
      Concentraciones: { pg: "concentracion", columns: ["ConcentracionId", "nombre", "Abreviatura"] },
      FamiliasOlfativas: { pg: "familiaOlfativa", columns: ["FamiliaId", "nombre", "slug"] },
      Temporadas: { pg: "temporada", columns: ["TemporadaId", "nombre", "slug"] },
      Ocasiones: { pg: "ocasion", columns: ["OcasionId", "nombre", "slug"] },
      NotasOlfativas: { pg: "notaOlfativa", columns: ["NotaId", "nombre", "IconoUrl"] },
      TiposVariante: { pg: "tipoVariante", columns: ["TipoVarianteId", "nombre", "MlEquivalente", "orden"] },
      Productos: {
        pg: "producto",
        columns: [
          "ProductoId", "nombre", "slug", "MarcaId", "GeneroId", "ConcentracionId",
          "ContenidoMlOriginal", "DescripcionCorta", "DescripcionLarga", "sku",
          "destacado", "activo", "FechaCreacion", "FechaActualizacion",
        ],
      },
      ProductoImagenes: {
        pg: "productoImagen",
        columns: ["ImagenId", "ProductoId", "UrlWebp", "TextoAlternativo", "EsPrincipal", "orden"],
      },
      VariantesPrecios: {
        pg: "variantePrecio",
        columns: ["VarianteId", "ProductoId", "TipoVarianteId", "precio", "PrecioComparacion", "stock", "sku", "activo"],
      },
      ProductoNotas: {
        pg: "productoNota",
        columns: ["ProductoId", "NotaId", "posicion", "orden"],
      },
      ProductoFamiliaOlfativa: {
        pg: "productoFamiliaOlfativa",
        columns: ["ProductoId", "FamiliaId"],
      },
      ProductoTemporada: {
        pg: "productoTemporada",
        columns: ["ProductoId", "TemporadaId"],
      },
      ProductoOcasion: {
        pg: "productoOcasion",
        columns: ["ProductoId", "OcasionId"],
      },
      Usuarios: {
        pg: "usuario",
        columns: ["UsuarioId", "nombre", "email", "PasswordHash", "rol", "activo", "UltimoAcceso", "FechaCreacion"],
      },
      Clientes: {
        pg: "cliente",
        columns: ["ClienteId", "nombre", "email", "telefono", "FechaCreacion"],
      },
      Pedidos: {
        pg: "pedido",
        columns: ["PedidoId", "ClienteId", "estado", "total", "MetodoPago", "DireccionEnvio", "FechaCreacion"],
      },
      DetallePedidos: {
        pg: "detallePedido",
        columns: ["DetalleId", "PedidoId", "VarianteId", "cantidad", "PrecioUnitario", "subtotal"],
      },
    };

    for (const sqlTable of tables) {
      const mapping = tableMappings[sqlTable];
      if (!mapping) {
        console.warn(`⚠️  Tabla no mapeada: ${sqlTable}`);
        continue;
      }

      try {
        // Leer datos de SQL Server
        const query = `SELECT ${mapping.columns.join(", ")} FROM [${sqlTable}]`;
        const result = await sqlPool.request().query(query);
        const rows = result.recordset;

        if (rows.length === 0) {
          console.log(`  ℹ️  ${sqlTable}: 0 registros`);
          continue;
        }

        // Convertir nombres de columnas a lowercase (PostgreSQL)
        const pgRows = rows.map((row: any) => {
          const newRow: any = {};
          for (const [key, val] of Object.entries(row)) {
            // Convertir a camelCase para PostgreSQL (ej: MarcaId → marcaId)
            const pgKey = (key as string).charAt(0).toLowerCase() + (key as string).slice(1);
            newRow[pgKey] = val;
          }
          return newRow;
        });

        // Insertar en Supabase
        const placeholders = Object.keys(pgRows[0])
          .map((_, i) => `$${i + 1}`)
          .join(", ");
        const columns = Object.keys(pgRows[0])
          .map((col) => `"${col}"`)
          .join(", ");
        const insertQuery = `INSERT INTO klperfumes."${mapping.pg}" (${columns}) VALUES (${placeholders})`;

        let inserted = 0;
        for (const row of pgRows) {
          const values = Object.values(row);
          try {
            await pgClient.query(insertQuery, values);
            inserted++;
          } catch (e: any) {
            if (!e.message.includes("duplicate key")) {
              console.error(`    ❌ Error insertando fila:`, e.message);
            }
          }
        }

        console.log(`  ✓ ${sqlTable}: ${inserted}/${rows.length} registros insertados`);
      } catch (e: any) {
        console.error(`  ❌ ${sqlTable}: ${e.message}`);
      }
    }

    console.log("\n✅ Migración completada");
  } catch (e: any) {
    console.error("❌ Error:", e.message);
    process.exit(1);
  } finally {
    if (sqlPool) await sqlPool.close();
    await pgClient.end();
  }
}

migrate();
