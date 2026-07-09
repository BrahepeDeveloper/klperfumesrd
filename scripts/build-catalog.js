// Transforma el export crudo de la API del sitio viejo (data/klperfumes_raw_export.json)
// en un catálogo limpio y normalizado (data/catalog.json), listo para el seed en SQL Server.
//
// Uso: node scripts/build-catalog.js

const fs = require("fs");
const path = require("path");

const RAW_PATH = path.join(__dirname, "..", "data", "klperfumes_raw_export.json");
const OUT_PATH = path.join(__dirname, "..", "data", "catalog.json");

const raw = JSON.parse(fs.readFileSync(RAW_PATH, "utf8"));
const items = raw.articles.result.items;

// ---------------------------------------------------------------------------
// Normalización de texto
// ---------------------------------------------------------------------------
function clean(str) {
  return (str || "").replace(/\s+/g, " ").trim();
}

function stripAccents(str) {
  return str.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function slugify(str) {
  return stripAccents(clean(str))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------------------------------------------------------------------------
// Mapa de Géneros (measureUnitId de "categoryId" en el sistema viejo)
// ---------------------------------------------------------------------------
const GENERO_POR_CATEGORY_ID = {
  2: "Hombre",
  3: "Mujer",
  4: "Unisex",
  5: "Unisex", // "Sets" no es un género real; se tratan como Unisex + se marcan como set
};

// ---------------------------------------------------------------------------
// Mapa de Tipo de Variante + ml por measureUnitId (fijo, confirmado en el export)
// ---------------------------------------------------------------------------
const VARIANTE_POR_MEASURE_UNIT_ID = {
  1: { tipo: "Decant 5ML", ml: 5, esBotella: false },
  2: { tipo: "Decant 10ML", ml: 10, esBotella: false },
  3: { tipo: "Botella Completa", ml: 100, esBotella: true },
  4: { tipo: "Botella Completa", ml: 200, esBotella: true },
  5: { tipo: "Set", ml: null, esBotella: false },
  6: { tipo: "Botella Completa", ml: 60, esBotella: true },
  7: { tipo: "Botella Completa", ml: 75, esBotella: true },
  8: { tipo: "Botella Completa", ml: 50, esBotella: true },
};

// ---------------------------------------------------------------------------
// Mapa de familia olfativa a partir de la primera palabra del campo
// "description" del sitio viejo (texto libre, con errores de tipeo).
// Mapeo best-effort: solo se asigna cuando hay confianza razonable.
// Accent-insensitive, case-insensitive.
// ---------------------------------------------------------------------------
const FAMILIA_POR_PALABRA = {
  citrico: "Cítrico",
  dulce: "Dulce",
  afrutado: "Frutal",
  afrutada: "Frutal",
  afrutados: "Frutal",
  frutal: "Frutal",
  tropical: "Frutal",
  trapical: "Frutal",
  coco: "Frutal",
  pina: "Frutal",
  cereza: "Frutal",
  mango: "Frutal",
  chinola: "Frutal",
  almendra: "Frutal",
  tamarindo: "Frutal",
  amaderado: "Amaderado",
  amadrado: "Amaderado",
  aromatico: "Aromático",
  aromarico: "Aromático",
  herbal: "Aromático",
  fresco: "Fresco / Acuático",
  freco: "Fresco / Acuático",
  acuatico: "Fresco / Acuático",
  marino: "Fresco / Acuático",
  verde: "Fresco / Acuático",
  menta: "Fresco / Acuático",
  floral: "Floral",
  florales: "Floral",
  flolar: "Floral",
  iris: "Floral",
  rosas: "Floral",
  cuero: "Cuero",
  ahumado: "Cuero",
  vainilla: "Gourmand",
  avanillado: "Gourmand",
  avainillado: "Gourmand",
  caramelo: "Gourmand",
  acaramelado: "Gourmand",
  cafe: "Gourmand",
  cacao: "Gourmand",
  achocolatado: "Gourmand",
  achocolarado: "Gourmand",
  miel: "Gourmand",
  amielado: "Gourmand",
  especiado: "Especiado",
  espaciado: "Especiado",
  calido: "Oriental",
  tabaco: "Oriental",
  ambar: "Oriental",
  ambarado: "Oriental",
  almizclado: "Oriental",
  oud: "Oriental",
  pachuli: "Oriental",
};

function familiaOlfativaDesde(description) {
  const first = clean(description).split(" ")[0];
  if (!first) return null;
  const key = stripAccents(first).toLowerCase();
  return FAMILIA_POR_PALABRA[key] || null;
}

// ---------------------------------------------------------------------------
// 12 productos sin brandId en el sistema viejo: inferencia manual a partir
// del nombre (revisado uno por uno). "null" = no se pudo inferir con confianza.
// ---------------------------------------------------------------------------
const MARCA_INFERIDA_POR_ID = {
  666: "Rayhaan",
  664: "Rayhaan",
  655: "Rayhaan",
  480: null,
  477: null,
  455: "Nishane",
  454: "Nishane",
  424: "Zimaya",
  335: "Kenneth Cole",
  260: "Cacharel",
  130: "Zimaya",
  70: null,
};
const MARCA_FALLBACK = "Sin Marca";

// ---------------------------------------------------------------------------
// Transformación principal
// ---------------------------------------------------------------------------
const slugCount = {};
function uniqueSlug(name, sourceId) {
  let base = slugify(name);
  if (!base) base = "producto";
  if (!slugCount[base]) {
    slugCount[base] = 1;
    return base;
  }
  slugCount[base] += 1;
  return `${base}-${sourceId}`;
}

function fixImageUrl(url) {
  if (!url) return null;
  return url.replace(/\\/g, "/");
}

const products = [];
const warnings = [];

for (const it of items) {
  const sourceId = it.id;
  const name = clean(it.name);
  if (!name) {
    warnings.push(`Producto ${sourceId} sin nombre, se omite.`);
    continue;
  }

  let marca = clean(it.productBrand_Description);
  if (!marca) {
    marca = MARCA_INFERIDA_POR_ID[sourceId] || MARCA_FALLBACK;
  }

  const genero = GENERO_POR_CATEGORY_ID[it.categoryId] || "Unisex";
  const esSet = it.productCategory_Description && it.productCategory_Description.trim() === "Sets";

  const variantesRaw = Array.isArray(it.articlePrices) ? it.articlePrices : [];
  const variantes = [];
  let contenidoMlOriginal = null;

  for (const v of variantesRaw) {
    const mapping = VARIANTE_POR_MEASURE_UNIT_ID[v.measureUnitId];
    if (!mapping) {
      warnings.push(`Producto ${sourceId} (${name}): measureUnitId ${v.measureUnitId} desconocido, variante omitida.`);
      continue;
    }
    if (mapping.esBotella) contenidoMlOriginal = mapping.ml;
    variantes.push({
      tipo: mapping.tipo,
      precio: v.price || 0,
      // El sistema viejo no registra cantidad de stock, solo "soldOut".
      // Se asigna un stock placeholder para que el catálogo no aparezca vacío;
      // el admin debe ajustar cantidades reales desde el backoffice.
      stock: it.soldOut ? 0 : 25,
      activo: !!v.isActive || true, // isActive de articlePrices viene en false en el export para todo; se ignora y se usa el estado del producto
    });
  }

  if (variantes.length === 0) {
    warnings.push(`Producto ${sourceId} (${name}): sin variantes de precio válidas, se omite.`);
    continue;
  }

  const imagenOriginalUrl = it.articleImage ? fixImageUrl(it.articleImage.imageUrl) : null;
  if (!imagenOriginalUrl) {
    warnings.push(`Producto ${sourceId} (${name}): sin imagen en el sitio original.`);
  }

  products.push({
    sourceId,
    sku: it.code || null,
    name,
    slug: uniqueSlug(name, sourceId),
    marca: clean(marca),
    genero,
    esSet: !!esSet,
    descripcionCorta: clean(it.description) || null,
    familiaOlfativa: familiaOlfativaDesde(it.description),
    activo: it.isActive !== false,
    contenidoMlOriginal,
    imagenOriginalUrl,
    variantes,
  });
}

const catalog = {
  generatedAt: new Date().toISOString(),
  source: "https://klperfumesrd.com/ (API interna, migración manual)",
  sourceTotal: items.length,
  productCount: products.length,
  warnings,
  products,
};

fs.writeFileSync(OUT_PATH, JSON.stringify(catalog, null, 2), "utf8");

console.log(`Catálogo generado: ${products.length} productos (de ${items.length} en el export original)`);
console.log(`Advertencias: ${warnings.length}`);
if (warnings.length > 0) {
  console.log("--- primeras 20 advertencias ---");
  warnings.slice(0, 20).forEach((w) => console.log(" - " + w));
}

const marcasUnicas = new Set(products.map((p) => p.marca));
const sinFamilia = products.filter((p) => !p.familiaOlfativa).length;
console.log(`Marcas únicas: ${marcasUnicas.size}`);
console.log(`Productos sin familia olfativa asignada: ${sinFamilia} (quedan para etiquetar desde el backoffice)`);
