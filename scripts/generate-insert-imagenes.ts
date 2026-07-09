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

const imagenes = data.ProductoImagenes || [];

if (imagenes.length === 0) {
  console.log("No hay imágenes que insertar");
  process.exit(0);
}

const outputFile = path.join(process.cwd(), "scripts/exports/insert-imagenes.sql");
let sql = "-- Inserciones de Imágenes de Producto\n\n";

for (const img of imagenes) {
  const values = [
    img.ImagenId,
    img.ProductoId,
    escapeSql(img.UrlWebp),
    escapeSql(img.TextoAlternativo),
    img.EsPrincipal ? "true" : "false",
    img.Orden,
  ];

  sql += `INSERT INTO "productoImagen" ("imagenId", "productoId", "urlWebp", "textoAlternativo", "esPrincipal", "orden") VALUES (${values.join(", ")});\n`;
}

fs.writeFileSync(outputFile, sql);

console.log(`✅ SQL generado: ${outputFile}`);
console.log(`📊 Total de INSERT statements: ${imagenes.length}`);
