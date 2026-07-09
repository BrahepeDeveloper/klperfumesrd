"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al iniciar sesión");
      } else {
        router.push(from);
        router.refresh();
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cream/60">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder-cream/30 outline-none transition focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20"
          placeholder="admin@klperfumesrd.com"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cream/60">
          Contraseña
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder-cream/30 outline-none transition focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl brand-gradient-bg py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Entrando..." : "Entrar al panel"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <p className="font-display text-2xl text-cream">
            KL <span className="brand-gradient-text font-semibold">Perfumes</span> RD
          </p>
          <p className="mt-1 text-xs text-cream/40 uppercase tracking-widest">
            Panel Administrativo
          </p>
        </div>

        <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-white/5" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
