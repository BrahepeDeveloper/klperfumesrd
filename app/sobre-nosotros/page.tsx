"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

function CountUp({ target, duration = 2 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true;
        const start = 0;
        const increment = target / (duration * 60);
        let current = start;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            setCount(target);
            clearInterval(timer);
          } else {
            setCount(Math.floor(current));
          }
        }, 1000 / 60);

        return () => clearInterval(timer);
      }
    });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <div ref={ref}>{count.toLocaleString()}</div>;
}

export default function AboutPage() {
  return (
    <main className="bg-bg-primary">
      <section className="min-h-screen flex items-center py-32 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-6">
            <div>
              <span className="text-accent-blue text-sm font-medium uppercase tracking-widest">Nuestra Historia</span>
              <h1 className="font-display text-5xl sm:text-6xl text-text-primary mt-3 leading-tight">
                La pasión por las fragancias <span className="brand-gradient-text">te define</span>
              </h1>
            </div>
            <p className="text-lg text-text-secondary leading-relaxed max-w-2xl">
              KL Perfumes RD nace con la misión de ofrecer perfumes 100% originales, decants y fragancias exclusivas de las mejores casas del mundo, brindando calidad, confianza y una excelente experiencia de compra a cada cliente.
            </p>
            <p className="text-base text-text-secondary/70 leading-relaxed max-w-2xl">
              Creemos que cada fragancia cuenta una historia, y queremos ayudarte a encontrar la tuya. Desde Lattafa hasta Dior, desde Rasasi hasta Maison Alhambra — cada perfume en nuestro catálogo es seleccionado con cuidado.
            </p>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 border-t border-border">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-square rounded-2xl overflow-hidden group bg-bg-secondary flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/30 to-accent-teal/30 group-hover:from-accent-blue/50 group-hover:to-accent-teal/50 transition-all duration-300" />
              <Image
                src="/logo.png"
                alt="KL Perfumes RD Logo"
                width={300}
                height={300}
                className="object-contain group-hover:scale-110 transition-transform duration-300 z-10"
              />
              <div className="absolute inset-0 border border-accent-blue/30 rounded-2xl group-hover:border-accent-teal/50 transition-all duration-300" />
            </div>

            <div className="space-y-8">
              <div>
                <span className="text-accent-teal text-sm font-medium uppercase tracking-widest">CEO & Fundador</span>
                <h2 className="font-display text-5xl text-text-primary mt-2">Kelvin Encarnacion</h2>
              </div>
              <p className="text-text-secondary leading-relaxed text-lg">
                Fundada por Kelvin Encarnacion, KL Perfumes RD busca combinar la pasión por las fragancias con la innovación tecnológica para ofrecer una experiencia de compra moderna, segura y confiable.
              </p>
              <p className="text-text-secondary/70">
                Con años de experiencia en la industria, Kelvin ha construido una plataforma que pone al cliente en el centro, garantizando autenticidad y calidad en cada transacción.
              </p>

              {/* Social Media Icons with Descriptions */}
              <div className="flex gap-4 pt-4">
                <div className="group/tooltip relative">
                  <a href="https://wa.me/18297884389" className="group/icon p-3 rounded-lg glass-effect hover:glow-blue transition-all duration-300 transform hover:scale-110">
                    <svg className="w-6 h-6 text-accent-blue group-hover/icon:text-accent-teal transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.759.975-.927 1.174-.168.198-.34.221-.637.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.935 1.237c-1.546.828-2.846 2.045-3.749 3.52C2.08 9.286 1.5 11.04 1.5 12.847c0 1.807.58 3.561 1.637 5.031 1.104 1.59 2.656 2.93 4.514 3.816 1.858.886 3.948 1.342 6.176 1.342s4.317-.456 6.176-1.342c1.858-.886 3.41-2.226 4.514-3.816 1.057-1.47 1.637-3.224 1.637-5.031 0-1.807-.58-3.561-1.637-5.031-1.104-1.59-2.656-2.93-4.514-3.816a9.87 9.87 0 00-4.935-1.237z"/>
                    </svg>
                  </a>
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-text-secondary opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                    Contacta por WhatsApp
                  </div>
                </div>

                <div className="group/tooltip relative">
                  <a href="https://www.instagram.com/klperfumesrd?igsh=MW1sYm4zdGg1dmIxeA==" className="group/icon p-3 rounded-lg glass-effect hover:glow-teal transition-all duration-300 transform hover:scale-110">
                    <svg className="w-6 h-6 text-accent-teal group-hover/icon:text-accent-blue transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                    </svg>
                  </a>
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-text-secondary opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                    Síguenos: +850 seguidores
                  </div>
                </div>

                <div className="group/tooltip relative">
                  <a href="https://www.facebook.com/share/196F6E58fH" className="group/icon p-3 rounded-lg glass-effect hover:glow-blue transition-all duration-300 transform hover:scale-110">
                    <svg className="w-6 h-6 text-accent-blue group-hover/icon:text-accent-teal transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-text-secondary opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                    Únete a nuestra comunidad
                  </div>
                </div>

                <div className="group/tooltip relative">
                  <a href="https://youtube.com/@klperfumesrd?si=7QcJJCHhSP8XwQnr" className="group/icon p-3 rounded-lg glass-effect hover:glow-teal transition-all duration-300 transform hover:scale-110">
                    <svg className="w-6 h-6 text-accent-teal group-hover/icon:text-accent-blue transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-text-secondary opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                    Mira nuestros reviews
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 border-t border-border bg-bg-secondary/30">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-accent-blue text-sm font-medium uppercase tracking-widest">Nuestro Impacto</span>
            <h2 className="font-display text-4xl text-text-primary mt-3">Números que hablan</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: "👥", label: "Clientes satisfechos", value: 850 },
              { icon: "📦", label: "Pedidos entregados", value: 3200 },
              { icon: "⭐", label: "Marcas disponibles", value: 100 },
              { icon: "🕒", label: "Años de experiencia", value: 3 },
            ].map((stat, i) => (
              <div key={i} className="glass-effect p-8 rounded-xl text-center space-y-3 hover:glow-teal transition-all duration-300">
                <span className="text-4xl">{stat.icon}</span>
                <div className="font-display text-4xl text-accent-teal">
                  +<CountUp target={stat.value} />
                </div>
                <p className="text-text-secondary/70 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-6 border-t border-border">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-accent-teal text-sm font-medium uppercase tracking-widest">Nuestros Valores</span>
            <h2 className="font-display text-4xl text-text-primary mt-3">Nuestra Filosofía</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "✓", title: "Originalidad", description: "Solo vendemos perfumes 100% originales verificados." },
              { icon: "◆", title: "Calidad", description: "Trabajamos únicamente con productos auténticos de las mejores marcas." },
              { icon: "★", title: "Confianza", description: "Miles de clientes satisfechos respaldan nuestro compromiso." },
            ].map((value, i) => (
              <div key={i} className="glass-effect p-8 rounded-xl space-y-4 hover:border-accent-blue transition-all duration-300 group cursor-pointer" style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}>
                <div className="text-3xl text-accent-blue group-hover:scale-110 transition-transform duration-300">
                  {value.icon}
                </div>
                <h3 className="font-display text-xl text-text-primary">{value.title}</h3>
                <p className="text-text-secondary/70 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-6 border-t border-border">
        <div className="mx-auto max-w-3xl text-center space-y-8">
          <div>
            <h2 className="font-display text-5xl text-text-primary mb-4">
              Descubre la fragancia perfecta para ti
            </h2>
            <p className="text-text-secondary text-lg">
              Explora nuestro catálogo de más de 650 fragancias originales y encuentra el aroma que te representa.
            </p>
          </div>
          <Link href="/catalogo" className="btn-premium inline-block px-12 py-4 font-semibold text-white">
            Explorar Catálogo
          </Link>
        </div>
      </section>
    </main>
  );
}
