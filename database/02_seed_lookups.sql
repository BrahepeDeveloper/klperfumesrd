/* ============================================================================
   KL PERFUMES RD — SEED DE TABLAS DE CATÁLOGO (LOOKUPS)
   Ejecutar DESPUÉS de 01_schema.sql. Estas son las opciones fijas que
   alimentan la barra de filtros (Género, Familia Olfativa, Temporada,
   Ocasión, Concentración, Tipos de Variante/Decant).

   Este script NO inserta productos — eso corresponde al seed masivo en
   TypeScript (fase de migración de datos, /data/catalog.json -> Prisma).
   ============================================================================ */

USE [KLPerfumesDB];
GO

SET NOCOUNT ON;
GO

-- ----------------------------------------------------------------------------
-- Géneros
-- ----------------------------------------------------------------------------
INSERT INTO dbo.Generos (Nombre, Slug) VALUES
    (N'Hombre', N'hombre'),
    (N'Mujer', N'mujer'),
    (N'Unisex', N'unisex');
GO

-- ----------------------------------------------------------------------------
-- Concentraciones
-- ----------------------------------------------------------------------------
INSERT INTO dbo.Concentraciones (Nombre, Abreviatura) VALUES
    (N'Eau de Parfum', N'EDP'),
    (N'Eau de Toilette', N'EDT'),
    (N'Eau de Cologne', N'EDC'),
    (N'Parfum / Extrait', N'PARFUM'),
    (N'Attar / Oil', N'ATTAR');
GO

-- ----------------------------------------------------------------------------
-- Familias Olfativas
-- ----------------------------------------------------------------------------
INSERT INTO dbo.FamiliasOlfativas (Nombre, Slug) VALUES
    (N'Amaderado', N'amaderado'),
    (N'Dulce', N'dulce'),
    (N'Cítrico', N'citrico'),
    (N'Floral', N'floral'),
    (N'Especiado', N'especiado'),
    (N'Oriental', N'oriental'),
    (N'Fresco / Acuático', N'fresco-acuatico'),
    (N'Frutal', N'frutal'),
    (N'Gourmand', N'gourmand'),
    (N'Cuero', N'cuero'),
    (N'Aromático', N'aromatico');
GO

-- ----------------------------------------------------------------------------
-- Temporadas
-- ----------------------------------------------------------------------------
INSERT INTO dbo.Temporadas (Nombre, Slug) VALUES
    (N'Verano', N'verano'),
    (N'Invierno', N'invierno'),
    (N'Primavera', N'primavera'),
    (N'Otoño', N'otono');
GO

-- ----------------------------------------------------------------------------
-- Ocasiones
-- ----------------------------------------------------------------------------
INSERT INTO dbo.Ocasiones (Nombre, Slug) VALUES
    (N'Oficina / Diario', N'oficina-diario'),
    (N'Cita', N'cita'),
    (N'Fiesta / Noche', N'fiesta-noche'),
    (N'Deporte / Casual', N'deporte-casual'),
    (N'Ocasión Especial', N'ocasion-especial');
GO

-- ----------------------------------------------------------------------------
-- Tipos de Variante (Decants y Botella Completa)
-- MlEquivalente = NULL en "Botella Completa" porque el tamaño real depende
-- de Productos.ContenidoMlOriginal (cada perfume declara su propio tamaño).
-- ----------------------------------------------------------------------------
INSERT INTO dbo.TiposVariante (Nombre, MlEquivalente, Orden) VALUES
    (N'Decant 3ML', 3, 1),
    (N'Decant 5ML', 5, 2),
    (N'Decant 10ML', 10, 3),
    (N'Botella Completa', NULL, 4),
    (N'Set', NULL, 5);
GO

PRINT 'Seed de tablas de catálogo (lookups) completado.';
GO
