import type { Metadata } from "next";
import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { repo } from "@/lib/data";

export const metadata: Metadata = { title: "Novo produto" };

export default async function NewProductPage() {
  const products = await repo.listProducts({ includeDrafts: true });
  const collections = [...new Set(products.map((p) => p.collection).filter(Boolean) as string[])].sort();
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link href="/admin" className="meta hover:text-ink">← Produtos</Link>
        <h1 className="display mt-2 text-2xl sm:text-3xl">Novo produto</h1>
      </div>
      <ProductForm collections={collections} />
    </div>
  );
}
