"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/catalogo?genero=hombre", label: "Hombres" },
  { href: "/catalogo?genero=mujer", label: "Mujeres" },
  { href: "/ofertas", label: "Ofertas" },
  { href: "/contacto", label: "Contacto" },
];

export default function Header() {
  const { count, openCart } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="KL Perfumes RD"
            width={44}
            height={44}
            className="rounded-xl"
            priority
          />
          <span className="font-display text-lg tracking-wide text-ink">
            KL <span className="brand-gradient-text font-semibold">Perfumes</span> RD
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Buscar"
            className="grid h-10 w-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-black/5 hover:text-ink"
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
            className="relative grid h-10 w-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-black/5 hover:text-ink"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full brand-gradient-bg text-[10px] font-semibold text-white">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
