"use client";

import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";

type ProductRow = {
  productoId: number;
  nombre: string;
  slug: string;
  activo: boolean;
  marca: { nombre: string };
  genero: { nombre: string };
  imagenes: { urlWebp: string }[];
  variantes: { precio: import("@prisma/client").Prisma.Decimal }[];
  familiasOlfativas: { familia: { nombre: string } }[];
};

export default function AdminProductRow({ product }: { product: ProductRow }) {
  const precio = product.variantes[0]
    ? Number(product.variantes[0].precio)
    : null;
  const familia = product.familiasOlfativas[0]?.familia.nombre;
  const imgUrl = product.imagenes[0]?.urlWebp;

  return (
    <tr className="group transition hover:bg-white/3">
      {/* Name + image */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white/5">
            {imgUrl ? (
              <Image
                src={imgUrl}
                alt={product.nombre}
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-[8px] text-white/20">
                SIN
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-white">{product.nombre}</p>
            <p className="text-[11px] text-white/40">{product.genero.nombre}</p>
          </div>
        </div>
      </td>

      {/* Brand */}
      <td className="hidden px-4 py-3 text-xs text-white/60 md:table-cell">
        {product.marca.nombre}
      </td>

      {/* Family */}
      <td className="hidden px-4 py-3 lg:table-cell">
        {familia ? (
          <span className="rounded-full bg-brand-emerald/10 px-2 py-0.5 text-xs text-brand-emerald">
            {familia}
          </span>
        ) : (
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400">
            Sin asignar
          </span>
        )}
      </td>

      {/* Price */}
      <td className="px-4 py-3 text-xs text-white/70">
        {precio ? formatPrice(precio) : "—"}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
            product.activo
              ? "bg-green-500/10 text-green-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {product.activo ? "Activo" : "Inactivo"}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2 opacity-0 transition group-hover:opacity-100">
          <Link
            href={`/admin/productos/${product.productoId}`}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/60 transition hover:border-white/20 hover:text-white"
          >
            Editar
          </Link>
          <Link
            href={`/productos/${product.slug}`}
            target="_blank"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/40 transition hover:text-white"
          >
            Ver
          </Link>
        </div>
      </td>
    </tr>
  );
}
