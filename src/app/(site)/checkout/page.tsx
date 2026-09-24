import type { Metadata } from "next";
import { CheckoutForm } from "@/components/cart/checkout-form";
import { ButtonLink } from "@/components/ui/button";
import { onlineCheckoutEnabled } from "@/lib/payments/config";

export const metadata: Metadata = { title: "Finalizar compra", robots: { index: false } };

export default function CheckoutPage() {
  const enabled = onlineCheckoutEnabled();
  return (
    <div className="container-page pt-6 md:pt-10">
      <header className="border-b border-line pb-6">
        <p className="meta">Pagamento online · Pix ou cartão</p>
        <h1 className="display mt-3 text-4xl sm:text-5xl">Finalizar compra</h1>
      </header>
      {enabled ? (
        <CheckoutForm />
      ) : (
        <div className="flex flex-col items-start gap-4 py-10">
          <p className="max-w-md text-ink-muted">
            O pagamento online ainda não está ativo. Abre o carrinho e finaliza pelo WhatsApp — a gente manda o Pix ou o link do
            cartão por lá.
          </p>
          <ButtonLink href="/loja" variant="secondary">
            Voltar pra loja
          </ButtonLink>
        </div>
      )}
    </div>
  );
}
