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
      className="group flex flex-col overflow-hidden rounded-xl glass-effect transition-all duration-300 hover:scale-105 hover:glow-blue"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-bg-secondary border-b border-border">
        {product.imagenUrl ? (
          <Image
            src={product.imagenUrl}
            alt={product.nombre}
            fill
            loading="lazy"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs text-text-secondary/30">
            Imagen no disponible
          </div>
        )}

        {/* Gender Badge */}
        <span className="absolute left-3 top-3 rounded-lg bg-bg-secondary/80 backdrop-blur-sm px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-accent-blue border border-border">
          {product.genero}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 gap-2">
        {/* Brand */}
        <span className="text-[10px] font-medium uppercase tracking-widest text-accent-teal">
          {product.marca}
        </span>

        {/* Product Name */}
        <h3 className="font-display text-sm leading-snug text-text-primary line-clamp-2">
          {product.nombre}
        </h3>

        {/* Olfactive Family */}
        {product.familiaOlfativa && (
          <span className="text-xs text-text-secondary/70">{product.familiaOlfativa}</span>
        )}

        {/* Price */}
        <div className="mt-auto flex items-baseline gap-1.5 pt-3 border-t border-border">
          <span className="text-xs text-text-secondary">Desde</span>
          <span className="font-semibold bg-gradient-to-r from-accent-blue to-accent-teal bg-clip-text text-transparent">
            {formatPrice(product.precioDesde)}
          </span>
        </div>
      </div>

      {/* Hover Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-accent-blue/0 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none rounded-xl" />
    </Link>
  );
}
