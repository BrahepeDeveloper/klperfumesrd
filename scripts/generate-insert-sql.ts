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

// Solo genera para Productos (que falló)
const productos = data.Productos || [];

if (productos.length === 0) {
  console.log("No hay productos que insertar");
  process.exit(0);
}

const outputFile = path.join(process.cwd(), "scripts/exports/insert-productos.sql");
let sql = "-- Inserciones de Productos\n\n";

for (const p of productos) {
  const values = [
    p.ProductoId,
    escapeSql(p.Nombre),
    escapeSql(p.Slug),
    p.MarcaId,
    p.GeneroId,
    p.ConcentracionId === null ? "NULL" : p.ConcentracionId,
    p.ContenidoMlOriginal === null ? "NULL" : p.ContenidoMlOriginal,
    escapeSql(p.DescripcionCorta),
    escapeSql(p.DescripcionLarga),
    escapeSql(p.SKU),
    p.Destacado ? "true" : "false",
    p.Activo ? "true" : "false",
    escapeSql(p.FechaCreacion),
    escapeSql(p.FechaActualizacion),
  ];

  sql += `INSERT INTO producto ("productoId", "nombre", "slug", "marcaId", "generoId", "concentracionId", "contenidoMlOriginal", "descripcionCorta", "descripcionLarga", "sku", "destacado", "activo", "fechaCreacion", "fechaActualizacion") VALUES (${values.join(", ")});\n`;
}

fs.writeFileSync(outputFile, sql);

console.log(`✅ SQL generado: ${outputFile}`);
console.log(`📊 Total de INSERT statements: ${productos.length}`);
console.log(`\nCopia TODO el contenido del archivo y pégalo en Supabase SQL Editor.`);
