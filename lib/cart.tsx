"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type CartItem = {
  slug: string;
  nombre: string;
  marca: string;
  imagenUrl: string | null;
  varianteId: number;
  varianteNombre: string;
  precio: number;
  cantidad: number;
};

type CartState = {
  items: CartItem[];
  open: boolean;
  total: number;
  count: number;
};

type CartActions = {
  add: (item: Omit<CartItem, "cantidad">) => void;
  remove: (varianteId: number) => void;
  updateQty: (varianteId: number, qty: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<(CartState & CartActions) | null>(null);

const STORAGE_KEY = "klp-cart";

function loadFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveToStorage(items);
  }, [items, hydrated]);

  const add = useCallback((newItem: Omit<CartItem, "cantidad">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.varianteId === newItem.varianteId);
      if (existing) {
        return prev.map((i) =>
          i.varianteId === newItem.varianteId
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      return [...prev, { ...newItem, cantidad: 1 }];
    });
    setOpen(true);
  }, []);

  const remove = useCallback((varianteId: number) => {
    setItems((prev) => prev.filter((i) => i.varianteId !== varianteId));
  }, []);

  const updateQty = useCallback((varianteId: number, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.varianteId !== varianteId));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.varianteId === varianteId ? { ...i, cantidad: qty } : i))
      );
    }
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);

  const total = items.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
  const count = items.reduce((sum, i) => sum + i.cantidad, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        open,
        total,
        count,
        add,
        remove,
        updateQty,
        clear,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}
