"use client";

import { Bell, Check, Plus } from "lucide-react";
import { useState } from "react";
import { cart, useCart } from "@/components/cart/cart-store";
import { buttonClass } from "@/components/ui/button";
import { stockState } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { notifyMeUrl } from "@/lib/whatsapp";

export function toCartItem(p: Product) {
  const s = stockState(p);
  return {
    productId: p.id,
    slug: p.slug,
    name: p.name,
    priceCents: p.priceCents,
    unitLabel: p.unitLabel,
    image: p.images[0] ?? null,
    language: p.language,
    preorder: s.kind === "pre-venda",
    maxQty: s.kind === "esgotado" ? 0 : s.stock,
  };
}

export function QuickAdd({ product }: { product: Product }) {
  const items = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const s = stockState(product);
  const inCart = items.find((i) => i.productId === product.id)?.qty ?? 0;

  if (s.kind === "esgotado") {
    return (
      <a
        href={notifyMeUrl(product)}
        target="_blank"
        rel="noopener"
        className={buttonClass("secondary", "sm", "w-full")}
        aria-label={`Avise-me quando chegar: ${product.name}`}
      >
        <Bell /> Avise-me
      </a>
    );
  }

  const full = inCart >= s.stock;
  return (
    <button
      type="button"
      disabled={full}
      onClick={() => {
        if (cart.add(toCartItem(product), 1) > 0) {
          setJustAdded(true);
          setTimeout(() => setJustAdded(false), 1400);
        }
      }}
      className={buttonClass(justAdded ? "secondary" : "primary", "sm", "w-full")}
      aria-label={full ? `Todo estoque no carrinho: ${product.name}` : `${s.kind === "pre-venda" ? "Reservar" : "Adicionar"} ${product.name}`}
    >
      {justAdded ? (
        <>
          <Check /> No carrinho
        </>
      ) : full ? (
        "Todo estoque no carrinho"
      ) : (
        <>
          <Plus /> {s.kind === "pre-venda" ? "Reservar" : "Adicionar"}
        </>
      )}
    </button>
  );
}
