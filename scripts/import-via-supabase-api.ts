import "dotenv/config";
import * as fs from "fs";
import * as path from "path";

/**
 * Importa datos a Supabase vía REST API
 *
 * Requiere:
 * - SUPABASE_URL: https://xxxx.supabase.co
 * - SUPABASE_ANON_KEY: anon key desde Supabase Settings → API
 */

const SUPABASE_URL = process.env.SUPABASE_URL || "https://skavgqahgazswhivxltk.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_KEY) {
  console.error("❌ SUPABASE_ANON_KEY no configurada");
  console.error("   Ve a Supabase → Settings → API → Copy anon key");
  process.exit(1);
}

const tableMappings: Record<string, string> = {
  Marcas: "marca",
  Generos: "genero",
  Concentraciones: "concentracion",
  FamiliasOlfativas: "familiaOlfativa",
  Temporadas: "temporada",
  Ocasiones: "ocasion",
  NotasOlfativas: "notaOlfativa",
  TiposVariante: "tipoVariante",
  Productos: "producto",
  ProductoImagenes: "productoImagen",
  VariantesPrecios: "variantePrecio",
  ProductoNotas: "productoNota",
  ProductoFamiliaOlfativa: "productoFamiliaOlfativa",
  ProductoTemporada: "productoTemporada",
  ProductoOcasion: "productoOcasion",
  Usuarios: "usuario",
  Clientes: "cliente",
  Pedidos: "pedido",
  DetallePedidos: "detallePedido",
};

async function importData() {
  console.log("📥 Importando datos a Supabase vía REST API\n");

  const dataFile = path.join(process.cwd(), "scripts/exports/klperfumes-export.json");
  if (!fs.existsSync(dataFile)) {
    console.error(`❌ Archivo no encontrado: ${dataFile}`);
    console.error("   Ejecuta primero: npx tsx scripts/export-sql-to-json.ts");
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dataFile, "utf-8"));

  // Orden de inserción (respeta foreign keys)
  const order = [
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

  for (const sqlTable of order) {
    const rows = data[sqlTable] || [];
    if (rows.length === 0) {
      console.log(`  ℹ️  ${sqlTable}: 0 registros`);
      continue;
    }

    const pgTable = tableMappings[sqlTable];
    if (!pgTable) {
      console.warn(`⚠️  Tabla no mapeada: ${sqlTable}`);
      continue;
    }

    try {
      // Convertir nombres de columnas a camelCase
      const mappedRows = rows.map((row: any) => {
        const newRow: any = {};
        for (const [key, val] of Object.entries(row)) {
          // MarcaId → marcaId
          const pgKey = (key as string).charAt(0).toLowerCase() + (key as string).slice(1);
          newRow[pgKey] = val;
        }
        return newRow;
      });

      // Insertar en lotes de 100
      const batchSize = 100;
      let inserted = 0;

      for (let i = 0; i < mappedRows.length; i += batchSize) {
        const batch = mappedRows.slice(i, i + batchSize);

        try {
          const response = await fetch(
            `${SUPABASE_URL}/rest/v1/${pgTable}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey: SUPABASE_KEY,
                Prefer: "return=minimal",
              },
              body: JSON.stringify(batch),
            }
          );

          if (response.ok) {
            inserted += batch.length;
          } else {
            const error = await response.text();
            console.error(`    ❌ Error: ${error}`);
            break;
          }
        } catch (e: any) {
          console.error(`    ❌ Error en lote: ${e.message}`);
          break;
        }
      }

      console.log(`  ✓ ${sqlTable}: ${inserted}/${rows.length} registros insertados`);
    } catch (e: any) {
      console.error(`  ❌ ${sqlTable}: ${e.message}`);
    }
  }

  console.log("\n✅ Importación completada");
}

importData();
