"use client";

import { useSyncExternalStore } from "react";
import type { Language } from "@/lib/types";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  unitLabel: string | null;
  image: string | null;
  language: Language | null;
  preorder: boolean;
  /** Estoque no momento em que foi adicionado — limite do seletor de quantidade */
  maxQty: number;
  qty: number;
};

const KEY = "bc:cart:v1";
const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function read(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as CartItem[]) : [];
    return Array.isArray(parsed) ? parsed.filter((i) => i && i.productId && i.qty > 0) : [];
  } catch {
    return [];
  }
}

function emit(next: CartItem[]) {
  items = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  if (!hydrated) {
    items = read();
    hydrated = true;
  }
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      items = read();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export const cart = {
  /** Retorna quantas unidades de fato entraram (respeitando o estoque). */
  add(item: Omit<CartItem, "qty">, qty = 1): number {
    const current = items.find((i) => i.productId === item.productId);
    const have = current?.qty ?? 0;
    const target = Math.min(item.maxQty, have + qty);
    if (target <= have) return 0;
    const next = current
      ? items.map((i) => (i.productId === item.productId ? { ...i, ...item, qty: target } : i))
      : [...items, { ...item, qty: target }];
    emit(next);
    return target - have;
  },
  setQty(productId: string, qty: number) {
    emit(
      items
        .map((i) => (i.productId === productId ? { ...i, qty: Math.max(0, Math.min(i.maxQty, qty)) } : i))
        .filter((i) => i.qty > 0),
    );
  },
  /** Atualiza limites depois de validar o carrinho no servidor. */
  sync(updates: { productId: string; maxQty: number; priceCents: number }[]) {
    emit(
      items
        .map((i) => {
          const u = updates.find((x) => x.productId === i.productId);
          if (!u) return i;
          return { ...i, maxQty: u.maxQty, priceCents: u.priceCents, qty: Math.min(i.qty, u.maxQty) };
        })
        .filter((i) => i.qty > 0),
    );
  },
  remove(productId: string) {
    emit(items.filter((i) => i.productId !== productId));
  },
  clear() {
    emit(EMPTY);
  },
  quantityOf(productId: string) {
    return items.find((i) => i.productId === productId)?.qty ?? 0;
  },
};

export function useCart() {
  return useSyncExternalStore(
    subscribe,
    () => items,
    () => EMPTY,
  );
}

export function cartTotals(list: CartItem[]) {
  return {
    count: list.reduce((s, i) => s + i.qty, 0),
    subtotalCents: list.reduce((s, i) => s + i.qty * i.priceCents, 0),
  };
}

// Estado do drawer ---------------------------------------------------------------

let open = false;
const openListeners = new Set<() => void>();

export const cartDrawer = {
  open() {
    open = true;
    openListeners.forEach((l) => l());
  },
  set(v: boolean) {
    open = v;
    openListeners.forEach((l) => l());
  },
};

export function useCartDrawerOpen() {
  return useSyncExternalStore(
    (l) => {
      openListeners.add(l);
      return () => openListeners.delete(l);
    },
    () => open,
    () => false,
  );
}
