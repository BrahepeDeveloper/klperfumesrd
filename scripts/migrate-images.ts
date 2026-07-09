/**
 * Image Migration Script
 * Downloads all product images from the old server, converts to WebP,
 * saves to public/images/productos/, and updates the DB urlWebp field.
 *
 * Usage:
 *   npx tsx scripts/migrate-images.ts
 *   npx tsx scripts/migrate-images.ts --dry-run   # show what would be done
 *   npx tsx scripts/migrate-images.ts --reset      # re-download already-migrated images
 */

import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";

// ── Config ─────────────────────────────────────────────────────────────────
const OUT_DIR = path.join(process.cwd(), "public", "images", "productos");
const WEBP_QUALITY = 82;
const MAX_WIDTH = 1200;
const CONCURRENCY = 4;         // parallel downloads
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1500;
const REQUEST_TIMEOUT_MS = 20_000;
const DRY_RUN = process.argv.includes("--dry-run");
const RESET = process.argv.includes("--reset");

// ── Helpers ─────────────────────────────────────────────────────────────────
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function downloadBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const mod = parsed.protocol === "https:" ? https : http;

    const req = mod.get(
      url,
      {
        timeout: REQUEST_TIMEOUT_MS,
        rejectUnauthorized: false, // old server has self-signed cert
        headers: { "User-Agent": "KLPerfumes-ImageMigration/1.0" },
      },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      }
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error(`Timeout downloading ${url}`));
    });
  });
}

async function downloadWithRetry(url: string): Promise<Buffer> {
  let lastErr: Error = new Error("unknown");
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      return await downloadBuffer(url);
    } catch (e) {
      lastErr = e as Error;
      if (attempt < RETRY_ATTEMPTS) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }
  throw lastErr;
}

async function toWebp(input: Buffer, outPath: string): Promise<{ bytes: number }> {
  await sharp(input)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toFile(outPath);
  const { size } = fs.statSync(outPath);
  return { bytes: size };
}

function outFilename(productoId: number, imagenId: number): string {
  return `${productoId}-${imagenId}.webp`;
}

function outPath(productoId: number, imagenId: number): string {
  return path.join(OUT_DIR, outFilename(productoId, imagenId));
}

function publicUrl(productoId: number, imagenId: number): string {
  return `/images/productos/${outFilename(productoId, imagenId)}`;
}

function isAlreadyMigrated(urlWebp: string): boolean {
  return urlWebp.startsWith("/images/");
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  if (DRY_RUN) console.log("🔎 DRY RUN — no files or DB changes will be made\n");
  if (!DRY_RUN) fs.mkdirSync(OUT_DIR, { recursive: true });

  const prisma = new PrismaClient();

  const images = await prisma.productoImagen.findMany({
    orderBy: { imagenId: "asc" },
    select: {
      imagenId: true,
      productoId: true,
      urlWebp: true,
      textoAlternativo: true,
    },
  });

  const toProcess = RESET
    ? images
    : images.filter((img) => !isAlreadyMigrated(img.urlWebp));

  const alreadyDone = images.length - toProcess.length;
  console.log(`📦 Total imágenes en DB: ${images.length}`);
  console.log(`✅ Ya migradas:          ${alreadyDone}`);
  console.log(`⬇️  Por procesar:         ${toProcess.length}\n`);

  if (toProcess.length === 0) {
    console.log("Nada que hacer. Todas las imágenes ya están migradas.");
    await prisma.$disconnect();
    return;
  }

  // Stats
  let ok = 0;
  let failed = 0;
  let savedBytes = 0;
  const errors: { imagenId: number; url: string; error: string }[] = [];

  // Process in batches of CONCURRENCY
  for (let i = 0; i < toProcess.length; i += CONCURRENCY) {
    const batch = toProcess.slice(i, i + CONCURRENCY);

    await Promise.all(
      batch.map(async (img) => {
        const idx = i + batch.indexOf(img) + 1;
        const pct = ((idx + alreadyDone) / images.length * 100).toFixed(0);
        const label = `[${String(idx + alreadyDone).padStart(3)}/${images.length}] (${pct}%)`;

        const dest = outPath(img.productoId, img.imagenId);
        const newUrl = publicUrl(img.productoId, img.imagenId);

        try {
          if (DRY_RUN) {
            console.log(`${label} DRY → ${img.urlWebp.split("/").slice(-1)[0]}`);
            ok++;
            return;
          }

          // Skip if file already exists (and not --reset)
          if (!RESET && fs.existsSync(dest)) {
            // File exists but DB not updated yet — just update DB
            await prisma.productoImagen.update({
              where: { imagenId: img.imagenId },
              data: { urlWebp: newUrl },
            });
            console.log(`${label} ⚡ skip (file exists) → ${newUrl}`);
            ok++;
            return;
          }

          const buf = await downloadWithRetry(img.urlWebp);
          const { bytes } = await toWebp(buf, dest);
          savedBytes += bytes;

          await prisma.productoImagen.update({
            where: { imagenId: img.imagenId },
            data: { urlWebp: newUrl },
          });

          const alt = img.textoAlternativo ?? "?";
          console.log(`${label} ✅ ${formatBytes(bytes).padStart(7)} ${alt.slice(0, 40)}`);
          ok++;
        } catch (e) {
          const err = (e as Error).message;
          console.error(`${label} ❌ imagenId=${img.imagenId} — ${err}`);
          errors.push({ imagenId: img.imagenId, url: img.urlWebp, error: err });
          failed++;
        }
      })
    );
  }

  await prisma.$disconnect();

  // Summary
  console.log("\n─────────────────────────────────────────");
  console.log(`✅ OK:       ${ok}`);
  console.log(`❌ Fallidos: ${failed}`);
  if (!DRY_RUN) console.log(`💾 Guardado: ${formatBytes(savedBytes)}`);

  if (errors.length > 0) {
    const logPath = path.join(process.cwd(), "scripts", "migrate-images-errors.json");
    fs.writeFileSync(logPath, JSON.stringify(errors, null, 2));
    console.log(`\n⚠️  Errores guardados en: ${logPath}`);
    console.log("   Re-ejecuta el script para reintentar solo los fallidos.");
  }

  console.log("─────────────────────────────────────────\n");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
