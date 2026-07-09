"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";

type Variante = {
  varianteId: number;
  nombre: string;
  precio: number;
  precioComparacion: number | null;
  stock: number;
  activo: boolean;
};

type ProductData = {
  productoId: number;
  nombre: string;
  slug: string;
  descripcionCorta: string;
  descripcionLarga: string;
  activo: boolean;
  destacado: boolean;
  generoId: number;
  concentracionId: number | null;
  contenidoMlOriginal: number | null;
  familias: { familiaId: number; nombre: string }[];
  variantes: Variante[];
  imagenes: { imagenId: number; urlWebp: string; esPrincipal: boolean }[];
};

type Options = {
  familias: { familiaId: number; nombre: string; slug: string }[];
  generos: { generoId: number; nombre: string }[];
  concentraciones: { concentracionId: number; nombre: string; abreviatura: string }[];
};

export default function AdminProductForm({
  product,
  options,
}: {
  product: ProductData;
  options: Options;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [descripcionCorta, setDescripcionCorta] = useState(product.descripcionCorta);
  const [activo, setActivo] = useState(product.activo);
  const [destacado, setDestacado] = useState(product.destacado);
  const [generoId, setGeneroId] = useState(product.generoId);
  const [concentracionId, setConcentracionId] = useState(product.concentracionId);
  const [selectedFamilias, setSelectedFamilias] = useState<number[]>(
    product.familias.map((f) => f.familiaId)
  );
  const [variantes, setVariantes] = useState<Variante[]>(product.variantes);

  function toggleFamilia(fid: number) {
    setSelectedFamilias((prev) =>
      prev.includes(fid) ? prev.filter((id) => id !== fid) : [...prev, fid]
    );
  }

  function updateVariante(vid: number, field: keyof Variante, value: number | boolean | null) {
    setVariantes((prev) =>
      prev.map((v) => (v.varianteId === vid ? { ...v, [field]: value } : v))
    );
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch(`/api/admin/productos/${product.productoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descripcionCorta,
          activo,
          destacado,
          generoId,
          concentracionId,
          familiaIds: selectedFamilias,
          variantes: variantes.map((v) => ({
            varianteId: v.varianteId,
            precio: v.precio,
            precioComparacion: v.precioComparacion,
            stock: v.stock,
            activo: v.activo,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Error al guardar");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        router.refresh();
      }
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Status row */}
      <section className="flex flex-wrap gap-6 rounded-2xl border border-white/5 bg-white/3 p-5">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
            className="h-4 w-4 rounded accent-brand-cyan"
          />
          <span className="text-sm font-semibold text-white">Activo</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={destacado}
            onChange={(e) => setDestacado(e.target.checked)}
            className="h-4 w-4 rounded accent-brand-cyan"
          />
          <span className="text-sm font-semibold text-white">Destacado (homepage)</span>
        </label>
      </section>

      {/* Basic info */}
      <section className="rounded-2xl border border-white/5 bg-white/3 p-5 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white/40">
          Información General
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white/50">Género</label>
            <select
              value={generoId}
              onChange={(e) => setGeneroId(Number(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-cyan"
            >
              {options.generos.map((g) => (
                <option key={g.generoId} value={g.generoId} className="bg-[#1a1d25]">
                  {g.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white/50">Concentración</label>
            <select
              value={concentracionId ?? ""}
              onChange={(e) =>
                setConcentracionId(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-cyan"
            >
              <option value="" className="bg-[#1a1d25]">Sin especificar</option>
              {options.concentraciones.map((c) => (
                <option key={c.concentracionId} value={c.concentracionId} className="bg-[#1a1d25]">
                  {c.nombre} ({c.abreviatura})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-white/50">
            Descripción corta
          </label>
          <textarea
            value={descripcionCorta}
            onChange={(e) => setDescripcionCorta(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-brand-cyan resize-none"
            placeholder="Descripción breve del perfume..."
          />
          <p className="mt-1 text-right text-[10px] text-white/30">
            {descripcionCorta.length}/500
          </p>
        </div>
      </section>

      {/* Familias olfativas */}
      <section className="rounded-2xl border border-white/5 bg-white/3 p-5 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white/40">
          Familias Olfativas
        </h2>
        <div className="flex flex-wrap gap-2">
          {options.familias.map((f) => {
            const selected = selectedFamilias.includes(f.familiaId);
            return (
              <button
                key={f.familiaId}
                onClick={() => toggleFamilia(f.familiaId)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  selected
                    ? "border-brand-emerald bg-brand-emerald/10 text-brand-emerald"
                    : "border-white/10 text-white/50 hover:border-white/20 hover:text-white"
                }`}
              >
                {f.nombre}
              </button>
            );
          })}
        </div>
      </section>

      {/* Variantes y precios */}
      <section className="rounded-2xl border border-white/5 bg-white/3 p-5 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white/40">
          Variantes y Precios
        </h2>

        <div className="space-y-3">
          {variantes.map((v) => (
            <div
              key={v.varianteId}
              className="rounded-xl border border-white/5 bg-white/3 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{v.nombre}</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={v.activo}
                    onChange={(e) => updateVariante(v.varianteId, "activo", e.target.checked)}
                    className="h-3.5 w-3.5 rounded accent-brand-cyan"
                  />
                  <span className="text-xs text-white/50">Activo</span>
                </label>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-white/30">
                    Precio (RD$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={v.precio}
                    onChange={(e) =>
                      updateVariante(v.varianteId, "precio", Number(e.target.value))
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-white/30">
                    Precio tachado
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={v.precioComparacion ?? ""}
                    onChange={(e) =>
                      updateVariante(
                        v.varianteId,
                        "precioComparacion",
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    placeholder="Opcional"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 placeholder-white/20 outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-white/30">
                    Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={v.stock}
                    onChange={(e) =>
                      updateVariante(v.varianteId, "stock", Number(e.target.value))
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Images preview */}
      {product.imagenes.length > 0 && (
        <section className="rounded-2xl border border-white/5 bg-white/3 p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/40">
            Imágenes ({product.imagenes.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {product.imagenes.map((img) => (
              <div
                key={img.imagenId}
                className={`relative h-16 w-16 overflow-hidden rounded-xl ${
                  img.esPrincipal ? "ring-2 ring-brand-cyan" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.urlWebp}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
          <p className="text-[10px] text-white/30">
            Gestión de imágenes disponible en la próxima versión.
          </p>
        </section>
      )}

      {/* Save button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`rounded-xl px-6 py-3 text-sm font-bold text-white transition disabled:opacity-50 ${
            saved
              ? "bg-brand-emerald"
              : "brand-gradient-bg hover:opacity-90"
          }`}
        >
          {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar cambios"}
        </button>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </div>
  );
}
