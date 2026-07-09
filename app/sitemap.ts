import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://klperfumesrd.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/catalogo`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/ofertas`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/sobre-nosotros`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contacto`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/preguntas-frecuentes`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  // Product pages
  const productos = await prisma.producto.findMany({
    where: { activo: true },
    select: { slug: true, fechaActualizacion: true },
    orderBy: { fechaActualizacion: "desc" },
  });

  const productPages: MetadataRoute.Sitemap = productos.map((p) => ({
    url: `${SITE_URL}/productos/${p.slug}`,
    lastModified: p.fechaActualizacion,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...productPages];
}
