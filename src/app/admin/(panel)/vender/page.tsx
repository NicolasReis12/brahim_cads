import type { Metadata } from "next";
import { SaleForm } from "@/components/admin/sale-form";
import { repo } from "@/lib/data";

export const metadata: Metadata = { title: "Registrar venda" };

export default async function SalePage() {
  const [products, orders] = await Promise.all([
    repo.listProducts({ includeDrafts: true }),
    repo.listOrders(),
  ]);
  const recent = orders.filter((o) => o.channel !== "online").slice(0, 5);
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="display text-2xl sm:text-3xl">Registrar venda</h1>
        <p className="mt-1 text-sm text-ink-muted">Venda do WhatsApp ou do balcão: registra aqui que o estoque do site baixa na hora.</p>
      </div>
      <SaleForm
        products={products.map((p) => ({ id: p.id, name: p.name, language: p.language, priceCents: p.priceCents, stock: p.stock, image: p.images[0] ?? null }))}
        recent={recent.map((o) => ({ id: o.id, number: o.number, channel: o.channel, totalCents: o.totalCents, createdAt: o.createdAt, items: o.items.length }))}
      />
    </div>
  );
}
