import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { repo } from "@/lib/data";
import { fetchPayment, verifyWebhookSignature } from "@/lib/payments/mercadopago";

/**
 * Notificações do Mercado Pago (Webhooks, evento "payment").
 * Sempre reconsulta o pagamento na API — o corpo da notificação não é confiável sozinho.
 * Idempotente: markOrderPaid só baixa estoque na primeira confirmação.
 */
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const body = (await req.json().catch(() => ({}))) as { type?: string; action?: string; data?: { id?: string | number } };

  const type = body.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const dataId = String(body.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "");

  if (type !== "payment" || !dataId) return NextResponse.json({ ignored: true });

  if (!verifyWebhookSignature(req.headers, url.searchParams.get("data.id") ?? dataId)) {
    return NextResponse.json({ error: "assinatura inválida" }, { status: 401 });
  }

  try {
    const payment = await fetchPayment(dataId);
    if (!payment.orderId) return NextResponse.json({ ignored: true });

    if (payment.status === "approved") {
      const order = await repo.markOrderPaid(payment.orderId, payment.id);
      if (order) {
        revalidatePath("/", "layout");
      }
    } else if (payment.status === "rejected" || payment.status === "cancelled") {
      const order = await repo.getOrder(payment.orderId);
      if (order && order.status === "pendente") await repo.updateOrderStatus(order.id, "cancelado");
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[webhook mercadopago]", err);
    // 500 faz o Mercado Pago tentar de novo mais tarde
    return NextResponse.json({ error: "falha ao processar" }, { status: 500 });
  }
}
