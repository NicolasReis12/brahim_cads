import { CheckCircle2, Clock, MessageCircle, XCircle } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClearCartOnPaid } from "@/components/cart/clear-cart";
import { ButtonA, ButtonLink } from "@/components/ui/button";
import { repo } from "@/lib/data";
import { formatBRL } from "@/lib/format";
import { onlineCheckoutEnabled } from "@/lib/payments/config";
import { fetchPayment } from "@/lib/payments/mercadopago";
import { generalWhatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Seu pedido", robots: { index: false } };

export default async function OrderPage(props: PageProps<"/pedido/[id]">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  // IDs são UUID: não dá pra adivinhar o pedido de outra pessoa
  let order = /^[0-9a-f-]{36}$/i.test(id) ? await repo.getOrder(id) : null;
  if (!order || order.channel !== "online") notFound();

  // Retorno do Mercado Pago traz payment_id: confere direto na API caso o webhook ainda não tenha chegado.
  const paymentId = typeof sp.payment_id === "string" ? sp.payment_id : null;
  if (!order.paidAt && paymentId && /^\d+$/.test(paymentId) && onlineCheckoutEnabled()) {
    try {
      const payment = await fetchPayment(paymentId);
      if (payment.status === "approved" && payment.orderId === order.id) {
        order = (await repo.markOrderPaid(order.id, payment.id)) ?? order;
      }
    } catch {
      // segue mostrando "aguardando"; o webhook confirma depois
    }
  }

  const paid = Boolean(order.paidAt);
  const failed = order.status === "cancelado" || sp.falhou === "1";

  const Icon = paid ? CheckCircle2 : failed ? XCircle : Clock;
  const title = paid ? "Pagamento confirmado" : failed ? "Pagamento não concluído" : "Aguardando confirmação";
  const text = paid
    ? order.deliveryMethod === "retirada"
      ? "Já separamos seus produtos. Quando quiser, é só passar na loja pra retirar."
      : "Já separamos seus produtos. Assim que postar, mandamos o código de rastreio no seu WhatsApp."
    : failed
      ? "O pagamento não foi aprovado. Você pode tentar de novo pelo carrinho ou fechar pelo WhatsApp."
      : "O Mercado Pago ainda está processando. Pix costuma confirmar em segundos — atualize a página daqui a pouco.";

  return (
    <div className="container-page max-w-2xl py-10">
      {paid && <ClearCartOnPaid />}
      <Icon size={32} strokeWidth={1.5} className={paid ? "text-ok" : failed ? "text-danger" : "text-warn"} aria-hidden />
      <p className="meta mt-4">Pedido #{order.number}</p>
      <h1 className="display mt-2 text-3xl sm:text-4xl">{title}</h1>
      <p className="mt-3 text-ink-muted">{text}</p>

      <ul className="mt-8 border-t border-line">
        {order.items.map((i) => (
          <li key={i.productId + i.name} className="flex justify-between gap-4 border-b border-line py-3 text-sm">
            <span>
              <span className="font-mono text-ink-subtle">{i.quantity}×</span> {i.name}
            </span>
            <span className="font-mono tabular-nums">{formatBRL(i.unitPriceCents * i.quantity)}</span>
          </li>
        ))}
        <li className="flex justify-between border-b border-line py-3 text-sm text-ink-muted">
          <span>Frete</span>
          <span className="font-mono tabular-nums">{order.shippingCents ? formatBRL(order.shippingCents) : "retirada na loja"}</span>
        </li>
        <li className="flex justify-between py-3 font-medium">
          <span>Total</span>
          <span className="font-mono tabular-nums">{formatBRL(order.totalCents)}</span>
        </li>
      </ul>

      <div className="mt-6 flex flex-wrap gap-2">
        <ButtonA href={generalWhatsappUrl(`Oi! Sobre o pedido #${order.number} do site:`)} target="_blank" rel="noopener" variant="whatsapp">
          <MessageCircle /> Falar sobre o pedido
        </ButtonA>
        <ButtonLink href="/loja" variant="ghost">
          Continuar comprando
        </ButtonLink>
      </div>
    </div>
  );
}
