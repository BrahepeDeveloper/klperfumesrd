# Migración a Azure SQL Database

## Por qué Azure
- ✅ Gratuito primer año (free tier disponible)
- ✅ No requiere configuración de router
- ✅ IP pública, accesible desde Vercel
- ✅ Backups automáticos
- ✅ SSL/TLS incluido

## Paso 1: Crear cuenta Azure (gratis)
1. Ve a https://azure.microsoft.com/en-us/free/
2. Haz clic en "Start free"
3. Inicia sesión con Outlook/Gmail
4. Verifica identidad (tarjeta crédito requerida pero NO se cobra)
5. Reclama crédito gratuito ($200 por 30 días)

## Paso 2: Crear SQL Server + Database en Azure
1. Ve a https://portal.azure.com
2. En la búsqueda arriba, escribe **"SQL Server"**
3. Haz clic en **"Create"**
4. Completa:
   - **Subscription**: Azure free trial
   - **Resource group**: Crea uno nuevo → "klperfumes-rg"
   - **Server name**: `klperfumes` (globalmente único)
   - **Location**: East US (o tu zona)
   - **Admin username**: `adminuser`
   - **Password**: Usa algo fuerte, ej: `Azure!KLP2026@Secure`
5. En la pestaña **"Networking"**:
   - **Connectivity method**: Public endpoint
   - **Allow Azure services**: ON
   - **Add current client IP**: ON
6. Haz clic en **"Create"** (espera 5-10 min)

## Paso 3: Crear la Database
Una vez que el servidor se crea:
1. Ve a **SQL databases** en el portal
2. Haz clic en **"Create"**
3. Completa:
   - **Database name**: `KLPerfumesDB`
   - **Server**: Selecciona el que creaste (`klperfumes`)
   - **Pricing tier**: Basic (5 DTU, suficiente para MVP)
4. Haz clic en **"Create"** (espera 2-3 min)

## Paso 4: Obtener la cadena de conexión
1. Ve a **SQL databases** → **KLPerfumesDB**
2. En la izquierda, haz clic en **"Connection strings"**
3. Copia la cadena **"ODBC (Python)"** — se ve así:
   ```
   Driver={ODBC Driver 18 for SQL Server};Server=tcp:klperfumes.database.windows.net,1433;Database=KLPerfumesDB;Uid=adminuser;Pwd=<password>;Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;
   ```
4. Reemplaza `<password>` con tu contraseña
5. Conviértela al formato de Prisma (para DATABASE_URL):
   ```
   sqlserver://adminuser:<password>@klperfumes.database.windows.net:1433;database=KLPerfumesDB;encrypt=true;trustServerCertificate=false
   ```

## Paso 5: Restaurar el backup local
Opción A — Desde Azure Portal (más fácil):
1. Ve a **SQL databases** → **KLPerfumesDB**
2. En la parte superior, haz clic en **"Import BACPAC"**
3. Selecciona el archivo: `C:\KLPERFUMESRD\KLPerfumesDB_backup.bak`
4. Espera a que termine (15-30 min según el tamaño)

Opción B — Con SQL Management Studio (si tienes instalado):
1. Abre SSMS
2. Conecta a `klperfumes.database.windows.net` con `adminuser`
3. Botón derecho en "Databases" → "Restore Database"
4. Selecciona el `.bak` file

## Paso 6: Actualizar Vercel
1. Ve a https://vercel.com/brahepedevelopers-projects/klperfumesrd/settings/environment-variables
2. Haz clic en **"Add"**
3. **Name**: `DATABASE_URL`
4. **Value**: Pega la cadena de conexión de Prisma (del Paso 4)
5. Selecciona **"Production"**
6. Haz clic en **"Save"**
7. Ve a **"Deployments"**
8. Haz clic en el deployment activo → **"Redeploy"**

## Paso 7: Verificar
1. Espera a que Vercel termine el deploy (~2 min)
2. Ve a https://klperfumesrd.vercel.app/catalogo
3. Verifica que se cargan los productos

---

## Troubleshooting

**Error: "Can't reach database server"**
- Verifica el firewall de Azure:
  - Ve a SQL Server → "Firewalls and virtual networks"
  - Verifica que "Allow Azure services" está ON
  - Verifica que tu IP está en la lista

**Error: "Login failed for user 'adminuser'"**
- Verifica la contraseña en la cadena de conexión
- Usa formato: `adminuser@klperfumes` (con nombre del servidor)

**El backup no se restaura**
- El archivo `.bak` está en `C:\KLPERFUMESRD\KLPerfumesDB_backup.bak`
- Azure Solo acepta `.bacpac` desde el portal (recomendado: usar SSMS)

---

## Estimado de costo
- **Primer año**: GRATIS ($200 crédito Azure)
- **Después**: ~$5-10/mes (Basic tier)
- **Recomendado después de MVP**: Migrar a Azure Database for MySQL (más barato, $0/mes con crédito)
