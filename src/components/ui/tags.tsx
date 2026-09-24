import { clsx } from "clsx";
import { GAME_INFO, stockLabel, stockState } from "@/lib/catalog";
import type { Game, Language, Product } from "@/lib/types";

/** Etiqueta de idioma: caixinha em mono, como o código de idioma impresso na carta. */
export function LanguageTag({ language, className }: { language: Language; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex h-5 items-center rounded-xs border border-line-strong bg-canvas/80 px-1.5 font-mono text-[0.625rem] font-medium tracking-wider text-ink",
        className,
      )}
      title={`Idioma: ${language}`}
    >
      {language}
    </span>
  );
}

export function GameTag({ game, className }: { game: Game; className?: string }) {
  return (
    <span data-game={game} className={clsx("inline-flex items-center gap-1.5 meta !text-[var(--game)]", className)}>
      <span aria-hidden className="size-1.5 rotate-45 bg-[var(--game)]" />
      {GAME_INFO[game].short}
    </span>
  );
}

const STOCK_TONE = {
  "pronta-entrega": "text-ok",
  low: "text-warn",
  "pre-venda": "text-violet",
  esgotado: "text-ink-subtle",
} as const;

export function StockStatus({ product, className }: { product: Pick<Product, "availability" | "stock" | "preorderEta">; className?: string }) {
  const s = stockState(product);
  const tone = s.kind === "pronta-entrega" && s.low ? STOCK_TONE.low : STOCK_TONE[s.kind];
  return (
    <span className={clsx("inline-flex items-center gap-1.5 font-mono text-[0.6875rem] uppercase tracking-wide", tone, className)}>
      <span
        aria-hidden
        className={clsx(
          "size-1.5 rounded-full",
          s.kind === "esgotado" ? "border border-current" : "bg-current",
        )}
      />
      {stockLabel(s)}
    </span>
  );
}
