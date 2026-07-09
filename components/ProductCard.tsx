import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

export type ProductCardData = {
  slug: string;
  nombre: string;
  marca: string;
  genero: string;
  imagenUrl: string | null;
  precioDesde: number;
  familiaOlfativa: string | null;
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white soft-shadow transition-transform duration-300 hover:-translate-y-1 hover:soft-shadow-lg"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-cream-dark">
        {product.imagenUrl ? (
          <Image
            src={product.imagenUrl}
            alt={product.nombre}
            fill
            loading="lazy"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs text-ink-soft/50">
            Imagen no disponible
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
          {product.genero}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
          {product.marca}
        </span>
        <h3 className="mt-1 line-clamp-2 font-display text-base leading-snug text-ink">
          {product.nombre}
        </h3>
        {product.familiaOlfativa && (
          <span className="mt-1 text-xs text-ink-soft">{product.familiaOlfativa}</span>
        )}
        <div className="mt-auto flex items-baseline gap-1 pt-3">
          <span className="text-xs text-ink-soft">Desde</span>
          <span className="text-sm font-semibold text-ink">{formatPrice(product.precioDesde)}</span>
        </div>
      </div>
    </Link>
  );
}
