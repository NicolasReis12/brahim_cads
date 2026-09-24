import { clsx } from "clsx";
import type { Metadata } from "next";
import Link from "next/link";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { repo } from "@/lib/data";
import { formatBRL, formatCep, formatDateTime } from "@/lib/format";
import type { OrderChannel } from "@/lib/types";

export const metadata: Metadata = { title: "Pedidos" };

const TABS: { id: OrderChannel | "todos"; label: string }[] = [
  { id: "online", label: "Online" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "balcao", label: "Balcão" },
  { id: "todos", label: "Todos" },
];

const STATUS_TONE: Record<string, string> = {
  pendente: "text-warn",
  pago: "text-ok",
  enviado: "text-game-lorcana",
  entregue: "text-ink-muted",
  cancelado: "text-ink-subtle line-through",
};

export default async function OrdersPage(props: PageProps<"/admin/pedidos">) {
  const sp = await props.searchParams;
  const tab = (TABS.find((t) => t.id === sp.canal)?.id ?? "online") as OrderChannel | "todos";
  const orders = await repo.listOrders(tab === "todos" ? undefined : { channel: tab });

  return (
    <div className="flex flex-col gap-5">
      <h1 className="display text-2xl sm:text-3xl">Pedidos</h1>
      <nav aria-label="Canal" className="flex gap-1.5">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/admin/pedidos?canal=${t.id}`}
            aria-current={tab === t.id ? "page" : undefined}
            className={clsx(
              "h-8 rounded-xs border px-3 text-xs leading-8 transition-colors",
              tab === t.id ? "border-gold bg-gold text-on-gold" : "border-line-strong text-ink-muted hover:text-ink",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {orders.length === 0 ? (
        <p className="border-y border-line py-10 text-center text-sm text-ink-muted">Nenhum pedido aqui ainda.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((o) => (
            <li key={o.id} className="border border-line bg-surface">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center gap-3 p-3 [&::-webkit-details-marker]:hidden">
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-sm">#{o.number}</span>
                      <span className={clsx("meta", STATUS_TONE[o.status])}>{o.status}</span>
                    </span>
                    <span className="truncate text-sm text-ink">{o.customerName}</span>
                    <span className="meta normal-case">
                      {formatDateTime(o.createdAt)} · {(() => { const n = o.items.reduce((s, i) => s + i.quantity, 0); return `${n} ${n === 1 ? "item" : "itens"}`; })()} ·{" "}
                      {o.deliveryMethod === "retirada" ? "retirada" : `envio ${o.cep ? formatCep(o.cep) : ""}`}
                    </span>
                  </div>
                  <span className="font-mono text-sm tabular-nums">{formatBRL(o.totalCents)}</span>
                </summary>
                <div className="flex flex-col gap-3 border-t border-line p-3 text-sm">
                  <ul className="flex flex-col gap-1">
                    {o.items.map((i, idx) => (
                      <li key={idx} className="flex justify-between gap-3">
                        <span><span className="font-mono text-ink-subtle">{i.quantity}×</span> {i.name}</span>
                        <span className="font-mono tabular-nums">{formatBRL(i.unitPriceCents * i.quantity)}</span>
                      </li>
                    ))}
                    {o.shippingCents > 0 && (
                      <li className="flex justify-between text-ink-muted">
                        <span>Frete</span>
                        <span className="font-mono tabular-nums">{formatBRL(o.shippingCents)}</span>
                      </li>
                    )}
                  </ul>
                  {(o.customerPhone || o.customerEmail || o.address || o.notes) && (
                    <dl className="grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-1 text-ink-muted">
                      {o.customerPhone && (<><dt className="meta">WhatsApp</dt><dd><a className="underline" href={`https://wa.me/55${o.customerPhone}`} target="_blank" rel="noopener">{o.customerPhone}</a></dd></>)}
                      {o.customerEmail && (<><dt className="meta">E-mail</dt><dd>{o.customerEmail}</dd></>)}
                      {o.address && (<><dt className="meta">Endereço</dt><dd>{o.address}</dd></>)}
                      {o.notes && (<><dt className="meta">Obs.</dt><dd>{o.notes}</dd></>)}
                      {o.paymentId && (<><dt className="meta">Pagamento</dt><dd className="font-mono text-xs">MP {o.paymentId}</dd></>)}
                    </dl>
                  )}
                  <OrderStatusSelect id={o.id} status={o.status} />
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
