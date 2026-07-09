"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Hero() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-bg-primary via-bg-primary to-bg-secondary">
      {/* Animated Glow Orbs */}
      <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full blur-3xl animate-glow-pulse" style={{
        background: 'radial-gradient(circle, rgba(22, 200, 245, 0.2) 0%, transparent 70%)',
        animation: 'glowPulse 4s ease-in-out infinite'
      }} />
      <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 rounded-full blur-3xl animate-glow-pulse" style={{
        background: 'radial-gradient(circle, rgba(65, 230, 194, 0.15) 0%, transparent 70%)',
        animation: 'glowPulse 5s ease-in-out infinite 1s'
      }} />

      {/* Floating Particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-accent-blue/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `floatParticle ${4 + i * 0.5}s ease-in infinite`,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className={`relative mx-auto flex max-w-5xl flex-col items-center px-6 py-32 text-center transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* Badge */}
        <div className="glass-effect mb-8 inline-block px-6 py-2 backdrop-blur-md">
          <span className="text-xs font-medium uppercase tracking-widest text-accent-blue">
            ✨ Fragancias originales · Envíos a toda RD
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="font-display max-w-4xl text-5xl leading-tight text-text-primary sm:text-6xl lg:text-7xl">
          Encuentra la fragancia que{" "}
          <span className="brand-gradient-text">te define</span>
        </h1>

        {/* Subheading */}
        <p className="mt-8 max-w-2xl text-lg text-text-secondary leading-relaxed">
          Explora nuestro catálogo de perfumes 100% originales y decants de las casas más exclusivas del mundo — Lattafa, Maison Alhambra, Rasasi, Dior y más de 100 marcas premium.
        </p>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/catalogo"
            className="btn-premium group relative px-8 py-4 font-semibold text-white"
          >
            <span className="relative z-10">Explorar Catálogo</span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent-blue to-accent-teal opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg" />
          </Link>

          <Link
            href="/contacto"
            className="btn-premium-outline px-8 py-4 font-semibold"
          >
            Contáctanos
          </Link>
        </div>

        {/* Stats Line */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent-blue"></span>
            <span>+850 clientes satisfechos</span>
          </div>
          <div className="hidden sm:block h-px w-px rounded-full bg-text-secondary/30"></div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent-teal"></span>
            <span>100+ marcas disponibles</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <p className="text-xs text-text-secondary uppercase tracking-widest">Explorar</p>
        <svg className="h-5 w-5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
