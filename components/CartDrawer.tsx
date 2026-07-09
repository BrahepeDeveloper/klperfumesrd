"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { waLink } from "@/lib/constants";

function buildWhatsAppMessage(
  items: ReturnType<typeof useCart>["items"],
  total: number
): string {
  const lines = items.map(
    (i) =>
      `• *${i.nombre}* (${i.marca}) — ${i.varianteNombre} x${i.cantidad} → ${formatPrice(i.precio * i.cantidad)}`
  );
  return [
    "Hola KL Perfumes 👋 Me gustaría hacer el siguiente pedido:",
    "",
    ...lines,
    "",
    `*Total estimado: ${formatPrice(total)}*`,
    "",
    "¿Me pueden confirmar disponibilidad y método de pago? 🙏",
  ].join("\n");
}

export default function CartDrawer() {
  const { items, open, total, count, remove, updateQty, clear, closeCart } =
    useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) closeCart();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeCart]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const waUrl = waLink(buildWhatsAppMessage(items, total));

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-label="Carrito de compras"
        aria-modal="true"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-bg-secondary shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink/8 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg text-text-primary">Mi Carrito</span>
            {count > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full brand-gradient-bg text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="grid h-9 w-9 place-items-center rounded-full text-text-primary-soft transition hover:bg-bg-secondary/5"
            aria-label="Cerrar carrito"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-text-primary/20">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <p className="mt-4 font-display text-lg text-text-primary">Tu carrito está vacío</p>
              <p className="mt-1 text-sm text-text-primary-soft">
                Explora nuestro catálogo y agrega fragancias.
              </p>
              <Link
                href="/catalogo"
                onClick={closeCart}
                className="mt-6 rounded-xl bg-bg-secondary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-bg-secondary/80"
              >
                Explorar catálogo
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-ink/6 px-5">
              {items.map((item) => (
                <li key={item.varianteId} className="flex gap-4 py-4">
                  {/* Image */}
                  <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-xl bg-bg-primary-dark">
                    {item.imagenUrl ? (
                      <Image
                        src={item.imagenUrl}
                        alt={item.nombre}
                        fill
                        sizes="72px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-[10px] text-text-primary-soft/40">
                        KLP
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-text-primary-soft">
                          {item.marca}
                        </p>
                        <p className="font-display text-sm leading-tight text-text-primary">
                          {item.nombre}
                        </p>
                        <p className="mt-0.5 text-xs text-text-primary-soft">
                          {item.varianteNombre}
                        </p>
                      </div>
                      <button
                        onClick={() => remove(item.varianteId)}
                        className="shrink-0 text-text-primary-soft/40 transition hover:text-text-primary"
                        aria-label="Eliminar"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      {/* Qty controls */}
                      <div className="flex items-center rounded-lg border border-ink/10">
                        <button
                          onClick={() => updateQty(item.varianteId, item.cantidad - 1)}
                          className="grid h-8 w-8 place-items-center text-text-primary-soft transition hover:text-text-primary"
                          aria-label="Reducir cantidad"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-semibold text-text-primary">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => updateQty(item.varianteId, item.cantidad + 1)}
                          className="grid h-8 w-8 place-items-center text-text-primary-soft transition hover:text-text-primary"
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-text-primary">
                        {formatPrice(item.precio * item.cantidad)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-ink/8 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-primary-soft">Total estimado</span>
              <span className="font-display text-2xl text-text-primary">{formatPrice(total)}</span>
            </div>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeCart}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] py-4 text-sm font-bold text-white transition hover:bg-[#20ba5a] soft-shadow"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.118 1.524 5.853L.057 23.177a.75.75 0 0 0 .923.899l5.487-1.442A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.88 0-3.638-.5-5.157-1.376l-.361-.214-3.742.982.998-3.643-.234-.374A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              Finalizar pedido por WhatsApp
            </a>

            <button
              onClick={clear}
              className="w-full text-xs font-semibold text-text-primary-soft/60 underline underline-offset-4 transition hover:text-text-primary-soft"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  );
}
