import { TYPE_LABEL } from "@/lib/catalog";
import type { Product } from "@/lib/types";

/** Sem foto: verso de carta genérico com o tipo do produto, em vez de imagem quebrada. */
export function ProductPlaceholder({ product }: { product: Pick<Product, "type" | "name"> }) {
  return (
    <div className="absolute inset-0 grid place-items-center p-[14%]">
      <div className="flex aspect-[63/88] h-full flex-col items-center justify-center gap-2 rounded-sm border border-line-strong bg-[repeating-linear-gradient(135deg,var(--surface)_0_6px,var(--sunken)_6px_12px)] p-3 text-center">
        <span className="meta">{TYPE_LABEL[product.type]}</span>
        <span className="meta !text-[0.5625rem] opacity-70">foto em breve</span>
      </div>
    </div>
  );
}
