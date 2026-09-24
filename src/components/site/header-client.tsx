"use client";

import { ShoppingBag } from "lucide-react";
import { cartDrawer, cartTotals, useCart } from "@/components/cart/cart-store";

export function CartButton() {
  const { count } = cartTotals(useCart());
  return (
    <button
      type="button"
      onClick={cartDrawer.open}
      className="relative grid size-10 place-items-center rounded-sm text-ink-muted hover:bg-raised hover:text-ink"
      aria-label={count ? `Abrir carrinho, ${count} ${count === 1 ? "item" : "itens"}` : "Abrir carrinho"}
    >
      <ShoppingBag size={20} strokeWidth={1.75} />
      {count > 0 && (
        <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-xs bg-gold px-1 font-mono text-[0.625rem] font-medium leading-none text-on-gold">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
