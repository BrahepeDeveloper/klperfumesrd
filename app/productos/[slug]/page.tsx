import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import ProductVariantSelector from "@/components/ProductVariantSelector";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function getProduct(slug: string) {
  return prisma.producto.findUnique({
    where: { slug },
    include: {
      marca: true,
      genero: true,
      concentracion: true,
      imagenes: { orderBy: [{ esPrincipal: "desc" }, { orden: "asc" }] },
      variantes: {
        where: { activo: true },
        include: { tipoVariante: true },
        orderBy: { tipoVariante: { orden: "asc" } },
      },
      familiasOlfativas: { include: { familia: true } },
      temporadas: { include: { temporada: true } },
      ocasiones: { include: { ocasion: true } },
      notas: {
        include: { nota: true },
        orderBy: { orden: "asc" },
      },
    },
  });
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return {};

  const desc =
    p.descripcionCorta ??
    `Compra ${p.nombre} de ${p.marca.nombre} en KL Perfumes RD. Fragancias originales con envíos a toda República Dominicana.`;

  const mainImage = p.imagenes[0];
  const ogImage = mainImage?.urlWebp
    ? mainImage.urlWebp.startsWith("/")
      ? mainImage.urlWebp          // local path — metadataBase makes it absolute
      : undefined                  // old external URL — skip
    : undefined;

  const minPrice = p.variantes.length > 0
    ? Math.min(...p.variantes.map((v) => Number(v.precio)))
    : null;

  return {
    title: `${p.nombre} — ${p.marca.nombre}`,
    description: desc,
    openGraph: {
      title: `${p.nombre} — ${p.marca.nombre}`,
      description: desc,
      type: "website",
      ...(ogImage && {
        images: [{ url: ogImage, width: 1200, height: 1200, alt: mainImage?.textoAlternativo ?? p.nombre }],
      }),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: `${p.nombre} — ${p.marca.nombre}`,
      description: desc,
      ...(ogImage && { images: [ogImage] }),
    },
    other: minPrice
      ? { "product:price:amount": String(minPrice), "product:price:currency": "DOP" }
      : {},
  };
}

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const mainImage =
    product.imagenes.find((i) => i.esPrincipal) ?? product.imagenes[0];
  const otherImages = product.imagenes.filter(
    (i) => i.imagenId !== mainImage?.imagenId
  );

  const families = product.familiasOlfativas.map((pf) => pf.familia.nombre);
  const seasons = product.temporadas.map((pt) => pt.temporada.nombre);
  const occasions = product.ocasiones.map((po) => po.ocasion.nombre);

  const notesByPosition = product.notas.reduce<
    Record<string, string[]>
  >((acc, n) => {
    if (!acc[n.posicion]) acc[n.posicion] = [];
    acc[n.posicion].push(n.nota.nombre);
    return acc;
  }, {});

  const variantData = product.variantes.map((v) => ({
    varianteId: v.varianteId,
    nombre: v.tipoVariante.nombre,
    precio: Number(v.precio),
    precioComparacion: v.precioComparacion ? Number(v.precioComparacion) : null,
    stock: v.stock,
  }));

  // WhatsApp message base (unencoded — client component will encode the full message)
  const waBase = `Hola KL Perfumes 👋 Me interesa: *${product.nombre}* (${product.marca.nombre})`;

  // Also pass product name for the "Consultar" WhatsApp button
  const waConsult = `Hola KL Perfumes 👋 ¿Tienen disponible *${product.nombre}* de ${product.marca.nombre}?`;

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://klperfumesrd.com";
  const mainImageUrl = mainImage?.urlWebp?.startsWith("/")
    ? `${SITE_URL}${mainImage.urlWebp}`
    : mainImage?.urlWebp;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nombre,
    brand: { "@type": "Brand", name: product.marca.nombre },
    ...(product.descripcionCorta && { description: product.descripcionCorta }),
    ...(mainImageUrl && { image: mainImageUrl }),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "DOP",
      lowPrice: variantData.length > 0 ? Math.min(...variantData.map((v) => v.precio)) : undefined,
      offerCount: variantData.length,
      availability: variantData.some((v) => v.stock > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-10">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-xs text-ink-soft">
        <Link href="/" className="hover:text-ink">Inicio</Link>
        <span>/</span>
        <Link href="/catalogo" className="hover:text-ink">Catálogo</Link>
        <span>/</span>
        <Link
          href={`/catalogo?genero=${product.genero.slug}`}
          className="hover:text-ink"
        >
          {product.genero.nombre}
        </Link>
        <span>/</span>
        <span className="text-ink line-clamp-1">{product.nombre}</span>
      </nav>

      <div className="lg:grid lg:grid-cols-[1fr_480px] lg:gap-14 xl:grid-cols-[1fr_520px]">
        {/* ── Left: Images ── */}
        <div className="mb-10 lg:mb-0">
          {/* Main image */}
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-cream-dark soft-shadow">
            {mainImage ? (
              <Image
                src={mainImage.urlWebp}
                alt={mainImage.textoAlternativo ?? product.nombre}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-sm text-ink-soft">
                Imagen no disponible
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {otherImages.length > 0 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {otherImages.slice(0, 5).map((img) => (
                <div
                  key={img.imagenId}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cream-dark"
                >
                  <Image
                    src={img.urlWebp}
                    alt={img.textoAlternativo ?? product.nombre}
                    fill
                    loading="lazy"
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Info ── */}
        <div>
          {/* Badges row */}
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold text-ink-soft">
              {product.genero.nombre}
            </span>
            {product.concentracion && (
              <span className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold text-ink-soft">
                {product.concentracion.nombre}
              </span>
            )}
            {families.map((f) => (
              <span
                key={f}
                className="rounded-full bg-brand-emerald/10 px-3 py-1 text-xs font-semibold text-brand-emerald"
              >
                {f}
              </span>
            ))}
          </div>

          {/* Brand + Name */}
          <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">
            {product.marca.nombre}
          </p>
          <h1 className="font-display mt-1 text-4xl leading-tight text-ink">
            {product.nombre}
          </h1>

          {/* Description */}
          {product.descripcionCorta && (
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              {product.descripcionCorta}
            </p>
          )}

          {/* Variant selector + price — client component */}
          <ProductVariantSelector
            variants={variantData}
            waBase={waBase}
            waConsult={waConsult}
            slug={product.slug}
            nombre={product.nombre}
            marca={product.marca.nombre}
            imagenUrl={mainImage?.urlWebp ?? null}
          />

          {/* Tags */}
          {(seasons.length > 0 || occasions.length > 0) && (
            <div className="mt-8 space-y-3 rounded-2xl bg-cream-dark/60 p-4">
              {seasons.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                    Temporada
                  </span>
                  {seasons.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-ink/10 px-2.5 py-0.5 text-xs text-ink"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
              {occasions.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                    Ocasión
                  </span>
                  {occasions.map((o) => (
                    <span
                      key={o}
                      className="rounded-full border border-ink/10 px-2.5 py-0.5 text-xs text-ink"
                    >
                      {o}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Olfactive pyramid */}
          {Object.keys(notesByPosition).length > 0 && (
            <div className="mt-8">
              <h2 className="font-display mb-4 text-lg text-ink">
                Pirámide Olfativa
              </h2>
              <div className="space-y-3">
                {(["Salida", "Corazon", "Fondo"] as const).map((pos) => {
                  const notes = notesByPosition[pos];
                  if (!notes?.length) return null;
                  const labels: Record<string, string> = {
                    Salida: "Notas de Salida",
                    Corazon: "Notas de Corazón",
                    Fondo: "Notas de Fondo",
                  };
                  return (
                    <div key={pos} className="flex gap-3">
                      <span className="mt-0.5 w-28 shrink-0 text-xs font-bold uppercase tracking-wider text-ink-soft">
                        {labels[pos]}
                      </span>
                      <p className="text-sm text-ink">{notes.join(", ")}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Trust mini-badges */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { icon: "✓", text: "100% Original" },
              { icon: "🚚", text: "Envío a toda RD" },
              { icon: "💬", text: "Asesoría gratis" },
            ].map((b) => (
              <div
                key={b.text}
                className="flex flex-col items-center gap-1 rounded-xl bg-cream-dark/60 p-3 text-center"
              >
                <span className="text-lg">{b.icon}</span>
                <span className="text-[10px] font-semibold text-ink-soft">
                  {b.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Long description */}
      {product.descripcionLarga && (
        <section className="mt-16 max-w-2xl">
          <h2 className="font-display mb-4 text-2xl text-ink">
            Sobre esta fragancia
          </h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">
            {product.descripcionLarga}
          </p>
        </section>
      )}
    </div>
    </>
  );
}
