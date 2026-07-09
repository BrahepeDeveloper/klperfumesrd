import { prisma } from "@/lib/prisma";
import Hero from "@/components/Hero";
import TrustBadges from "@/components/TrustBadges";
import ProductCard, { type ProductCardData } from "@/components/ProductCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getFeaturedProducts(): Promise<ProductCardData[]> {
  try {
    const productos = await prisma.producto.findMany({
      where: { activo: true },
      take: 8,
      orderBy: { fechaCreacion: "desc" },
      include: {
        marca: true,
        genero: true,
        imagenes: { where: { esPrincipal: true }, take: 1 },
        variantes: { where: { activo: true } },
        familiasOlfativas: { include: { familia: true }, take: 1 },
      },
    });

    return productos.map((p) => {
      const precios = p.variantes.map((v) => Number(v.precio)).filter((n) => n > 0);
      return {
        slug: p.slug,
        nombre: p.nombre,
        marca: p.marca.nombre,
        genero: p.genero.nombre,
        imagenUrl: p.imagenes[0]?.urlWebp ?? null,
        precioDesde: precios.length > 0 ? Math.min(...precios) : 0,
        familiaOlfativa: p.familiasOlfativas[0]?.familia.nombre ?? null,
      };
    });
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "KL Perfumes RD",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://klperfumesrd.com",
  description:
    "Perfumería de lujo en República Dominicana. Fragancias originales y decants de más de 100 marcas premium.",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: "Spanish",
  },
  sameAs: [],
};

export default async function HomePage() {
  const productos = await getFeaturedProducts();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <Hero />
      <TrustBadges />

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-emerald">
              Recién Llegados
            </span>
            <h2 className="font-display mt-2 text-3xl text-ink">Las fragancias más solicitadas</h2>
          </div>
          <Link
            href="/catalogo"
            className="text-sm font-semibold text-ink underline decoration-brand-cyan decoration-2 underline-offset-4"
          >
            Ver catálogo completo →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {productos.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>

        {productos.length === 0 && (
          <p className="text-center text-sm text-ink-soft">
            No hay productos disponibles todavía. Corre el seed para cargar el catálogo.
          </p>
        )}
      </section>
    </>
  );
}
