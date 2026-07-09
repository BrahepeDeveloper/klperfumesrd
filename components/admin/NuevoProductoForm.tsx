"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Marca = { marcaId: number; nombre: string };
type Genero = { generoId: number; nombre: string };
type Concentracion = { concentracionId: number; nombre: string; abreviatura: string };
type TipoVariante = { tipoVarianteId: number; nombre: string; mlEquivalente: number | null };

type Props = {
  marcas: Marca[];
  generos: Genero[];
  concentraciones: Concentracion[];
  tiposVariante: TipoVariante[];
};

type VarianteRow = {
  tipoVarianteId: number;
  precio: string;
  precioComparacion: string;
  stock: string;
};

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function NuevoProductoForm({
  marcas,
  generos,
  concentraciones,
  tiposVariante,
}: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [nombre, setNombre] = useState("");
  const [marcaId, setMarcaId] = useState<number>(marcas[0]?.marcaId ?? 0);
  const [generoId, setGeneroId] = useState<number>(generos[0]?.generoId ?? 0);
  const [concentracionId, setConcentracionId] = useState<number | null>(null);
  const [descripcionCorta, setDescripcionCorta] = useState("");

  const [variantes, setVariantes] = useState<VarianteRow[]>([
    {
      tipoVarianteId: tiposVariante[0]?.tipoVarianteId ?? 0,
      precio: "",
      precioComparacion: "",
      stock: "0",
    },
  ]);

  function addVariante() {
    setVariantes((prev) => [
      ...prev,
      {
        tipoVarianteId: tiposVariante[0]?.tipoVarianteId ?? 0,
        precio: "",
        precioComparacion: "",
        stock: "0",
      },
    ]);
  }

  function updateVariante(idx: number, field: keyof VarianteRow, value: string | number) {
    setVariantes((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v))
    );
  }

  function removeVariante(idx: number) {
    setVariantes((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) { setError("El nombre es obligatorio"); return; }
    if (variantes.length === 0) { setError("Agrega al menos una variante"); return; }
    if (variantes.some((v) => !v.precio || parseFloat(v.precio) <= 0)) {
      setError("Todas las variantes deben tener un precio válido");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          marcaId,
          generoId,
          concentracionId,
          descripcionCorta: descripcionCorta.trim() || null,
          variantes: variantes.map((v) => ({
            tipoVarianteId: v.tipoVarianteId,
            precio: parseFloat(v.precio),
            precioComparacion: v.precioComparacion ? parseFloat(v.precioComparacion) : null,
            stock: parseInt(v.stock, 10) || 0,
          })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/admin/productos/${data.productoId}`);
      } else {
        setError(data.error ?? "Error al crear producto");
      }
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  const selectClass =
    "w-full rounded-xl border border-white/10 bg-[#0f1117] px-3 py-2.5 text-sm text-white outline-none focus:border-brand-cyan";
  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-brand-cyan";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic info */}
      <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-white/30">
          Información General
        </h2>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-white/50">
            Nombre del producto *
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            placeholder="Ej: Khamrah"
            className={inputClass}
          />
          {nombre && (
            <p className="mt-1 font-mono text-[10px] text-white/25">/{slugify(nombre)}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white/50">Marca *</label>
            <select
              value={marcaId}
              onChange={(e) => setMarcaId(Number(e.target.value))}
              className={selectClass}
            >
              {marcas.map((m) => (
                <option key={m.marcaId} value={m.marcaId}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white/50">Género *</label>
            <select
              value={generoId}
              onChange={(e) => setGeneroId(Number(e.target.value))}
              className={selectClass}
            >
              {generos.map((g) => (
                <option key={g.generoId} value={g.generoId}>
                  {g.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-white/50">
            Concentración
          </label>
          <select
            value={concentracionId ?? ""}
            onChange={(e) =>
              setConcentracionId(e.target.value ? Number(e.target.value) : null)
            }
            className={selectClass}
          >
            <option value="">Sin especificar</option>
            {concentraciones.map((c) => (
              <option key={c.concentracionId} value={c.concentracionId}>
                {c.nombre} ({c.abreviatura})
              </option>
            ))}
          </select>
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
            placeholder="Descripción breve del perfume..."
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-brand-cyan"
          />
          <p className="mt-1 text-right text-[10px] text-white/20">
            {descripcionCorta.length}/500
          </p>
        </div>
      </section>

      {/* Variants */}
      <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-white/30">
            Variantes y Precios
          </h2>
          <button
            type="button"
            onClick={addVariante}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/50 transition hover:border-white/20 hover:text-white"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Variante
          </button>
        </div>

        {variantes.length === 0 && (
          <p className="text-sm text-white/30">
            Agrega al menos una variante de precio.
          </p>
        )}

        <div className="space-y-3">
          {variantes.map((v, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <select
                  value={v.tipoVarianteId}
                  onChange={(e) =>
                    updateVariante(idx, "tipoVarianteId", Number(e.target.value))
                  }
                  className="rounded-lg border border-white/10 bg-[#0f1117] px-3 py-1.5 text-sm text-white outline-none focus:border-brand-cyan"
                >
                  {tiposVariante.map((t) => (
                    <option key={t.tipoVarianteId} value={t.tipoVarianteId}>
                      {t.nombre}
                      {t.mlEquivalente ? ` (${t.mlEquivalente}ml)` : ""}
                    </option>
                  ))}
                </select>

                {variantes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariante(idx)}
                    className="text-xs text-red-400/60 transition hover:text-red-400"
                  >
                    Eliminar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-white/30">
                    Precio (RD$) *
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={v.precio}
                    onChange={(e) => updateVariante(idx, "precio", e.target.value)}
                    required
                    placeholder="0.00"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-brand-cyan"
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
                    value={v.precioComparacion}
                    onChange={(e) =>
                      updateVariante(idx, "precioComparacion", e.target.value)
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
                    onChange={(e) => updateVariante(idx, "stock", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Submit */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl brand-gradient-bg px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Creando..." : "Crear producto"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/productos")}
          className="rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-white/40 transition hover:text-white"
        >
          Cancelar
        </button>
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    </form>
  );
}
