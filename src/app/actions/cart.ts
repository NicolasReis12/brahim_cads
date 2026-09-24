"use server";

import { stockState } from "@/lib/catalog";
import { repo } from "@/lib/data";

/** Confere estoque e preço atuais dos itens do carrinho salvo no navegador. */
export async function validateCart(productIds: string[]) {
  const ids = productIds.slice(0, 50).filter((id) => typeof id === "string");
  const products = await repo.getProductsByIds(ids);
  return ids.map((id) => {
    const p = products.find((x) => x.id === id && x.published);
    if (!p) return { productId: id, maxQty: 0, priceCents: 0 };
    const s = stockState(p);
    return { productId: id, maxQty: s.kind === "esgotado" ? 0 : s.stock, priceCents: p.priceCents };
  });
}
