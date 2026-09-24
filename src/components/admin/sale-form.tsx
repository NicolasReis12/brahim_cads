"use client";

import { clsx } from "clsx";
import { Search, X } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import { recordSaleAction, type ActionState } from "@/app/admin/actions";
import { QuantityStepper } from "@/components/cart/quantity";
import { Button } from "@/components/ui/button";
import { Field, Input, Segmented, inputClass } from "@/components/ui/form";
import { LanguageTag } from "@/components/ui/tags";
import { formatBRL, formatDateTime, parseBRLToCents, centsToInput } from "@/lib/format";
import type { Language } from "@/lib/types";

type P = { id: string; name: string; language: Language | null; priceCents: number; stock: number; image: string | null };
type Line = { product: P; qty: number; price: string };

export function SaleForm({
  products,
  recent,
}: {
  products: P[];
  recent: { id: string; number: number; channel: string; totalCents: number; createdAt: string; items: number }[];
}) {
  const [channel, setChannel] = useState<"whatsapp" | "balcao">("balcao");
  const [q, setQ] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [customer, setCustomer] = useState("");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<ActionState>(null);
  const [pending, startTransition] = useTransition();

  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const terms = norm(q).split(/\s+/).filter(Boolean);
  const matches = terms.length
    ? products.filter((p) => terms.every((t) => norm(`${p.name} ${p.language ?? ""}`).includes(t))).slice(0, 8)
    : [];

  const add = (p: P) => {
    setResult(null);
    setLines((ls) =>
      ls.some((l) => l.product.id === p.id)
        ? ls.map((l) => (l.product.id === p.id ? { ...l, qty: Math.min(p.stock, l.qty + 1) } : l))
        : [...ls, { product: p, qty: 1, price: centsToInput(p.priceCents) }],
    );
    setQ("");
  };

  const total = lines.reduce((s, l) => s + parseBRLToCents(l.price) * l.qty, 0);

  const submit = () =>
    startTransition(async () => {
      const res = await recordSaleAction({
        channel,
        customerName: customer,
        notes,
        lines: lines.map((l) => ({ productId: l.product.id, quantity: l.qty, unitPriceCents: parseBRLToCents(l.price) })),
      });
      setResult(res);
      if (res?.ok) {
        setLines([]);
        setCustomer("");
        setNotes("");
      }
    });

  return (
    <div className="flex flex-col gap-6">
      <Segmented
        name="channel"
        value={channel}
        onChange={setChannel}
        options={[
          { value: "balcao", label: "Balcão", hint: "Venda na loja" },
          { value: "whatsapp", label: "WhatsApp", hint: "Pedido fechado na conversa" },
        ]}
      />

      <div className="relative">
        <label htmlFor="sale-q" className="meta mb-1.5 block">Adicionar produto</label>
        <div className="relative">
          <Search size={17} strokeWidth={1.75} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <input id="sale-q" type="search" autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Digite o nome…" className={clsx(inputClass, "pl-10")} />
        </div>
        {matches.length > 0 && (
          <ul className="absolute inset-x-0 top-full z-10 mt-1 max-h-80 overflow-y-auto border border-line-strong bg-raised shadow-xl">
            {matches.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  disabled={p.stock <= 0}
                  onClick={() => add(p)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-surface disabled:opacity-40"
                >
                  <div className="relative size-10 shrink-0 overflow-hidden bg-sunken">
                    {p.image && <Image src={p.image} alt="" fill sizes="40px" className="object-cover" />}
                  </div>
                  <span className="flex-1 text-sm">{p.name}</span>
                  {p.language && <LanguageTag language={p.language} />}
                  <span className="meta w-16 text-right">{p.stock > 0 ? `${p.stock} un.` : "esgotado"}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {lines.length > 0 && (
        <ul className="border-t border-line">
          {lines.map((l) => (
            <li key={l.product.id} className="flex flex-wrap items-center gap-3 border-b border-line py-3">
              <span className="min-w-0 flex-1 basis-40 text-sm">
                {l.product.name}
                <span className="meta block">{l.product.stock} em estoque</span>
              </span>
              <QuantityStepper
                size="sm"
                label={`Quantidade de ${l.product.name}`}
                value={l.qty}
                max={l.product.stock}
                onChange={(v) => setLines((ls) => ls.map((x) => (x.product.id === l.product.id ? { ...x, qty: v } : x)))}
              />
              <label className="sr-only" htmlFor={`price-${l.product.id}`}>Preço unitário</label>
              <input
                id={`price-${l.product.id}`}
                inputMode="decimal"
                value={l.price}
                onChange={(e) => setLines((ls) => ls.map((x) => (x.product.id === l.product.id ? { ...x, price: e.target.value } : x)))}
                className={clsx(inputClass, "h-8 w-24 font-mono text-sm")}
                title="Preço unitário (dá pra dar desconto)"
              />
              <button type="button" onClick={() => setLines((ls) => ls.filter((x) => x.product.id !== l.product.id))} aria-label={`Remover ${l.product.name}`} className="grid size-8 place-items-center text-ink-subtle hover:text-ink">
                <X size={16} />
              </button>
            </li>
          ))}
          <li className="flex justify-between py-3">
            <span className="text-ink-muted">Total</span>
            <span className="font-mono text-lg tabular-nums">{formatBRL(total)}</span>
          </li>
        </ul>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Cliente (opcional)" htmlFor="sale-customer">
          <Input id="sale-customer" value={customer} onChange={(e) => setCustomer(e.target.value)} />
        </Field>
        <Field label="Observação (opcional)" htmlFor="sale-notes">
          <Input id="sale-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex.: pago no Pix" />
        </Field>
      </div>

      <Button size="lg" onClick={submit} disabled={pending || !lines.length}>
        {pending ? "Registrando…" : `Registrar venda${lines.length ? ` · ${formatBRL(total)}` : ""}`}
      </Button>
      {result?.error && <p role="alert" className="border-l-2 border-danger pl-3 text-sm">{result.error}</p>}
      {result?.ok && <p role="status" className="border-l-2 border-ok pl-3 text-sm">{result.message}</p>}

      {recent.length > 0 && (
        <section className="mt-4">
          <h2 className="meta mb-2">Últimas vendas registradas</h2>
          <ul className="border-t border-line">
            {recent.map((o) => (
              <li key={o.id} className="flex justify-between gap-3 border-b border-line py-2 text-sm">
                <span className="text-ink-muted">
                  #{o.number} · {o.channel === "balcao" ? "Balcão" : "WhatsApp"} · {o.items} {o.items === 1 ? "item" : "itens"}
                </span>
                <span className="font-mono tabular-nums">
                  {formatBRL(o.totalCents)} <span className="meta ml-2">{formatDateTime(o.createdAt)}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
