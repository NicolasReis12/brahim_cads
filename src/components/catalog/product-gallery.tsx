"use client";

import { clsx } from "clsx";
import Image from "next/image";
import { useState, ViewTransition } from "react";
import type { Product } from "@/lib/types";
import { ProductPlaceholder } from "./product-placeholder";

export function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const images = product.images;

  return (
    <div className="flex flex-col gap-2">
      <ViewTransition name={`product-${product.id}`} share="product-photo" default="none">
        <div className="holo relative aspect-square border border-line bg-sunken">
          {images[active] ? (
            <Image
              key={images[active]}
              src={images[active]}
              alt={`${product.name}${images.length > 1 ? ` — foto ${active + 1} de ${images.length}` : ""}`}
              fill
              preload
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          ) : (
            <ProductPlaceholder product={product} />
          )}
        </div>
      </ViewTransition>
      {images.length > 1 && (
        <div className="flex gap-2" role="group" aria-label="Fotos do produto">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-pressed={i === active}
              className={clsx(
                "relative size-16 overflow-hidden border bg-sunken transition-colors sm:size-20",
                i === active ? "border-gold" : "border-line hover:border-line-strong",
              )}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
