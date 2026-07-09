const BADGES = [
  {
    title: "100% Originales",
    desc: "Garantizamos la autenticidad de cada fragancia que vendemos.",
    icon: (
      <path d="M12 2 3 6v6c0 5 3.8 9.4 9 11 5.2-1.6 9-6 9-11V6l-9-4Z" />
    ),
  },
  {
    title: "Envíos a Toda RD",
    desc: "Entrega segura a todo el territorio dominicano.",
    icon: <path d="M3 7h13v9H3zM16 10h4l2 3v3h-6zM6.5 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18.5 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />,
  },
  {
    title: "Decants Disponibles",
    desc: "Prueba tu fragancia favorita en 5ML o 10ML antes de comprar la botella completa.",
    icon: <path d="M9 2h6M10 2v5.2a4 4 0 0 1-.8 2.4L7 13.5A6 6 0 0 0 6 17v3a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3a6 6 0 0 0-1-3.5l-2.2-3.9a4 4 0 0 1-.8-2.4V2" />,
  },
  {
    title: "Atención Personalizada",
    desc: "Te ayudamos a encontrar la fragancia ideal para cada ocasión.",
    icon: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />,
  },
];

export default function TrustBadges() {
  return (
    <section className="border-y border-black/5 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-12 sm:grid-cols-4 lg:px-10">
        {BADGES.map((b) => (
          <div key={b.title} className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <div className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-cream text-ink">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                {b.icon}
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-ink">{b.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">{b.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
