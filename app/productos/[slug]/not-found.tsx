import Link from "next/link";

export default function ProductoNotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-6 py-32 text-center">
      <p className="text-5xl">🕵️</p>
      <h1 className="font-display mt-6 text-3xl text-ink">
        Fragancia no encontrada
      </h1>
      <p className="mt-3 text-sm text-ink-soft">
        Este producto no existe o fue removido del catálogo.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/catalogo"
          className="rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-ink/80"
        >
          Ver catálogo
        </Link>
        <Link
          href="/"
          className="rounded-xl border border-ink/10 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-ink/5"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
