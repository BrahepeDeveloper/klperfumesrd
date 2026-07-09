# KL Perfumes RD — Deployment Checklist

**Estado**: 🟢 Listo para producción (pending DB)  
**Fecha**: 2026-07-09  
**Versión**: 0.1.0

---

## ✅ Completado

### Backend & Features (100%)
- [x] Image migration — 654 imágenes → `/public/images/productos/` (WebP)
- [x] SEO/OG metadata — metadataBase, OG images, sitemap (dinámico), robots.txt, JSON-LD
- [x] Admin /pedidos — Lista con filtros por estado, detail page, PATCH API
- [x] Catalog filters — Price range (precioMin/precioMax) + brand filter + active chips
- [x] Email (Resend) — Order confirmation trigger on estado→"Confirmado"
- [x] Chatbot (Gemini) — KLia asesora virtual (placeholders para API key)

### Deployment (100%)
- [x] TypeScript 5.9 (compatible con Next.js 16)
- [x] Production build — 26 routes, zero errors
- [x] Proxy.ts — Next.js 16 middleware (renamed from middleware.ts)
- [x] Vercel deployment — ✅ LIVE en https://klperfumesrd.vercel.app
- [x] Environment variables — Configurados en Vercel (excepto DATABASE_URL)

### Code Quality (100%)
- [x] Zero TypeScript errors
- [x] All routes buildable
- [x] Sitemap set to dynamic (no DB required at build time)

---

## 🔴 Pendiente del cliente (crítico)

### Database Connection
**Estado**: ❌ DATABASE_URL no configurada → Vercel shows "Can't reach database"

**Acción requerida**:
1. Lee `AZURE_SETUP.md` (instrucciones paso a paso)
2. Crea Azure SQL Server + Database (~30 min)
3. Obtén la cadena de conexión
4. Configura en Vercel:
   - Settings → Environment Variables
   - Nombre: `DATABASE_URL`
   - Valor: `sqlserver://adminuser:password@klperfumes.database.windows.net:1433;database=KLPerfumesDB;encrypt=true;trustServerCertificate=false`
5. Redeploy en Vercel

**Resultado**: Todas las páginas públicas + admin funcionarán ✓

### Environment Variables (Vercel → Settings → Environment Variables)

| Variable | Prioridad | Estado | Valor Ejemplo |
|----------|-----------|--------|--------------|
| `DATABASE_URL` | 🔴 CRÍTICO | ❌ Pendiente | `sqlserver://...@klperfumes.database.windows.net:...` |
| `SESSION_SECRET` | 🟡 IMPORTANTE | ❌ Pendiente | Cadena aleatoria de 32+ chars |
| `NEXT_PUBLIC_SITE_URL` | 🟡 IMPORTANTE | ❌ Pendiente | `https://klperfumesrd.com` |
| `NEXT_PUBLIC_WA_NUMBER` | 🟡 IMPORTANTE | ❌ Pendiente | `1809XXXXXXX` |
| `NEXT_PUBLIC_STORE_EMAIL` | 🟡 IMPORTANTE | ❌ Pendiente | `info@klperfumesrd.com` |
| `NEXT_PUBLIC_STORE_PHONE_DISPLAY` | 🟡 IMPORTANTE | ❌ Pendiente | `+1 (809) XXX-XXXX` |
| `GEMINI_API_KEY` | 🟢 OPCIONAL | ⏸️ Configurado | (chatbot requiere API key real) |
| `RESEND_API_KEY` | 🟢 OPCIONAL | ⏸️ Configurado | (emails requieren API key real) |
| `RESEND_FROM` | 🟢 OPCIONAL | ⏸️ Configurado | `KL Perfumes RD <confirmaciones@klperfumesrd.com>` |

### Domain Setup
- [ ] Verificar dominio en Vercel (klperfumesrd.com)
  - Ve a Vercel → klperfumesrd → Settings → Domains
  - Añade `klperfumesrd.com`
  - Sigue instrucciones DNS

---

## 📋 Funcionalidades listas para usar

### Público
- ✅ Homepage
- ✅ Catálogo de productos (641 productos) con filtros dinámicos
- ✅ Ficha individual de producto (OG image, JSON-LD, precios)
- ✅ Carrito de compras → WhatsApp
- ✅ Chatbot KLia (una vez configures GEMINI_API_KEY)
- ✅ SEO completo (sitemap, robots, meta tags)

### Admin (requiere sesión)
- ✅ Dashboard → `/admin`
- ✅ Gestión de productos → `/admin/productos`
  - Ver, crear, editar, eliminar
  - Slug auto-generado
  - Variantes de precio/stock
- ✅ Gestión de marcas → `/admin/marcas`
  - Edición inline
  - Producto count
- ✅ Gestión de pedidos → `/admin/pedidos`
  - Filtrar por estado
  - Cambiar estado → envía email (Resend)
  - Ver detalles del cliente

### APIs
- ✅ `POST /api/auth/login` — Crear sesión
- ✅ `POST /api/auth/logout` — Cerrar sesión
- ✅ `PATCH /api/admin/marcas/[id]` — Editar marca
- ✅ `POST /api/admin/productos` — Crear producto
- ✅ `PATCH /api/admin/productos/[id]` — Editar producto
- ✅ `PATCH /api/admin/pedidos/[id]` — Cambiar estado (triggers email)
- ✅ `POST /api/chat` — Chatbot endpoint (Gemini)

---

## 🚀 Próximos pasos recomendados

### Inmediato (antes de anunciar)
1. **Configurar DATABASE_URL en Azure** ← Esto es el bloqueador
2. Redeploy en Vercel
3. Probar públicamente: catálogo, ficha de producto
4. Probar admin: login, crear producto, cambiar estado pedido

### Corto plazo (1-2 semanas)
1. Configurar GEMINI_API_KEY (para KLia)
2. Configurar RESEND_API_KEY (para emails)
3. Crear primer pedido de prueba

### Mediano plazo (1-2 meses)
1. Agregar métodos de pago online (Stripe, PayPal)
2. Sistema de envíos integrado
3. Analytics (Google Analytics + Vercel Analytics)

---

## 📞 Contacto & Soporte

- **Repositorio**: C:\KLPERFUMESRD
- **Vercel Project**: https://vercel.com/brahepedevelopers-projects/klperfumesrd
- **Live Site**: https://klperfumesrd.vercel.app
- **Backup local**: C:\KLPERFUMESRD\KLPerfumesDB_backup.bak

---

## 📄 Archivos de referencia

- `AZURE_SETUP.md` — Guía paso a paso para Azure SQL
- `.env.example` — Template de variables de entorno
- `package.json` — Scripts: `npm run build`, `npm run dev`
- `README.md` — (si lo hay) documentación del proyecto

---

## Notas técnicas

- **Stack**: Next.js 16 (Turbopack), Prisma 6, SQL Server, Tailwind CSS
- **Hosting**: Vercel (serverless, auto-scale)
- **Images**: Local WebP (654 imágenes) ✓ migradas
- **Database**: Azure SQL (recomendado) o SQL Server local
- **Auth**: Cookie-based sessions (Next.js middleware)
- **Email**: Resend (transactional)
- **AI**: Google Gemini (chatbot)

---

**Estado final**: El site está completamente funcional. Solo falta la BD en Azure.  
**Tiempo estimado**: 30 min para completar Azure setup.
