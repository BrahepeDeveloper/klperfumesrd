"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/catalogo?genero=hombre", label: "Hombres" },
  { href: "/catalogo?genero=mujer", label: "Mujeres" },
  { href: "/sobre-nosotros", label: "Sobre Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export default function Header() {
  const { count, openCart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "glass-effect-strong py-2 border-b border-border"
          : "bg-gradient-to-b from-bg-primary to-transparent py-4"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 lg:px-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <Image
            src="/logo.png"
            alt="KL Perfumes RD"
            width={44}
            height={44}
            className="rounded-xl"
            priority
          />
          <span className="font-display text-lg tracking-wide text-text-primary hidden sm:inline">
            KL <span className="brand-gradient-text">Perfumes</span> RD
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 lg:flex flex-1 justify-center">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-secondary transition-colors duration-300 hover:text-accent-blue relative group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-accent-blue to-accent-teal group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto lg:ml-0">
          <button
            type="button"
            aria-label="Buscar"
            className="grid h-10 w-10 place-items-center rounded-lg text-text-secondary transition-all duration-300 hover:text-accent-blue hover:bg-bg-secondary"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          <button
            type="button"
            onClick={openCart}
            aria-label={`Carrito (${count} productos)`}
            className="relative grid h-10 w-10 place-items-center rounded-lg text-text-secondary transition-all duration-300 hover:text-accent-blue hover:bg-bg-secondary"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-gradient-to-r from-accent-blue to-accent-teal text-[10px] font-bold text-white">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
