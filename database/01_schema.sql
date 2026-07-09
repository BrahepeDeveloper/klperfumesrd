/* ============================================================================
   KL PERFUMES RD — E-COMMERCE PREMIUM
   Script de creación de base de datos y esquema (SQL Server)
   Motor objetivo: Microsoft SQL Server (compatibilidad 130+ / 2016 o superior)
   Codificación: usar NVARCHAR en todo campo de texto para soportar acentos/ñ.

   Ejecutar en orden: 01_schema.sql -> 02_seed_lookups.sql
   Cómo ejecutar:
     - SSMS: abrir el archivo y presionar "Execute" (F5) con una conexión
       a tu instancia local o remota.
     - sqlcmd:  sqlcmd -S <SERVIDOR> -d master -i 01_schema.sql
   ============================================================================ */

SET NOCOUNT ON;
GO

/* ----------------------------------------------------------------------------
   0. BASE DE DATOS
   ---------------------------------------------------------------------------- */
IF DB_ID(N'KLPerfumesDB') IS NULL
BEGIN
    CREATE DATABASE [KLPerfumesDB];
END
GO

USE [KLPerfumesDB];
GO

/* ----------------------------------------------------------------------------
   1. TABLAS DE CATÁLOGO (LOOKUPS) — usadas por los filtros del sidebar
   ---------------------------------------------------------------------------- */

CREATE TABLE dbo.Marcas (
    MarcaId         INT             IDENTITY(1,1)   NOT NULL,
    Nombre          NVARCHAR(120)   NOT NULL,
    Slug            NVARCHAR(140)   NOT NULL,
    LogoUrl         NVARCHAR(500)   NULL,
    Activo          BIT             NOT NULL DEFAULT (1),
    CONSTRAINT PK_Marcas PRIMARY KEY CLUSTERED (MarcaId),
    CONSTRAINT UQ_Marcas_Nombre UNIQUE (Nombre),
    CONSTRAINT UQ_Marcas_Slug UNIQUE (Slug)
);
GO

CREATE TABLE dbo.Generos (
    GeneroId        INT             IDENTITY(1,1)   NOT NULL,
    Nombre          NVARCHAR(30)    NOT NULL,   -- Hombre / Mujer / Unisex
    Slug            NVARCHAR(40)    NOT NULL,
    CONSTRAINT PK_Generos PRIMARY KEY CLUSTERED (GeneroId),
    CONSTRAINT UQ_Generos_Nombre UNIQUE (Nombre),
    CONSTRAINT UQ_Generos_Slug UNIQUE (Slug)
);
GO

CREATE TABLE dbo.Concentraciones (
    ConcentracionId INT             IDENTITY(1,1)   NOT NULL,
    Nombre          NVARCHAR(50)    NOT NULL,   -- EDP, EDT, Parfum, Extrait, Attar...
    Abreviatura     NVARCHAR(10)    NOT NULL,
    CONSTRAINT PK_Concentraciones PRIMARY KEY CLUSTERED (ConcentracionId),
    CONSTRAINT UQ_Concentraciones_Nombre UNIQUE (Nombre)
);
GO

CREATE TABLE dbo.FamiliasOlfativas (
    FamiliaId       INT             IDENTITY(1,1)   NOT NULL,
    Nombre          NVARCHAR(60)    NOT NULL,   -- Amaderado, Dulce, Cítrico...
    Slug            NVARCHAR(70)    NOT NULL,
    CONSTRAINT PK_FamiliasOlfativas PRIMARY KEY CLUSTERED (FamiliaId),
    CONSTRAINT UQ_FamiliasOlfativas_Nombre UNIQUE (Nombre),
    CONSTRAINT UQ_FamiliasOlfativas_Slug UNIQUE (Slug)
);
GO

CREATE TABLE dbo.Temporadas (
    TemporadaId     INT             IDENTITY(1,1)   NOT NULL,
    Nombre          NVARCHAR(30)    NOT NULL,   -- Verano, Invierno, Primavera, Otoño
    Slug            NVARCHAR(40)    NOT NULL,
    CONSTRAINT PK_Temporadas PRIMARY KEY CLUSTERED (TemporadaId),
    CONSTRAINT UQ_Temporadas_Nombre UNIQUE (Nombre),
    CONSTRAINT UQ_Temporadas_Slug UNIQUE (Slug)
);
GO

CREATE TABLE dbo.Ocasiones (
    OcasionId       INT             IDENTITY(1,1)   NOT NULL,
    Nombre          NVARCHAR(40)    NOT NULL,   -- Oficina, Cita, Fiesta, Diario...
    Slug            NVARCHAR(50)    NOT NULL,
    CONSTRAINT PK_Ocasiones PRIMARY KEY CLUSTERED (OcasionId),
    CONSTRAINT UQ_Ocasiones_Nombre UNIQUE (Nombre),
    CONSTRAINT UQ_Ocasiones_Slug UNIQUE (Slug)
);
GO

CREATE TABLE dbo.NotasOlfativas (
    NotaId          INT             IDENTITY(1,1)   NOT NULL,
    Nombre          NVARCHAR(100)   NOT NULL,   -- Bergamota, Vainilla, Oud...
    IconoUrl        NVARCHAR(300)   NULL,
    CONSTRAINT PK_NotasOlfativas PRIMARY KEY CLUSTERED (NotaId),
    CONSTRAINT UQ_NotasOlfativas_Nombre UNIQUE (Nombre)
);
GO

CREATE TABLE dbo.TiposVariante (
    TipoVarianteId  INT             IDENTITY(1,1)   NOT NULL,
    Nombre          NVARCHAR(40)    NOT NULL,   -- "Decant 5ML", "Decant 10ML", "Botella Completa"
    MlEquivalente    INT             NULL,        -- NULL cuando el ml depende del producto (botella completa)
    Orden           SMALLINT        NOT NULL DEFAULT (0),
    CONSTRAINT PK_TiposVariante PRIMARY KEY CLUSTERED (TipoVarianteId),
    CONSTRAINT UQ_TiposVariante_Nombre UNIQUE (Nombre)
);
GO

/* ----------------------------------------------------------------------------
   2. PRODUCTOS (tabla principal del catálogo)
   ---------------------------------------------------------------------------- */

CREATE TABLE dbo.Productos (
    ProductoId          INT             IDENTITY(1,1)   NOT NULL,
    Nombre              NVARCHAR(200)   NOT NULL,
    Slug                NVARCHAR(220)   NOT NULL,          -- usado en /productos/{slug}
    MarcaId             INT             NOT NULL,
    GeneroId            INT             NOT NULL,
    ConcentracionId     INT             NULL,
    ContenidoMlOriginal INT             NULL,               -- ml del frasco original (ej. 100)
    DescripcionCorta    NVARCHAR(500)   NULL,
    DescripcionLarga    NVARCHAR(MAX)   NULL,
    SKU                 NVARCHAR(50)    NULL,
    Destacado           BIT             NOT NULL DEFAULT (0),
    Activo              BIT             NOT NULL DEFAULT (1),
    FechaCreacion       DATETIME2(0)    NOT NULL DEFAULT (SYSUTCDATETIME()),
    FechaActualizacion  DATETIME2(0)    NOT NULL DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_Productos PRIMARY KEY CLUSTERED (ProductoId),
    CONSTRAINT UQ_Productos_Slug UNIQUE (Slug),
    CONSTRAINT FK_Productos_Marcas FOREIGN KEY (MarcaId)
        REFERENCES dbo.Marcas (MarcaId) ON DELETE NO ACTION,
    CONSTRAINT FK_Productos_Generos FOREIGN KEY (GeneroId)
        REFERENCES dbo.Generos (GeneroId) ON DELETE NO ACTION,
    CONSTRAINT FK_Productos_Concentraciones FOREIGN KEY (ConcentracionId)
        REFERENCES dbo.Concentraciones (ConcentracionId) ON DELETE SET NULL
);
GO

CREATE TABLE dbo.ProductoImagenes (
    ImagenId            INT             IDENTITY(1,1)   NOT NULL,
    ProductoId          INT             NOT NULL,
    UrlWebp             NVARCHAR(500)   NOT NULL,          -- servir siempre en .webp
    TextoAlternativo    NVARCHAR(200)   NULL,
    EsPrincipal         BIT             NOT NULL DEFAULT (0),
    Orden               SMALLINT        NOT NULL DEFAULT (0),
    CONSTRAINT PK_ProductoImagenes PRIMARY KEY CLUSTERED (ImagenId),
    CONSTRAINT FK_ProductoImagenes_Productos FOREIGN KEY (ProductoId)
        REFERENCES dbo.Productos (ProductoId) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.VariantesPrecios (
    VarianteId          INT             IDENTITY(1,1)   NOT NULL,
    ProductoId          INT             NOT NULL,
    TipoVarianteId      INT             NOT NULL,
    Precio              DECIMAL(10,2)   NOT NULL,
    PrecioComparacion   DECIMAL(10,2)   NULL,               -- precio "antes" para mostrar descuento
    Stock               INT             NOT NULL DEFAULT (0),
    SKU                 NVARCHAR(50)    NULL,
    Activo              BIT             NOT NULL DEFAULT (1),
    CONSTRAINT PK_VariantesPrecios PRIMARY KEY CLUSTERED (VarianteId),
    CONSTRAINT UQ_VariantesPrecios_Producto_Tipo UNIQUE (ProductoId, TipoVarianteId),
    CONSTRAINT CK_VariantesPrecios_Precio CHECK (Precio >= 0),
    CONSTRAINT CK_VariantesPrecios_Stock CHECK (Stock >= 0),
    CONSTRAINT FK_VariantesPrecios_Productos FOREIGN KEY (ProductoId)
        REFERENCES dbo.Productos (ProductoId) ON DELETE CASCADE,
    CONSTRAINT FK_VariantesPrecios_TiposVariante FOREIGN KEY (TipoVarianteId)
        REFERENCES dbo.TiposVariante (TipoVarianteId) ON DELETE NO ACTION
);
GO

/* ----------------------------------------------------------------------------
   3. PIRÁMIDE OLFATIVA (Notas de Salida / Corazón / Fondo)
   Relacional en vez de JSON: permite filtrar "productos con Bergamota" con
   un JOIN + índice, en vez de escanear texto.
   ---------------------------------------------------------------------------- */

CREATE TABLE dbo.ProductoNotas (
    ProductoId      INT             NOT NULL,
    NotaId          INT             NOT NULL,
    Posicion        VARCHAR(10)     NOT NULL,   -- 'Salida' | 'Corazon' | 'Fondo'
    Orden           SMALLINT        NOT NULL DEFAULT (0),
    CONSTRAINT PK_ProductoNotas PRIMARY KEY CLUSTERED (ProductoId, NotaId, Posicion),
    CONSTRAINT CK_ProductoNotas_Posicion CHECK (Posicion IN ('Salida', 'Corazon', 'Fondo')),
    CONSTRAINT FK_ProductoNotas_Productos FOREIGN KEY (ProductoId)
        REFERENCES dbo.Productos (ProductoId) ON DELETE CASCADE,
    CONSTRAINT FK_ProductoNotas_Notas FOREIGN KEY (NotaId)
        REFERENCES dbo.NotasOlfativas (NotaId) ON DELETE NO ACTION
);
GO

/* ----------------------------------------------------------------------------
   4. TABLAS PUENTE PARA FILTROS (muchos-a-muchos)
   ---------------------------------------------------------------------------- */

CREATE TABLE dbo.ProductoFamiliaOlfativa (
    ProductoId  INT NOT NULL,
    FamiliaId   INT NOT NULL,
    CONSTRAINT PK_ProductoFamiliaOlfativa PRIMARY KEY CLUSTERED (ProductoId, FamiliaId),
    CONSTRAINT FK_ProductoFamiliaOlfativa_Productos FOREIGN KEY (ProductoId)
        REFERENCES dbo.Productos (ProductoId) ON DELETE CASCADE,
    CONSTRAINT FK_ProductoFamiliaOlfativa_Familias FOREIGN KEY (FamiliaId)
        REFERENCES dbo.FamiliasOlfativas (FamiliaId) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.ProductoTemporada (
    ProductoId    INT NOT NULL,
    TemporadaId   INT NOT NULL,
    CONSTRAINT PK_ProductoTemporada PRIMARY KEY CLUSTERED (ProductoId, TemporadaId),
    CONSTRAINT FK_ProductoTemporada_Productos FOREIGN KEY (ProductoId)
        REFERENCES dbo.Productos (ProductoId) ON DELETE CASCADE,
    CONSTRAINT FK_ProductoTemporada_Temporadas FOREIGN KEY (TemporadaId)
        REFERENCES dbo.Temporadas (TemporadaId) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.ProductoOcasion (
    ProductoId  INT NOT NULL,
    OcasionId   INT NOT NULL,
    CONSTRAINT PK_ProductoOcasion PRIMARY KEY CLUSTERED (ProductoId, OcasionId),
    CONSTRAINT FK_ProductoOcasion_Productos FOREIGN KEY (ProductoId)
        REFERENCES dbo.Productos (ProductoId) ON DELETE CASCADE,
    CONSTRAINT FK_ProductoOcasion_Ocasiones FOREIGN KEY (OcasionId)
        REFERENCES dbo.Ocasiones (OcasionId) ON DELETE NO ACTION
);
GO

/* ----------------------------------------------------------------------------
   5. BACKOFFICE — Usuarios administradores (login del panel)
   ---------------------------------------------------------------------------- */

CREATE TABLE dbo.Usuarios (
    UsuarioId       INT             IDENTITY(1,1)   NOT NULL,
    Nombre          NVARCHAR(150)   NOT NULL,
    Email           NVARCHAR(200)   NOT NULL,
    PasswordHash    NVARCHAR(255)   NOT NULL,           -- bcrypt/argon2, nunca texto plano
    Rol             VARCHAR(20)     NOT NULL DEFAULT ('Admin'),
    Activo          BIT             NOT NULL DEFAULT (1),
    UltimoAcceso    DATETIME2(0)    NULL,
    FechaCreacion   DATETIME2(0)    NOT NULL DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_Usuarios PRIMARY KEY CLUSTERED (UsuarioId),
    CONSTRAINT UQ_Usuarios_Email UNIQUE (Email),
    CONSTRAINT CK_Usuarios_Rol CHECK (Rol IN ('SuperAdmin', 'Admin'))
);
GO

/* ----------------------------------------------------------------------------
   6. CLIENTES / PEDIDOS — base lista para el flujo de checkout (fase 2)
   ---------------------------------------------------------------------------- */

CREATE TABLE dbo.Clientes (
    ClienteId       INT             IDENTITY(1,1)   NOT NULL,
    Nombre          NVARCHAR(150)   NOT NULL,
    Email           NVARCHAR(200)   NOT NULL,
    Telefono        NVARCHAR(30)    NULL,
    FechaCreacion   DATETIME2(0)    NOT NULL DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_Clientes PRIMARY KEY CLUSTERED (ClienteId),
    CONSTRAINT UQ_Clientes_Email UNIQUE (Email)
);
GO

CREATE TABLE dbo.Pedidos (
    PedidoId        INT             IDENTITY(1,1)   NOT NULL,
    ClienteId       INT             NULL,               -- NULL permite guest-checkout
    Estado          VARCHAR(20)     NOT NULL DEFAULT ('Pendiente'),
    Total           DECIMAL(10,2)   NOT NULL DEFAULT (0),
    MetodoPago      NVARCHAR(50)    NULL,
    DireccionEnvio  NVARCHAR(MAX)   NULL,
    FechaCreacion   DATETIME2(0)    NOT NULL DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_Pedidos PRIMARY KEY CLUSTERED (PedidoId),
    CONSTRAINT CK_Pedidos_Estado CHECK (Estado IN ('Pendiente','Confirmado','Enviado','Entregado','Cancelado')),
    CONSTRAINT FK_Pedidos_Clientes FOREIGN KEY (ClienteId)
        REFERENCES dbo.Clientes (ClienteId) ON DELETE SET NULL
);
GO

CREATE TABLE dbo.DetallePedidos (
    DetalleId       INT             IDENTITY(1,1)   NOT NULL,
    PedidoId        INT             NOT NULL,
    VarianteId      INT             NOT NULL,
    Cantidad        INT             NOT NULL,
    PrecioUnitario  DECIMAL(10,2)   NOT NULL,
    Subtotal        AS (Cantidad * PrecioUnitario) PERSISTED,
    CONSTRAINT PK_DetallePedidos PRIMARY KEY CLUSTERED (DetalleId),
    CONSTRAINT CK_DetallePedidos_Cantidad CHECK (Cantidad > 0),
    CONSTRAINT FK_DetallePedidos_Pedidos FOREIGN KEY (PedidoId)
        REFERENCES dbo.Pedidos (PedidoId) ON DELETE CASCADE,
    CONSTRAINT FK_DetallePedidos_Variantes FOREIGN KEY (VarianteId)
        REFERENCES dbo.VariantesPrecios (VarianteId) ON DELETE NO ACTION
);
GO

/* ----------------------------------------------------------------------------
   7. ÍNDICES DE OPTIMIZACIÓN PARA BÚSQUEDA Y FILTROS
   Cubren los patrones WHERE/IN que usará la barra lateral de filtros y el
   listado paginado de +650 productos.
   ---------------------------------------------------------------------------- */

-- SKU es opcional. Una UNIQUE constraint normal en SQL Server solo admite UN
-- valor NULL; con múltiples productos sin SKU la segunda inserción fallaría.
-- Un índice único FILTRADO (WHERE ... IS NOT NULL) evita ese problema y
-- solo exige unicidad entre los SKU que sí existen.
CREATE UNIQUE NONCLUSTERED INDEX UX_Productos_SKU ON dbo.Productos (SKU) WHERE SKU IS NOT NULL;
CREATE UNIQUE NONCLUSTERED INDEX UX_VariantesPrecios_SKU ON dbo.VariantesPrecios (SKU) WHERE SKU IS NOT NULL;

-- Filtrado directo sobre Productos
CREATE NONCLUSTERED INDEX IX_Productos_MarcaId ON dbo.Productos (MarcaId) INCLUDE (Nombre, Slug);
CREATE NONCLUSTERED INDEX IX_Productos_GeneroId ON dbo.Productos (GeneroId) INCLUDE (Nombre, Slug);
CREATE NONCLUSTERED INDEX IX_Productos_Activo_Destacado ON dbo.Productos (Activo, Destacado)
    INCLUDE (Nombre, Slug, MarcaId, GeneroId);

-- Búsqueda por texto (autocomplete / buscador del header)
CREATE NONCLUSTERED INDEX IX_Productos_Nombre ON dbo.Productos (Nombre);

-- Tablas puente: el filtro llega como "FamiliaId IN (1,4,7)" etc.
CREATE NONCLUSTERED INDEX IX_ProductoFamiliaOlfativa_FamiliaId ON dbo.ProductoFamiliaOlfativa (FamiliaId);
CREATE NONCLUSTERED INDEX IX_ProductoTemporada_TemporadaId ON dbo.ProductoTemporada (TemporadaId);
CREATE NONCLUSTERED INDEX IX_ProductoOcasion_OcasionId ON dbo.ProductoOcasion (OcasionId);
CREATE NONCLUSTERED INDEX IX_ProductoNotas_NotaId ON dbo.ProductoNotas (NotaId);

-- Variantes de precio: cargar precios/stock de un producto (PDP) y consultas de stock bajo
CREATE NONCLUSTERED INDEX IX_VariantesPrecios_ProductoId ON dbo.VariantesPrecios (ProductoId)
    INCLUDE (TipoVarianteId, Precio, Stock, Activo);

-- Imágenes: traer la galería ordenada de un producto
CREATE NONCLUSTERED INDEX IX_ProductoImagenes_ProductoId ON dbo.ProductoImagenes (ProductoId, Orden);

-- Pedidos: historial por cliente y reportes por estado
CREATE NONCLUSTERED INDEX IX_Pedidos_ClienteId ON dbo.Pedidos (ClienteId);
CREATE NONCLUSTERED INDEX IX_Pedidos_Estado ON dbo.Pedidos (Estado);
CREATE NONCLUSTERED INDEX IX_DetallePedidos_PedidoId ON dbo.DetallePedidos (PedidoId);
GO

/* ----------------------------------------------------------------------------
   8. (OPCIONAL) BÚSQUEDA DE TEXTO COMPLETO
   Requiere el feature "Full-Text Search" instalado en la instancia de SQL
   Server. Descomentar si se necesita búsqueda difusa sobre nombre/descripción.
   ---------------------------------------------------------------------------- */

-- CREATE FULLTEXT CATALOG ftCatalogKLP AS DEFAULT;
-- CREATE FULLTEXT INDEX ON dbo.Productos (Nombre, DescripcionCorta, DescripcionLarga)
--     KEY INDEX PK_Productos
--     ON ftCatalogKLP
--     WITH STOPLIST = SYSTEM;
GO

PRINT 'Esquema KLPerfumesDB creado correctamente.';
GO
