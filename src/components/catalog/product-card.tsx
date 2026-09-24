import { clsx } from "clsx";
import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { stockState } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { Price } from "@/components/ui/price";
import { GameTag, LanguageTag, StockStatus } from "@/components/ui/tags";
import { QuickAdd } from "./quick-add";
import { ProductPlaceholder } from "./product-placeholder";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const s = stockState(product);
  const soldOut = s.kind === "esgotado";
  const href = `/produto/${product.slug}`;

  return (
    <article
      data-game={product.game ?? undefined}
      className="group relative flex h-full w-full flex-col bg-surface"
    >
      <Link href={href} className="flex flex-1 flex-col focus-visible:outline-none">
        <ViewTransition name={`product-${product.id}`} share="product-photo" default="none">
          <div className={clsx("holo relative aspect-square bg-sunken", soldOut && "opacity-55 grayscale-[0.6]")}>
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt=""
                fill
                loading={priority ? "eager" : "lazy"}
                sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 50vw"
                className="object-cover"
              />
            ) : (
              <ProductPlaceholder product={product} />
            )}
          </div>
        </ViewTransition>
        {product.language && <LanguageTag language={product.language} className="absolute left-2 top-2" />}
        {s.kind === "pre-venda" && (
          <span className="absolute right-2 top-2 rounded-xs bg-violet px-1.5 py-0.5 font-mono text-[0.625rem] font-medium uppercase tracking-wider text-canvas">
            Pré-venda
          </span>
        )}

        <div className="flex flex-1 flex-col gap-1.5 border-t border-line p-2.5 sm:p-3">
          <div className="flex min-h-4 items-center gap-2 overflow-hidden">
            {product.game ? <GameTag game={product.game} /> : <span className="meta">Acessório</span>}
            {product.collection && <span className="meta truncate">· {product.collection}</span>}
          </div>
          <h3 className="line-clamp-2 text-[0.875rem] font-medium leading-snug text-ink sm:text-[0.9375rem]">
            {product.name}
          </h3>
          <div className="mt-auto flex flex-col gap-1 pt-1">
            <Price cents={product.priceCents} unitLabel={product.unitLabel} size="sm" className={soldOut ? "opacity-60" : ""} />
            <StockStatus product={product} />
          </div>
        </div>
      </Link>
      <div className="px-2.5 pb-2.5 sm:px-3 sm:pb-3">
        <QuickAdd product={product} />
      </div>
    </article>
  );
}

/**
 * Grade em "prateleira": bordas finas colapsadas entre os cards (margem negativa),
 * sem buracos coloridos quando a última fileira fica incompleta.
 */
const SHELF_COLUMNS = {
  default: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  catalog: "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4",
  feature: "grid-cols-2",
} as const;
export const shelfClass = "grid pl-px pt-px";
export const shelfCellClass =
  "relative -ml-px -mt-px flex border border-line transition-colors hover:z-10 hover:border-line-strong has-[a:focus-visible]:z-10 has-[a:focus-visible]:border-gold";

export function ProductGrid({
  products,
  priorityCount = 0,
  variant = "default",
}: {
  products: Product[];
  priorityCount?: number;
  variant?: keyof typeof SHELF_COLUMNS;
}) {
  return (
    <ul className={`${shelfClass} ${SHELF_COLUMNS[variant]}`}>
      {products.map((p, i) => (
        <li key={p.id} className={shelfCellClass}>
          <ProductCard product={p} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}

export function ProductGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <ul className={`${shelfClass} ${SHELF_COLUMNS.catalog}`} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className={`${shelfCellClass} flex-col bg-surface`}>
          <div className="skeleton aspect-square" />
          <div className="flex flex-col gap-2 p-3">
            <div className="skeleton h-3 w-1/2 rounded-xs" />
            <div className="skeleton h-4 w-full rounded-xs" />
            <div className="skeleton h-4 w-2/3 rounded-xs" />
            <div className="skeleton mt-2 h-5 w-1/3 rounded-xs" />
            <div className="skeleton mt-1 h-8 w-full rounded-xs" />
          </div>
        </li>
      ))}
    </ul>
  );
}
