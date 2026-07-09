import { waLink } from "@/lib/constants";

export const metadata = {
  title: "Nuestra Historia | KL Perfumes RD",
  description:
    "Conoce la historia de KL Perfumes RD, tu perfumería de lujo en República Dominicana. Fragancias 100% originales y decants de las mejores casas del mundo.",
};

export default function SobreNosotrosPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
      {/* Hero */}
      <div className="mb-16 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-emerald">
          Quiénes Somos
        </span>
        <h1 className="font-display mt-3 text-5xl leading-tight text-ink">
          Nuestra Historia
        </h1>
      </div>

      {/* Content */}
      <div className="prose-custom space-y-12">
        <section className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:items-center">
          <div className="aspect-square rounded-3xl bg-gradient-to-br from-brand-cyan/20 to-brand-emerald/20 flex items-center justify-center">
            <span className="font-display text-7xl brand-gradient-text font-bold">KL</span>
          </div>
          <div className="space-y-4">
            <h2 className="font-display text-3xl text-ink">La Pasión por las Fragancias</h2>
            <p className="text-sm leading-relaxed text-ink-soft">
              KL Perfumes RD nació de una profunda pasión por el arte de la perfumería. Somos una empresa
              dominicana dedicada a acercar las mejores fragancias del mundo a los aficionados de la
              República Dominicana, garantizando la autenticidad y calidad en cada producto.
            </p>
            <p className="text-sm leading-relaxed text-ink-soft">
              Nuestro catálogo incluye perfumes originales de las casas más reconocidas del mundo, así
              como decants para que puedas explorar y descubrir nuevas fragancias sin el compromiso de
              una botella completa.
            </p>
          </div>
        </section>

        <div className="my-12 h-px bg-ink/8" />

        <section className="grid gap-8 sm:grid-cols-3">
          {[
            {
              icon: "🏆",
              title: "100% Originales",
              text: "Todos nuestros productos son 100% auténticos, adquiridos directamente de distribuidores oficiales.",
            },
            {
              icon: "🚀",
              title: "Envíos a Toda la RD",
              text: "Llegamos a todos los rincones de la República Dominicana con envíos rápidos y seguros.",
            },
            {
              icon: "💎",
              title: "Decants Exclusivos",
              text: "Ofrecemos decants en 3ML, 5ML y 10ML para que puedas explorar sin compromiso.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl bg-cream-dark/60 p-6 text-center">
              <p className="text-4xl">{item.icon}</p>
              <h3 className="font-display mt-4 text-lg text-ink">{item.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">{item.text}</p>
            </div>
          ))}
        </section>

        <div className="my-12 h-px bg-ink/8" />

        <section className="text-center">
          <h2 className="font-display text-3xl text-ink">¿Por qué elegirnos?</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
            En KL Perfumes RD entendemos que elegir una fragancia es algo personal. Por eso ofrecemos
            asesoría personalizada para ayudarte a encontrar el aroma que mejor te represente.
            Contáctanos por WhatsApp y con gusto te orientamos.
          </p>
          <a
            href={waLink("Hola KL Perfumes 👋 Me gustaría recibir asesoría para elegir una fragancia.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2.5 rounded-2xl bg-[#25D366] px-8 py-4 text-sm font-bold text-white transition hover:bg-[#20ba5a] soft-shadow"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.118 1.524 5.853L.057 23.177a.75.75 0 0 0 .923.899l5.487-1.442A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.88 0-3.638-.5-5.157-1.376l-.361-.214-3.742.982.998-3.643-.234-.374A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
            Chatear con nosotros
          </a>
        </section>
      </div>
    </div>
  );
}
