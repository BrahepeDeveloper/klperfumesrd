"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

type FilterOption = { nombre: string; slug: string };

type FilterOptions = {
  generos: FilterOption[];
  familias: FilterOption[];
  temporadas: FilterOption[];
  ocasiones: FilterOption[];
  marcas: FilterOption[];
};

type ActiveFilters = {
  genero?: string;
  familia?: string;
  temporada?: string;
  ocasion?: string;
  marca?: string;
  precioMin?: string;
  precioMax?: string;
};

export default function CatalogSidebar({
  filterOptions,
  activeFilters,
  activeCount,
}: {
  filterOptions: FilterOptions;
  activeFilters: ActiveFilters;
  activeCount: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = useCallback(
    (param: string, value: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (next.get(param) === value) {
        next.delete(param);
      } else {
        next.set(param, value);
      }
      next.delete("page");
      const str = next.toString();
      router.push(`/catalogo${str ? "?" + str : ""}`);
    },
    [router, searchParams]
  );

  const clearAll = useCallback(() => {
    router.push("/catalogo");
  }, [router]);

  const sidebarContent = (
    <div className="space-y-7">
      {activeCount > 0 && (
        <button
          onClick={clearAll}
          className="text-xs font-semibold text-brand-cyan underline underline-offset-4"
        >
          Limpiar todos los filtros
        </button>
      )}

      <FilterGroup
        label="Género"
        param="genero"
        options={filterOptions.generos}
        active={activeFilters.genero}
        toggle={toggle}
      />
      <PriceRangeFilter
        activePrecioMin={activeFilters.precioMin}
        activePrecioMax={activeFilters.precioMax}
      />
      <FilterGroup
        label="Marca"
        param="marca"
        options={filterOptions.marcas}
        active={activeFilters.marca}
        toggle={toggle}
        scrollable
      />
      <FilterGroup
        label="Familia Olfativa"
        param="familia"
        options={filterOptions.familias}
        active={activeFilters.familia}
        toggle={toggle}
      />
      <FilterGroup
        label="Temporada"
        param="temporada"
        options={filterOptions.temporadas}
        active={activeFilters.temporada}
        toggle={toggle}
      />
      <FilterGroup
        label="Ocasión"
        param="ocasion"
        options={filterOptions.ocasiones}
        active={activeFilters.ocasion}
        toggle={toggle}
      />
    </div>
  );

  return (
    <>
      {/* Mobile: filter button row */}
      <div className="mb-5 lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm font-semibold text-ink soft-shadow transition hover:bg-ink hover:text-white"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="14" y2="12" />
            <line x1="4" y1="18" x2="9" y2="18" />
          </svg>
          Filtrar
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-cyan text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <h2 className="mb-5 font-display text-xl text-ink">Filtros</h2>
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-full overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-ink/8 px-5 py-4">
              <h2 className="font-display text-lg text-ink">Filtros</h2>
              <button
                onClick={() => setMobileOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition hover:bg-ink/5"
              >
                ✕
              </button>
            </div>
            <div className="p-5">{sidebarContent}</div>
            <div className="sticky bottom-0 border-t border-ink/8 bg-white px-5 py-4">
              <button
                onClick={() => setMobileOpen(false)}
                className="w-full rounded-xl bg-ink py-3 text-sm font-semibold text-white transition hover:bg-ink/80"
              >
                Ver resultados
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PriceRangeFilter({
  activePrecioMin,
  activePrecioMax,
}: {
  activePrecioMin?: string;
  activePrecioMax?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [min, setMin] = useState(activePrecioMin ?? "");
  const [max, setMax] = useState(activePrecioMax ?? "");

  const hasActive = !!(activePrecioMin || activePrecioMax);

  function apply() {
    const next = new URLSearchParams(searchParams.toString());
    if (min) next.set("precioMin", min); else next.delete("precioMin");
    if (max) next.set("precioMax", max); else next.delete("precioMax");
    next.delete("page");
    const str = next.toString();
    router.push(`/catalogo${str ? "?" + str : ""}`);
  }

  function clear() {
    setMin("");
    setMax("");
    const next = new URLSearchParams(searchParams.toString());
    next.delete("precioMin");
    next.delete("precioMax");
    next.delete("page");
    const str = next.toString();
    router.push(`/catalogo${str ? "?" + str : ""}`);
  }

  return (
    <div>
      <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-ink-soft">
        Precio (RD$)
      </h3>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          placeholder="Mín"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && apply()}
          className="w-full rounded-lg border border-ink/10 bg-white px-2.5 py-1.5 text-sm text-ink outline-none focus:border-brand-cyan [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span className="shrink-0 text-xs text-ink-soft">–</span>
        <input
          type="number"
          min={0}
          placeholder="Máx"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && apply()}
          className="w-full rounded-lg border border-ink/10 bg-white px-2.5 py-1.5 text-sm text-ink outline-none focus:border-brand-cyan [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>
      <div className="mt-2 flex gap-2">
        <button
          onClick={apply}
          className="flex-1 rounded-lg bg-ink py-1.5 text-xs font-semibold text-white transition hover:bg-ink/80"
        >
          Aplicar
        </button>
        {hasActive && (
          <button
            onClick={clear}
            className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-ink/5"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  param,
  options,
  active,
  toggle,
  scrollable = false,
}: {
  label: string;
  param: string;
  options: FilterOption[];
  active?: string;
  toggle: (param: string, value: string) => void;
  scrollable?: boolean;
}) {
  return (
    <div>
      <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-ink-soft">
        {label}
      </h3>
      <div className={scrollable ? "max-h-52 overflow-y-auto" : ""}>
        <div className="space-y-0.5">
          {options.map((opt) => {
            const isActive = active === opt.slug;
            return (
              <button
                key={opt.slug}
                onClick={() => toggle(param, opt.slug)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm transition ${
                  isActive
                    ? "bg-ink font-semibold text-white"
                    : "text-ink hover:bg-ink/6"
                }`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                    isActive
                      ? "border-white bg-brand-cyan"
                      : "border-ink/20 bg-white"
                  }`}
                >
                  {isActive && (
                    <svg width="8" height="7" viewBox="0 0 8 7" fill="none">
                      <path
                        d="M1 3.5L3 5.5L7 1"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                {opt.nombre}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
