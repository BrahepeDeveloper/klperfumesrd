/* ============================================================================
   KL PERFUMES RD — ACTUALIZACIÓN de tablas de catálogo (lookups)
   Ejecutar UNA sola vez, DESPUÉS de 02_seed_lookups.sql, si ya lo corriste
   antes de que agregáramos "Aromático" (familia olfativa) y "Set" (tipo de
   variante) — ambos detectados al analizar el catálogo real del sitio.
   ============================================================================ */

USE [KLPerfumesDB];
GO

SET NOCOUNT ON;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.FamiliasOlfativas WHERE Nombre = N'Aromático')
BEGIN
    INSERT INTO dbo.FamiliasOlfativas (Nombre, Slug) VALUES (N'Aromático', N'aromatico');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.TiposVariante WHERE Nombre = N'Set')
BEGIN
    INSERT INTO dbo.TiposVariante (Nombre, MlEquivalente, Orden) VALUES (N'Set', NULL, 5);
END
GO

PRINT 'Actualización de lookups completada.';
GO
