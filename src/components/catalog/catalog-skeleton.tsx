import { ProductGridSkeleton } from "./product-card";

export function CatalogSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando produtos">
      <div className="container-page pb-6 pt-6 md:pt-10">
        <div className="flex flex-col gap-3 border-b border-line pb-6">
          <div className="skeleton h-3 w-40 rounded-xs" />
          <div className="skeleton h-12 w-56 rounded-xs" />
        </div>
      </div>
      <div className="container-page grid gap-8 lg:grid-cols-[15rem_1fr]">
        <div className="hidden flex-col gap-3 lg:flex">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="skeleton h-5 rounded-xs" style={{ width: `${60 + ((i * 17) % 35)}%` }} />
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <div className="skeleton h-11 rounded-sm" />
          <div className="skeleton h-3 w-24 rounded-xs" />
          <ProductGridSkeleton />
        </div>
      </div>
    </div>
  );
}
