"use client";

import { Bell, MessageCircle, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { cart, cartDrawer, useCart } from "@/components/cart/cart-store";
import { QuantityStepper } from "@/components/cart/quantity";
import { Button, ButtonA } from "@/components/ui/button";
import { stockState } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { notifyMeUrl, productQuestionUrl } from "@/lib/whatsapp";
import { toCartItem } from "./quick-add";

export function ProductPurchase({ product }: { product: Product }) {
  const s = stockState(product);
  const items = useCart();
  const inCart = items.find((i) => i.productId === product.id)?.qty ?? 0;
  const available = s.kind === "esgotado" ? 0 : Math.max(0, s.stock - inCart);
  const [qty, setQty] = useState(1);
  const safeQty = Math.min(qty, Math.max(1, available));

  if (s.kind === "esgotado") {
    return (
      <div className="flex flex-col gap-2">
        <ButtonA href={notifyMeUrl(product)} target="_blank" rel="noopener" size="lg">
          <Bell /> Avise-me quando chegar
        </ButtonA>
        <p className="text-xs text-ink-subtle">Abre o WhatsApp com a mensagem pronta. A gente chama quando repor.</p>
        <ButtonA href={productQuestionUrl(product)} target="_blank" rel="noopener" variant="whatsapp" size="lg">
          <MessageCircle /> Tirar dúvida no WhatsApp
        </ButtonA>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <QuantityStepper size="lg" label="Quantidade" value={safeQty} max={Math.max(1, available)} onChange={setQty} />
        <Button
          size="lg"
          className="flex-1"
          disabled={available === 0}
          onClick={() => {
            if (cart.add(toCartItem(product), safeQty) > 0) {
              setQty(1);
              cartDrawer.open();
            }
          }}
        >
          <ShoppingBag />
          {available === 0 ? "Todo o estoque já está no carrinho" : s.kind === "pre-venda" ? "Reservar na pré-venda" : "Adicionar ao carrinho"}
        </Button>
      </div>
      {inCart > 0 && (
        <p className="meta normal-case">
          {inCart} no carrinho ·{" "}
          <button type="button" onClick={cartDrawer.open} className="underline underline-offset-2 hover:text-ink">
            ver carrinho
          </button>
        </p>
      )}
      <ButtonA href={productQuestionUrl(product)} target="_blank" rel="noopener" variant="whatsapp" size="lg">
        <MessageCircle /> Tirar dúvida no WhatsApp
      </ButtonA>
    </div>
  );
}
