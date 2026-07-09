import Hero from "@/components/Hero";
import TrustBadges from "@/components/TrustBadges";
import Link from "next/link";

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

export default function HomePage() {
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

        <div className="text-center py-12">
          <p className="text-sm text-ink-soft mb-4">
            Cargando productos...
          </p>
          <Link
            href="/catalogo"
            className="inline-block px-6 py-3 bg-brand-emerald text-cream rounded-lg font-medium"
          >
            Ir al Catálogo →
          </Link>
        </div>
      </section>
    </>
  );
}
