"use client";

import { clsx } from "clsx";
import { Minus, Plus, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { adjustStockAction } from "@/app/admin/actions";
import { inputClass } from "@/components/ui/form";
import { LanguageTag, StockStatus } from "@/components/ui/tags";
import { GAME_INFO, stockState } from "@/lib/catalog";
import { formatBRL } from "@/lib/format";
import type { Product } from "@/lib/types";

type Filter = "todos" | "baixo" | "esgotado" | "pre-venda" | "rascunho";

const FILTERS: { id: Filter; label: string; test: (p: Product) => boolean }[] = [
  { id: "todos", label: "Todos", test: () => true },
  { id: "baixo", label: "Estoque baixo", test: (p) => { const s = stockState(p); return s.kind === "pronta-entrega" && s.low; } },
  { id: "esgotado", label: "Esgotados", test: (p) => stockState(p).kind === "esgotado" },
  { id: "pre-venda", label: "Pré-venda", test: (p) => p.availability === "pre-venda" },
  { id: "rascunho", label: "Rascunhos", test: (p) => !p.published },
];

export function ProductAdminList({ products }: { products: Product[] }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("todos");
  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const terms = norm(q).split(/\s+/).filter(Boolean);
  const shown = products.filter(
    (p) =>
      FILTERS.find((f) => f.id === filter)!.test(p) &&
      terms.every((t) => norm(`${p.name} ${p.collection ?? ""} ${p.language ?? ""}`).includes(t)),
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search size={17} strokeWidth={1.75} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
        <label htmlFor="admin-q" className="sr-only">Filtrar produtos</label>
        <input id="admin-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrar por nome, coleção…" className={clsx(inputClass, "pl-10")} />
      </div>
      <div className="scroll-x -mx-4 flex gap-1.5 px-4">
        {FILTERS.map((f) => {
          const n = products.filter(f.test).length;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={clsx(
                "h-8 shrink-0 rounded-xs border px-3 text-xs transition-colors",
                filter === f.id ? "border-gold bg-gold text-on-gold" : "border-line-strong text-ink-muted hover:text-ink",
              )}
            >
              {f.label} <span className="font-mono opacity-70">{n}</span>
            </button>
          );
        })}
      </div>

      <ul className="border-t border-line">
        {shown.map((p) => (
          <ProductRow key={p.id} product={p} />
        ))}
        {!shown.length && <li className="py-10 text-center text-sm text-ink-muted">Nada por aqui com esse filtro.</li>}
      </ul>
    </div>
  );
}

function ProductRow({ product }: { product: Product }) {
  const [stock, setStock] = useState(product.stock);
  const [prevStock, setPrevStock] = useState(product.stock);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  // valor novo vindo do servidor (ex.: venda registrada em outra aba)
  if (product.stock !== prevStock) {
    setPrevStock(product.stock);
    setStock(product.stock);
  }

  const adjust = (delta: number) => {
    // otimista e relativo: toques rápidos não brigam com respostas fora de ordem
    setStock((s) => Math.max(0, s + delta));
    setError(false);
    startTransition(async () => {
      try {
        await adjustStockAction(product.id, delta);
      } catch {
        setStock((s) => Math.max(0, s - delta));
        setError(true);
      }
    });
  };

  return (
    <li className="flex items-center gap-3 border-b border-line py-2.5">
      <Link href={`/admin/produtos/${product.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative size-14 shrink-0 overflow-hidden border border-line bg-sunken">
          {product.images[0] && <Image src={product.images[0]} alt="" fill sizes="56px" className="object-cover" />}
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-medium text-ink">{product.name}</span>
          <span className="flex items-center gap-2">
            {product.language && <LanguageTag language={product.language} />}
            <span className="meta truncate">
              {product.game ? GAME_INFO[product.game].short : "Acessório"} · {formatBRL(product.priceCents)}
            </span>
          </span>
          <span className="flex items-center gap-2">
            {!product.published && <span className="meta !text-warn">Rascunho</span>}
            <StockStatus product={{ ...product, stock }} className="!text-[0.625rem]" />
          </span>
        </div>
      </Link>
      <div
        className={clsx("flex shrink-0 items-center rounded-sm border", error ? "border-danger" : "border-line")}
        role="group"
        aria-label={`Estoque de ${product.name}`}
      >
        <button type="button" onClick={() => adjust(-1)} disabled={stock <= 0} aria-label="Tirar 1 do estoque" className="grid h-11 w-10 place-items-center text-ink-muted hover:bg-raised hover:text-ink disabled:opacity-30">
          <Minus size={15} strokeWidth={2} />
        </button>
        <output aria-live="polite" className={clsx("w-9 text-center font-mono text-sm tabular-nums", pending && "opacity-60")}>
          {stock}
        </output>
        <button type="button" onClick={() => adjust(1)} aria-label="Somar 1 ao estoque" className="grid h-11 w-10 place-items-center text-ink-muted hover:bg-raised hover:text-ink">
          <Plus size={15} strokeWidth={2} />
        </button>
      </div>
    </li>
  );
}
