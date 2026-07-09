import * as fs from "fs";
import * as path from "path";

const dataFile = path.join(process.cwd(), "scripts/exports/klperfumes-export.json");
const data = JSON.parse(fs.readFileSync(dataFile, "utf-8"));

const outputFile = path.join(process.cwd(), "scripts/exports/insert-relaciones.sql");
let sql = "-- Inserciones de Relaciones (Filtros)\n\n";

// ProductoFamiliaOlfativa
const productoFamilias = data.ProductoFamiliaOlfativa || [];
if (productoFamilias.length > 0) {
  sql += "-- Familia Olfativa\n";
  for (const pf of productoFamilias) {
    sql += `INSERT INTO "productoFamiliaOlfativa" ("productoId", "familiaId") VALUES (${pf.ProductoId}, ${pf.FamiliaId});\n`;
  }
  sql += "\n";
}

// ProductoTemporada
const productoTemporadas = data.ProductoTemporada || [];
if (productoTemporadas.length > 0) {
  sql += "-- Temporada\n";
  for (const pt of productoTemporadas) {
    sql += `INSERT INTO "productoTemporada" ("productoId", "temporadaId") VALUES (${pt.ProductoId}, ${pt.TemporadaId});\n`;
  }
  sql += "\n";
}

// ProductoOcasion
const productoOcasiones = data.ProductoOcasion || [];
if (productoOcasiones.length > 0) {
  sql += "-- Ocasión\n";
  for (const po of productoOcasiones) {
    sql += `INSERT INTO "productoOcasion" ("productoId", "ocasionId") VALUES (${po.ProductoId}, ${po.OcasionId});\n`;
  }
  sql += "\n";
}

// ProductoNota
const productoNotas = data.ProductoNotas || [];
if (productoNotas.length > 0) {
  sql += "-- Notas Olfativas\n";
  for (const pn of productoNotas) {
    sql += `INSERT INTO "productoNota" ("productoId", "notaId", "posicion", "orden") VALUES (${pn.ProductoId}, ${pn.NotaId}, '${pn.Posicion}', ${pn.Orden});\n`;
  }
  sql += "\n";
}

fs.writeFileSync(outputFile, sql);

const totalRelaciones = productoFamilias.length + productoTemporadas.length + productoOcasiones.length + productoNotas.length;

console.log(`✅ SQL generado: ${outputFile}`);
console.log(`📊 Total de INSERT statements: ${totalRelaciones}`);
console.log(`   - Familia Olfativa: ${productoFamilias.length}`);
console.log(`   - Temporada: ${productoTemporadas.length}`);
console.log(`   - Ocasión: ${productoOcasiones.length}`);
console.log(`   - Notas: ${productoNotas.length}`);
