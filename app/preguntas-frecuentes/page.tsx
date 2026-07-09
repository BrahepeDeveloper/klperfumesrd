"use client";

import { useState } from "react";
import { waLink } from "@/lib/constants";

const FAQS = [
  {
    q: "¿Los productos son 100% originales?",
    a: "Sí. Todos nuestros productos son 100% auténticos, adquiridos a través de distribuidores oficiales y canales verificados. Tu confianza es nuestra prioridad.",
  },
  {
    q: "¿Qué es un decant?",
    a: "Un decant es una pequeña muestra (3ML, 5ML ó 10ML) de un perfume original, trasvasada directamente de la botella del fabricante. Es perfecto para probar una fragancia antes de comprar la botella completa.",
  },
  {
    q: "¿Hacen envíos a toda la República Dominicana?",
    a: "Sí, hacemos envíos a todo el país. El tiempo de entrega y costo varía según la provincia. Puedes consultarnos por WhatsApp para más detalles sobre envíos a tu zona.",
  },
  {
    q: "¿Cómo hago un pedido?",
    a: "El proceso es muy sencillo: 1) Elige tu fragancia y presentación en nuestro catálogo. 2) Haz clic en «Pedir por WhatsApp». 3) Confirma tu pedido con nuestro equipo. ¡Listo!",
  },
  {
    q: "¿Cuáles son los métodos de pago aceptados?",
    a: "Aceptamos transferencias bancarias, pagos por WhatsApp y efectivo. Consulta las opciones disponibles al momento de tu pedido.",
  },
  {
    q: "¿Puedo devolver un producto si no me gusta?",
    a: "Dado que los perfumes son productos de higiene personal, no aceptamos devoluciones una vez el producto ha sido usado. Sin embargo, si recibes un producto dañado o incorrecto, contáctanos de inmediato para resolverlo.",
  },
  {
    q: "¿Tienen tienda física?",
    a: "Por el momento operamos solo en línea con entregas a domicilio. Puedes contactarnos por WhatsApp para coordinar una entrega o recogida en Santo Domingo.",
  },
  {
    q: "¿Cómo puedo saber qué fragancia es la indicada para mí?",
    a: "Nuestro equipo está disponible para asesorarte gratuitamente. Escríbenos por WhatsApp describiendo tus gustos (fresco, dulce, amaderado, etc.), la ocasión y tu preferencia de intensidad, y te recomendaremos las opciones perfectas.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-ink/8">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-semibold text-text-primary">{q}</span>
        <span
          className={`shrink-0 text-accent-blue transition-transform duration-300 ${open ? "rotate-45" : ""}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </span>
      </button>
      {open && (
        <p className="pb-5 text-sm leading-relaxed text-text-primary-soft">{a}</p>
      )}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 lg:px-10">
      <div className="mb-12 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-teal">
          Resolvemos tus dudas
        </span>
        <h1 className="font-display mt-3 text-5xl text-text-primary">
          Preguntas Frecuentes
        </h1>
      </div>

      <div className="divide-y-0">
        {FAQS.map((faq) => (
          <FaqItem key={faq.q} q={faq.q} a={faq.a} />
        ))}
      </div>

      <div className="mt-14 rounded-3xl bg-bg-secondary p-8 text-center text-cream">
        <p className="font-display text-xl">¿Tu pregunta no está aquí?</p>
        <p className="mt-2 text-sm text-cream/60">Escríbenos directamente por WhatsApp.</p>
        <a
          href={waLink("Hola KL Perfumes 👋 Tengo una consulta.")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#20ba5a]"
        >
          Chatear por WhatsApp
        </a>
      </div>
    </div>
  );
}
