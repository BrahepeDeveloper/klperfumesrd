import Link from "next/link";
import { waLink, STORE_EMAIL, STORE_PHONE_DISPLAY } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-black/5 bg-bg-secondary text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
        <div>
          <span className="font-display text-lg">
            KL <span className="brand-gradient-text font-semibold">Perfumes</span> RD
          </span>
          <p className="mt-3 max-w-xs text-sm text-cream/60">
            Perfumería de lujo en República Dominicana. Fragancias originales y decants de las mejores
            casas del mundo.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-cream/80">Enlaces Rápidos</h3>
          <ul className="mt-4 space-y-2 text-sm text-cream/60">
            <li><Link href="/catalogo" className="hover:text-cream">Catálogo completo</Link></li>
            <li><Link href="/catalogo?genero=hombre" className="hover:text-cream">Perfumes para Hombre</Link></li>
            <li><Link href="/catalogo?genero=mujer" className="hover:text-cream">Perfumes para Mujer</Link></li>
            <li><Link href="/ofertas" className="hover:text-cream">Ofertas</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-cream/80">Sobre Nosotros</h3>
          <ul className="mt-4 space-y-2 text-sm text-cream/60">
            <li><Link href="/sobre-nosotros" className="hover:text-cream">Nuestra Historia</Link></li>
            <li><Link href="/contacto" className="hover:text-cream">Contacto</Link></li>
            <li><Link href="/preguntas-frecuentes" className="hover:text-cream">Preguntas Frecuentes</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-cream/80">Contacto</h3>
          <ul className="mt-4 space-y-2 text-sm text-cream/60">
            <li>Santo Domingo, República Dominicana</li>
            <li>
              <a href={waLink()} className="hover:text-cream">
                WhatsApp: {STORE_PHONE_DISPLAY}
              </a>
            </li>
            <li>
              <a href={`mailto:${STORE_EMAIL}`} className="hover:text-cream">
                {STORE_EMAIL}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <p className="mx-auto max-w-7xl px-6 text-center text-xs text-cream/40 lg:px-10">
          © {new Date().getFullYear()} KL Perfumes RD. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
