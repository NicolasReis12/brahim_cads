import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import MercadoPagoConfig, { Payment, Preference } from "mercadopago";
import { SITE_URL } from "@/config/store";
import type { Order } from "../types";

function client() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");
  return new MercadoPagoConfig({ accessToken, options: { timeout: 10_000 } });
}

/** Cria a preferência do Checkout Pro e devolve a URL de pagamento. */
export async function createCheckoutPreference(order: Order): Promise<string> {
  const items = order.items.map((i) => ({
    id: i.productId,
    title: i.name.slice(0, 250),
    quantity: i.quantity,
    unit_price: i.unitPriceCents / 100,
    currency_id: "BRL",
  }));
  if (order.shippingCents > 0) {
    items.push({ id: "frete", title: "Frete (Correios)", quantity: 1, unit_price: order.shippingCents / 100, currency_id: "BRL" });
  }

  const pref = await new Preference(client()).create({
    body: {
      items,
      external_reference: order.id,
      payer: { name: order.customerName, email: order.customerEmail ?? undefined },
      back_urls: {
        success: `${SITE_URL}/pedido/${order.id}`,
        pending: `${SITE_URL}/pedido/${order.id}`,
        failure: `${SITE_URL}/pedido/${order.id}?falhou=1`,
      },
      auto_return: "approved",
      notification_url: `${SITE_URL}/api/webhooks/mercadopago`,
      statement_descriptor: "BRAHIMCARDS",
      // Pix e cartão; boleto fica de fora pra não segurar estoque por dias
      payment_methods: { excluded_payment_types: [{ id: "ticket" }], installments: 12 },
      expires: true,
      expiration_date_to: new Date(Date.now() + 24 * 3600_000).toISOString(),
    },
  });

  const url = process.env.MERCADOPAGO_USE_SANDBOX === "true" ? pref.sandbox_init_point : pref.init_point;
  if (!url) throw new Error("Mercado Pago não retornou a URL de pagamento");
  return url;
}

export async function fetchPayment(id: string) {
  const p = await new Payment(client()).get({ id });
  return { status: p.status, orderId: p.external_reference ?? null, id: String(p.id) };
}

/**
 * Valida o cabeçalho x-signature do webhook.
 * Manifesto: `id:<data.id>;request-id:<x-request-id>;ts:<ts>;` assinado com HMAC-SHA256.
 * Sem MERCADOPAGO_WEBHOOK_SECRET a validação é pulada (só aceitável em desenvolvimento) —
 * de qualquer forma o pagamento é sempre reconsultado na API antes de confirmar.
 */
export function verifyWebhookSignature(headers: Headers, dataId: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";

  const signature = headers.get("x-signature") ?? "";
  const requestId = headers.get("x-request-id") ?? "";
  const parts = Object.fromEntries(
    signature.split(",").map((kv) => {
      const [k, ...v] = kv.trim().split("=");
      return [k, v.join("=")];
    }),
  );
  if (!parts.ts || !parts.v1) return false;

  const id = /^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId;
  let manifest = `id:${id};`;
  if (requestId) manifest += `request-id:${requestId};`;
  manifest += `ts:${parts.ts};`;

  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(parts.v1);
  return a.length === b.length && timingSafeEqual(a, b);
}
