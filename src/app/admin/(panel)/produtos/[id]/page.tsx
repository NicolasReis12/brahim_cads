import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { repo } from "@/lib/data";

export const metadata: Metadata = { title: "Editar produto" };

export default async function EditProductPage(props: PageProps<"/admin/produtos/[id]">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const [product, products] = await Promise.all([repo.getProductById(id), repo.listProducts({ includeDrafts: true })]);
  if (!product) notFound();
  const collections = [...new Set(products.map((p) => p.collection).filter(Boolean) as string[])].sort();
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link href="/admin" className="meta hover:text-ink">← Produtos</Link>
        <h1 className="display mt-2 text-2xl sm:text-3xl">Editar produto</h1>
      </div>
      <ProductForm product={product} collections={collections} saved={sp.salvo === "1"} />
    </div>
  );
}
