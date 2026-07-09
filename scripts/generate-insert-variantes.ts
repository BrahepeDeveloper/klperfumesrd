import * as fs from "fs";
import * as path from "path";

const dataFile = path.join(process.cwd(), "scripts/exports/klperfumes-export.json");
const data = JSON.parse(fs.readFileSync(dataFile, "utf-8"));

function escapeSql(val: any): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "number") return String(val);
  if (val instanceof Date) return `'${val.toISOString()}'`;
  const str = String(val).replace(/'/g, "''");
  return `'${str}'`;
}

const variantes = data.VariantesPrecios || [];

if (variantes.length === 0) {
  console.log("No hay variantes que insertar");
  process.exit(0);
}

const outputFile = path.join(process.cwd(), "scripts/exports/insert-variantes.sql");
let sql = "-- Inserciones de Variantes de Precio\n\n";

for (const v of variantes) {
  const values = [
    v.VarianteId,
    v.ProductoId,
    v.TipoVarianteId,
    escapeSql(v.Precio),
    v.PrecioComparacion === null ? "NULL" : escapeSql(v.PrecioComparacion),
    v.Stock,
    escapeSql(v.SKU),
    v.Activo ? "true" : "false",
  ];

  sql += `INSERT INTO "variantePrecio" ("varianteId", "productoId", "tipoVarianteId", "precio", "precioComparacion", "stock", "sku", "activo") VALUES (${values.join(", ")});\n`;
}

fs.writeFileSync(outputFile, sql);

console.log(`✅ SQL generado: ${outputFile}`);
console.log(`📊 Total de INSERT statements: ${variantes.length}`);
