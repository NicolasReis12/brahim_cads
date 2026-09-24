import Image from "next/image";
import Link from "next/link";
import { formatEta } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { Price } from "@/components/ui/price";
import { GameTag, LanguageTag } from "@/components/ui/tags";
import { ProductPlaceholder } from "./product-placeholder";

/** Pré-vendas em linhas, como uma lista de reservas — contrasta com a grade de novidades. */
export function PreorderList({ products }: { products: Product[] }) {
  return (
    <ul className="border-t border-line">
      {products.map((p) => (
        <li key={p.id} data-game={p.game ?? undefined} className="border-b border-line">
          <Link
            href={`/produto/${p.slug}`}
            className="group grid grid-cols-[4.5rem_1fr] items-center gap-x-4 gap-y-2 py-3 transition-colors hover:bg-surface sm:grid-cols-[5rem_1fr_8rem_8rem] sm:px-2"
          >
            <div className="holo relative row-span-2 aspect-square border border-line bg-sunken sm:row-span-1">
              {p.images[0] ? (
                <Image src={p.images[0]} alt="" fill sizes="80px" className="object-cover" />
              ) : (
                <ProductPlaceholder product={p} />
              )}
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex items-center gap-2">
                {p.game && <GameTag game={p.game} />}
                {p.language && <LanguageTag language={p.language} />}
              </div>
              <span className="line-clamp-2 text-sm font-medium leading-snug text-ink group-hover:underline sm:text-[0.9375rem]">
                {p.name}
              </span>
            </div>
            <div className="col-start-2 flex items-baseline justify-between gap-3 sm:col-start-auto sm:flex-col sm:items-start sm:gap-0.5">
              <span className="meta">Previsão</span>
              <span className="font-mono text-sm uppercase text-violet">{p.preorderEta ? formatEta(p.preorderEta) : "a confirmar"}</span>
            </div>
            <div className="hidden sm:flex sm:justify-end">
              <Price cents={p.priceCents} size="sm" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
