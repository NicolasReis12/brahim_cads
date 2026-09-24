"use server";

import { z } from "zod";
import { getShippingProvider } from "@/config/shipping";
import { stockState } from "@/lib/catalog";
import { repo } from "@/lib/data";
import { isValidCep } from "@/lib/format";
import { onlineCheckoutEnabled } from "@/lib/payments/config";
import { createCheckoutPreference } from "@/lib/payments/mercadopago";

export async function quoteShipping(cep: string, subtotalCents: number) {
  if (!isValidCep(cep)) return null;
  return getShippingProvider().quote(cep, subtotalCents);
}

const schema = z
  .object({
    name: z.string().trim().min(2, "Coloca seu nome completo").max(120),
    email: z.email("E-mail inválido").max(160),
    phone: z.string().trim().regex(/^\D*(\d\D*){10,11}$/, "Telefone com DDD"),
    delivery: z.enum(["envio", "retirada"]),
    cep: z.string().optional(),
    address: z.string().trim().max(300).optional(),
    items: z.array(z.object({ productId: z.string().min(1), qty: z.number().int().min(1).max(999) })).min(1).max(50),
  })
  .superRefine((v, ctx) => {
    if (v.delivery === "envio") {
      if (!v.cep || !isValidCep(v.cep)) ctx.addIssue({ code: "custom", path: ["cep"], message: "CEP precisa ter 8 números" });
      if (!v.address || v.address.length < 8)
        ctx.addIssue({ code: "custom", path: ["address"], message: "Endereço com rua, número e bairro" });
    }
  });

export type CheckoutInput = z.infer<typeof schema>;
export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string>; stock?: { productId: string; maxQty: number }[] };

export async function startCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  if (!onlineCheckoutEnabled()) return { ok: false, error: "Pagamento online indisponível no momento. Finalize pelo WhatsApp." };

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { ok: false, error: "Confere os campos destacados.", fieldErrors };
  }
  const data = parsed.data;

  // Preço e estoque sempre do servidor — o carrinho do navegador é só uma sugestão.
  const products = await repo.getProductsByIds(data.items.map((i) => i.productId));
  const problems: { productId: string; maxQty: number }[] = [];
  const items = data.items.map((line) => {
    const p = products.find((x) => x.id === line.productId && x.published);
    const s = p ? stockState(p) : null;
    const max = !s || s.kind === "esgotado" ? 0 : s.stock;
    if (line.qty > max) problems.push({ productId: line.productId, maxQty: max });
    return { productId: line.productId, name: p?.name ?? "", unitPriceCents: p?.priceCents ?? 0, quantity: line.qty };
  });
  if (problems.length) {
    return { ok: false, error: "O estoque de alguns itens mudou. Ajustamos o carrinho — confere e tenta de novo.", stock: problems };
  }

  const subtotal = items.reduce((s, i) => s + i.unitPriceCents * i.quantity, 0);
  const shipping = data.delivery === "envio" ? (await getShippingProvider().quote(data.cep!, subtotal)).cents : 0;

  const order = await repo.createOrder({
    status: "pendente",
    channel: "online",
    customerName: data.name,
    customerEmail: data.email,
    customerPhone: data.phone.replace(/\D/g, ""),
    cep: data.delivery === "envio" ? data.cep!.replace(/\D/g, "") : null,
    address: data.delivery === "envio" ? data.address! : null,
    deliveryMethod: data.delivery,
    shippingCents: shipping,
    subtotalCents: subtotal,
    totalCents: subtotal + shipping,
    items,
    notes: null,
  });

  try {
    const url = await createCheckoutPreference(order);
    return { ok: true, url };
  } catch (err) {
    console.error("[checkout] preferência", err);
    await repo.updateOrderStatus(order.id, "cancelado");
    return { ok: false, error: "Não conseguimos abrir o pagamento agora. Tenta de novo ou finaliza pelo WhatsApp." };
  }
}
