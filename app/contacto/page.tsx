export const metadata = {
  title: "Contacto | KL Perfumes RD",
  description:
    "Contáctanos por WhatsApp para hacer tu pedido o recibir asesoría personalizada. KL Perfumes RD, República Dominicana.",
};

import { waLink } from "@/lib/constants";
const WA_DEFAULT = `Hola KL Perfumes 👋 Quisiera hacer una consulta.`;

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
      {/* Header */}
      <div className="mb-14 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-teal">
          Estamos para Ayudarte
        </span>
        <h1 className="font-display mt-3 text-5xl text-text-primary">Contacto</h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-text-primary-soft">
          La forma más rápida de comunicarte con nosotros es a través de WhatsApp.
          ¡Respondemos en minutos!
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {/* WhatsApp card */}
        <div className="col-span-full rounded-3xl bg-[#25D366]/10 p-8 text-center sm:col-span-1 lg:col-span-1">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-[#25D366]">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.118 1.524 5.853L.057 23.177a.75.75 0 0 0 .923.899l5.487-1.442A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.88 0-3.638-.5-5.157-1.376l-.361-.214-3.742.982.998-3.643-.234-.374A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
          </div>
          <h2 className="font-display text-xl text-text-primary">WhatsApp</h2>
          <p className="mt-2 text-sm text-text-primary-soft">Pedidos y consultas rápidas</p>
          <a
            href={waLink(WA_DEFAULT)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block rounded-xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#20ba5a]"
          >
            Chatear ahora
          </a>
          <p className="mt-3 text-xs text-text-primary-soft">(809) 000-0000</p>
        </div>

        {/* Email card */}
        <div className="rounded-3xl bg-bg-primary-dark/60 p-8 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-bg-secondary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <h2 className="font-display text-xl text-text-primary">Email</h2>
          <p className="mt-2 text-sm text-text-primary-soft">Consultas y cotizaciones</p>
          <a
            href="mailto:info@klperfumesrd.com"
            className="mt-5 inline-block rounded-xl border border-ink/10 bg-bg-secondary px-6 py-3 text-sm font-bold text-text-primary transition hover:bg-bg-secondary hover:text-white"
          >
            Enviar correo
          </a>
          <p className="mt-3 text-xs text-text-primary-soft">info@klperfumesrd.com</p>
        </div>

        {/* Location card */}
        <div className="rounded-3xl bg-bg-primary-dark/60 p-8 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand-cyan/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1fc7ea" strokeWidth="2">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <h2 className="font-display text-xl text-text-primary">Ubicación</h2>
          <p className="mt-2 text-sm text-text-primary-soft">
            Santo Domingo,<br />República Dominicana
          </p>
          <p className="mt-5 text-xs font-semibold text-text-primary-soft uppercase tracking-wide">
            Delivery a toda la RD
          </p>
        </div>
      </div>

      {/* FAQ teaser */}
      <div className="mt-14 rounded-3xl border border-ink/8 p-8 text-center">
        <h2 className="font-display text-2xl text-text-primary">¿Tienes más preguntas?</h2>
        <p className="mt-2 text-sm text-text-primary-soft">
          Revisa nuestra sección de preguntas frecuentes para respuestas rápidas.
        </p>
        <a
          href="/preguntas-frecuentes"
          className="mt-6 inline-block rounded-xl border border-ink/10 px-6 py-3 text-sm font-semibold text-text-primary transition hover:bg-bg-secondary hover:text-white"
        >
          Ver preguntas frecuentes →
        </a>
      </div>
    </div>
  );
}
