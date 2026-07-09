-- ============================================================================
-- KL PERFUMES RD — Schema para Supabase PostgreSQL
-- Ejecutar en: Supabase → SQL Editor → New query
-- ============================================================================

-- Usar schema public (requerido para PostgREST API)
SET search_path TO public;

-- ---------------------------------------------------------------------------
-- TABLAS DE REFERENCIA (Lookups)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS marca (
  "marcaId" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(120) NOT NULL UNIQUE,
  "slug" VARCHAR(140) NOT NULL UNIQUE,
  "logoUrl" VARCHAR(500),
  "activo" BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS genero (
  "generoId" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(30) NOT NULL UNIQUE,
  "slug" VARCHAR(40) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS concentracion (
  "concentracionId" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(50) NOT NULL UNIQUE,
  "abreviatura" VARCHAR(10) NOT NULL
);

CREATE TABLE IF NOT EXISTS "familiaOlfativa" (
  "familiaId" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(60) NOT NULL UNIQUE,
  "slug" VARCHAR(70) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS temporada (
  "temporadaId" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(30) NOT NULL UNIQUE,
  "slug" VARCHAR(40) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS ocasion (
  "ocasionId" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(40) NOT NULL UNIQUE,
  "slug" VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "notaOlfativa" (
  "notaId" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(100) NOT NULL UNIQUE,
  "iconoUrl" VARCHAR(300)
);

CREATE TABLE IF NOT EXISTS "tipoVariante" (
  "tipoVarianteId" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(40) NOT NULL UNIQUE,
  "mlEquivalente" INTEGER,
  "orden" SMALLINT DEFAULT 0
);

-- ---------------------------------------------------------------------------
-- CATÁLOGO PRINCIPAL
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS producto (
  "productoId" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(200) NOT NULL,
  "slug" VARCHAR(220) NOT NULL UNIQUE,
  "marcaId" INTEGER NOT NULL REFERENCES marca("marcaId") ON DELETE NO ACTION,
  "generoId" INTEGER NOT NULL REFERENCES genero("generoId") ON DELETE NO ACTION,
  "concentracionId" INTEGER REFERENCES concentracion("concentracionId") ON DELETE SET NULL,
  "contenidoMlOriginal" INTEGER,
  "descripcionCorta" VARCHAR(500),
  "descripcionLarga" TEXT,
  "sku" VARCHAR(50),
  "destacado" BOOLEAN DEFAULT false,
  "activo" BOOLEAN DEFAULT true,
  "fechaCreacion" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "fechaActualizacion" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_producto_marcaId" ON producto("marcaId");
CREATE INDEX IF NOT EXISTS "idx_producto_generoId" ON producto("generoId");
CREATE INDEX IF NOT EXISTS "idx_producto_activo_destacado" ON producto("activo", "destacado");
CREATE INDEX IF NOT EXISTS "idx_producto_nombre" ON producto("nombre");

CREATE TABLE IF NOT EXISTS "productoImagen" (
  "imagenId" SERIAL PRIMARY KEY,
  "productoId" INTEGER NOT NULL REFERENCES producto("productoId") ON DELETE CASCADE,
  "urlWebp" VARCHAR(500) NOT NULL,
  "textoAlternativo" VARCHAR(200),
  "esPrincipal" BOOLEAN DEFAULT false,
  "orden" SMALLINT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS "idx_productoImagen_productoId" ON "productoImagen"("productoId", "orden");

CREATE TABLE IF NOT EXISTS "variantePrecio" (
  "varianteId" SERIAL PRIMARY KEY,
  "productoId" INTEGER NOT NULL REFERENCES producto("productoId") ON DELETE CASCADE,
  "tipoVarianteId" INTEGER NOT NULL REFERENCES "tipoVariante"("tipoVarianteId") ON DELETE NO ACTION,
  "precio" DECIMAL(10, 2) NOT NULL,
  "precioComparacion" DECIMAL(10, 2),
  "stock" INTEGER DEFAULT 0,
  "sku" VARCHAR(50),
  "activo" BOOLEAN DEFAULT true,
  UNIQUE("productoId", "tipoVarianteId")
);

CREATE INDEX IF NOT EXISTS "idx_variantePrecio_productoId" ON "variantePrecio"("productoId");

CREATE TABLE IF NOT EXISTS "productoNota" (
  "productoId" INTEGER NOT NULL REFERENCES producto("productoId") ON DELETE CASCADE,
  "notaId" INTEGER NOT NULL REFERENCES "notaOlfativa"("notaId") ON DELETE NO ACTION,
  "posicion" VARCHAR(10) NOT NULL,
  "orden" SMALLINT DEFAULT 0,
  PRIMARY KEY ("productoId", "notaId", "posicion")
);

CREATE INDEX IF NOT EXISTS "idx_productoNota_notaId" ON "productoNota"("notaId");

-- ---------------------------------------------------------------------------
-- TABLAS PUENTE DE FILTROS
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "productoFamiliaOlfativa" (
  "productoId" INTEGER NOT NULL REFERENCES producto("productoId") ON DELETE CASCADE,
  "familiaId" INTEGER NOT NULL REFERENCES "familiaOlfativa"("familiaId") ON DELETE NO ACTION,
  PRIMARY KEY ("productoId", "familiaId")
);

CREATE INDEX IF NOT EXISTS "idx_productoFamiliaOlfativa_familiaId" ON "productoFamiliaOlfativa"("familiaId");

CREATE TABLE IF NOT EXISTS "productoTemporada" (
  "productoId" INTEGER NOT NULL REFERENCES producto("productoId") ON DELETE CASCADE,
  "temporadaId" INTEGER NOT NULL REFERENCES temporada("temporadaId") ON DELETE NO ACTION,
  PRIMARY KEY ("productoId", "temporadaId")
);

CREATE INDEX IF NOT EXISTS "idx_productoTemporada_temporadaId" ON "productoTemporada"("temporadaId");

CREATE TABLE IF NOT EXISTS "productoOcasion" (
  "productoId" INTEGER NOT NULL REFERENCES producto("productoId") ON DELETE CASCADE,
  "ocasionId" INTEGER NOT NULL REFERENCES ocasion("ocasionId") ON DELETE NO ACTION,
  PRIMARY KEY ("productoId", "ocasionId")
);

CREATE INDEX IF NOT EXISTS "idx_productoOcasion_ocasionId" ON "productoOcasion"("ocasionId");

-- ---------------------------------------------------------------------------
-- BACKOFFICE
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS usuario (
  "usuarioId" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(150) NOT NULL,
  "email" VARCHAR(200) NOT NULL UNIQUE,
  "passwordHash" VARCHAR(255) NOT NULL,
  "rol" VARCHAR(20) DEFAULT 'Admin',
  "activo" BOOLEAN DEFAULT true,
  "ultimoAcceso" TIMESTAMP,
  "fechaCreacion" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- CLIENTES / PEDIDOS
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS cliente (
  "clienteId" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(150) NOT NULL,
  "email" VARCHAR(200) NOT NULL UNIQUE,
  "telefono" VARCHAR(30),
  "fechaCreacion" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pedido (
  "pedidoId" SERIAL PRIMARY KEY,
  "clienteId" INTEGER REFERENCES cliente("clienteId") ON DELETE SET NULL,
  "estado" VARCHAR(20) DEFAULT 'Pendiente',
  "total" DECIMAL(10, 2) DEFAULT 0,
  "metodoPago" VARCHAR(50),
  "direccionEnvio" TEXT,
  "fechaCreacion" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_pedido_clienteId" ON pedido("clienteId");
CREATE INDEX IF NOT EXISTS "idx_pedido_estado" ON pedido("estado");

CREATE TABLE IF NOT EXISTS "detallePedido" (
  "detalleId" SERIAL PRIMARY KEY,
  "pedidoId" INTEGER NOT NULL REFERENCES pedido("pedidoId") ON DELETE CASCADE,
  "varianteId" INTEGER NOT NULL REFERENCES "variantePrecio"("varianteId") ON DELETE NO ACTION,
  "cantidad" INTEGER NOT NULL,
  "precioUnitario" DECIMAL(10, 2) NOT NULL,
  "subtotal" DECIMAL(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_detallePedido_pedidoId" ON "detallePedido"("pedidoId");

-- ============================================================================
-- FIN DEL SCHEMA
-- ============================================================================
