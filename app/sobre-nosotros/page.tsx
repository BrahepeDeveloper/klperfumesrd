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
            <div className="relative aspect-square rounded-xl overflow-hidden glass-effect">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/20 to-accent-teal/20" />
              <Image
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop"
                alt="Brayam Herrera"
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-accent-teal text-sm font-medium uppercase tracking-widest">Fundador</span>
                <h2 className="font-display text-4xl text-text-primary mt-2">Brayam Herrera</h2>
              </div>
              <p className="text-text-secondary leading-relaxed">
                Fundada por Brayam Herrera, KL Perfumes RD busca combinar la pasión por las fragancias con la innovación tecnológica para ofrecer una experiencia de compra moderna, segura y confiable.
              </p>
              <p className="text-text-secondary/70 text-sm">
                Con años de experiencia en la industria, Brayam ha construido una plataforma que pone al cliente en el centro, garantizando autenticidad y calidad en cada transacción.
              </p>
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
