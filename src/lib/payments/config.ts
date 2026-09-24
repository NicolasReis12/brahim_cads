import "server-only";

/**
 * Checkout online (Mercado Pago Checkout Pro) só aparece quando:
 *   ONLINE_CHECKOUT_ENABLED=true  e  MERCADOPAGO_ACCESS_TOKEN definido.
 * Sem isso, o carrinho finaliza apenas pelo WhatsApp.
 */
export function onlineCheckoutEnabled(): boolean {
  return process.env.ONLINE_CHECKOUT_ENABLED === "true" && Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}
