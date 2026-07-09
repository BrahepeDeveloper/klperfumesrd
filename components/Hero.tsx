import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream">
      <div className="pointer-events-none absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-brand-cyan/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-[-10%] h-[420px] w-[420px] rounded-full bg-brand-emerald/20 blur-3xl" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center lg:py-32">
        <span className="mb-5 rounded-full border border-black/10 bg-white/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-ink-soft">
          Fragancias originales · Envíos a toda RD
        </span>
        <h1 className="font-display max-w-3xl text-4xl leading-tight text-ink sm:text-5xl lg:text-6xl">
          Encuentra la fragancia que{" "}
          <span className="brand-gradient-text">te define</span>
        </h1>
        <p className="mt-6 max-w-xl text-base text-ink-soft sm:text-lg">
          Explora nuestro catálogo de perfumes originales y decants de las casas más exclusivas del
          mundo — Lattafa, Maison Alhambra, Rasasi, Dior y más de 100 marcas.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/catalogo"
            className="brand-gradient-bg soft-shadow rounded-full px-8 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
          >
            Explorar Catálogo
          </Link>
          <Link
            href="/contacto"
            className="rounded-full border border-black/10 bg-white px-8 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-black/5"
          >
            Contáctanos
          </Link>
        </div>
      </div>
    </section>
  );
}
