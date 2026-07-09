"use client";

import { useState } from "react";

type Marca = {
  marcaId: number;
  nombre: string;
  slug: string;
  activo: boolean;
  _count: { productos: number };
};

export default function AdminMarcaRow({ marca }: { marca: Marca }) {
  const [editing, setEditing] = useState(false);
  const [nombre, setNombre] = useState(marca.nombre);
  const [activo, setActivo] = useState(marca.activo);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!nombre.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/marcas/${marca.marcaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombre.trim(), activo }),
      });
      if (res.ok) {
        setSaved(true);
        setEditing(false);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const data = await res.json();
        setError(data.error ?? "Error al guardar");
      }
    } catch {
      setError("Error de red");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setEditing(false);
    setNombre(marca.nombre);
    setActivo(marca.activo);
    setError("");
  }

  return (
    <tr className="group border-b border-white/5 last:border-0 transition hover:bg-white/[0.02]">
      {/* Name */}
      <td className="px-4 py-3">
        {editing ? (
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            className="w-full max-w-xs rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-brand-cyan"
            autoFocus
          />
        ) : (
          <span
            className={`text-sm font-medium transition ${
              saved ? "text-emerald-400" : "text-white/90"
            }`}
          >
            {nombre}
          </span>
        )}
        {error && <p className="mt-1 text-[10px] text-red-400">{error}</p>}
      </td>

      {/* Product count */}
      <td className="px-4 py-3 text-sm tabular-nums text-white/40">
        {marca._count.productos}
      </td>

      {/* Active status */}
      <td className="px-4 py-3">
        {editing ? (
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              className="h-3.5 w-3.5 rounded accent-brand-cyan"
            />
            <span className="text-xs text-white/50">Activa</span>
          </label>
        ) : (
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              activo
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {activo ? "Activa" : "Inactiva"}
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-right">
        <div
          className={`flex items-center justify-end gap-2 transition ${
            editing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving || !nombre.trim()}
                className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-50"
              >
                {saving ? "..." : "Guardar"}
              </button>
              <button
                onClick={handleCancel}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/40 transition hover:text-white"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/50 transition hover:border-white/20 hover:text-white"
            >
              Editar
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
