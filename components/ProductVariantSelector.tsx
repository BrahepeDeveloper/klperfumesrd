"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { waLink } from "@/lib/constants";

type Variant = {
  varianteId: number;
  nombre: string;
  precio: number;
  precioComparacion: number | null;
  stock: number;
};

export default function ProductVariantSelector({
  variants,
  waBase,
  waConsult,
  // Product info needed to add to cart
  slug,
  nombre,
  marca,
  imagenUrl,
}: {
  variants: Variant[];
  waBase: string;
  waConsult: string;
  slug: string;
  nombre: string;
  marca: string;
  imagenUrl: string | null;
}) {
  const { add } = useCart();
  const [selectedId, setSelectedId] = useState<number>(
    variants[0]?.varianteId ?? 0
  );
  const [added, setAdded] = useState(false);

  const selected = variants.find((v) => v.varianteId === selectedId) ?? variants[0];
  const inStock = selected ? selected.stock > 0 : false;

  const waMessage = selected
    ? `${waBase} — *${selected.nombre}* (${formatPrice(selected.precio)})`
    : waBase;
  const waUrl = waLink(waMessage);

  function handleAddToCart() {
    if (!selected || !inStock) return;
    add({
      slug,
      nombre,
      marca,
      imagenUrl,
      varianteId: selected.varianteId,
      varianteNombre: selected.nombre,
      precio: selected.precio,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (variants.length === 0) {
    return (
      <div className="mt-8 rounded-2xl bg-cream-dark/60 p-4 text-sm text-ink-soft">
        Sin variantes disponibles por el momento.
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Variant buttons */}
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-soft">
          Presentación
        </p>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => {
            const active = v.varianteId === selectedId;
            const outOfStock = v.stock === 0;
            return (
              <button
                key={v.varianteId}
                onClick={() => { setSelectedId(v.varianteId); setAdded(false); }}
                disabled={outOfStock}
                className={`relative rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "border-ink bg-ink text-white"
                    : outOfStock
                    ? "cursor-not-allowed border-ink/10 text-ink/30 line-through"
                    : "border-ink/15 text-ink hover:border-ink hover:bg-ink/5"
                }`}
              >
                {v.nombre}
                {outOfStock && (
                  <span className="ml-1.5 text-[10px] font-normal normal-case no-underline">
                    agotado
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price display */}
      {selected && (
        <div className="flex items-baseline gap-3">
          <span className="font-display text-4xl text-ink">
            {formatPrice(selected.precio)}
          </span>
          {selected.precioComparacion &&
            selected.precioComparacion > selected.precio && (
              <>
                <span className="text-lg text-ink-soft line-through">
                  {formatPrice(selected.precioComparacion)}
                </span>
                <span className="rounded-full bg-brand-emerald/15 px-2 py-0.5 text-xs font-bold text-brand-emerald">
                  {Math.round(
                    ((selected.precioComparacion - selected.precio) /
                      selected.precioComparacion) *
                      100
                  )}
                  % OFF
                </span>
              </>
            )}
        </div>
      )}

      {/* CTA buttons */}
      <div className="flex flex-col gap-3">
        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 text-sm font-bold transition ${
            added
              ? "bg-brand-emerald text-white"
              : inStock
              ? "bg-ink text-white hover:bg-ink/80 soft-shadow"
              : "cursor-not-allowed bg-ink/10 text-ink/30"
          }`}
        >
          {added ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              ¡Agregado al carrito!
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {inStock ? "Añadir al carrito" : "Sin stock"}
            </>
          )}
        </button>

        <div className="flex gap-3">
          {/* WhatsApp direct */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition ${
              inStock
                ? "bg-[#25D366] text-white hover:bg-[#20ba5a]"
                : "cursor-not-allowed bg-ink/10 text-ink/30"
            }`}
            aria-disabled={!inStock}
            onClick={(e) => !inStock && e.preventDefault()}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.118 1.524 5.853L.057 23.177a.75.75 0 0 0 .923.899l5.487-1.442A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.88 0-3.638-.5-5.157-1.376l-.361-.214-3.742.982.998-3.643-.234-.374A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
            Pedir directo
          </a>

          {/* Consult */}
          <a
            href={waLink(waConsult)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl border border-ink/10 px-5 py-3.5 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white"
          >
            Consultar
          </a>
        </div>
      </div>
    </div>
  );
}
