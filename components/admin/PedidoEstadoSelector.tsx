"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ESTADOS = ["Pendiente", "Confirmado", "Enviado", "Entregado", "Cancelado"] as const;

const COLORS: Record<string, string> = {
  Pendiente:  "text-yellow-400",
  Confirmado: "text-blue-400",
  Enviado:    "text-purple-400",
  Entregado:  "text-emerald-400",
  Cancelado:  "text-red-400",
};

export default function PedidoEstadoSelector({
  pedidoId,
  estadoActual,
}: {
  pedidoId: number;
  estadoActual: string;
}) {
  const router = useRouter();
  const [estado, setEstado] = useState(estadoActual);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(nuevoEstado: string) {
    if (nuevoEstado === estado) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/pedidos/${pedidoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (res.ok) {
        setEstado(nuevoEstado);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Error al actualizar");
      }
    } catch {
      setError("Error de red");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <select
          value={estado}
          onChange={(e) => handleChange(e.target.value)}
          disabled={saving}
          className={`rounded-xl border border-white/10 bg-[#0f1117] px-3 py-2 text-sm font-semibold outline-none focus:border-brand-cyan disabled:opacity-50 ${COLORS[estado] ?? "text-white/70"}`}
        >
          {ESTADOS.map((e) => (
            <option key={e} value={e} className="text-white bg-[#0f1117]">
              {e}
            </option>
          ))}
        </select>
        {saving && <span className="text-xs text-white/40">Guardando...</span>}
      </div>
      {error && <p className="text-[10px] text-red-400">{error}</p>}
    </div>
  );
}
