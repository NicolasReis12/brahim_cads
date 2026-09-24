import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { ProductAdminList } from "@/components/admin/product-admin-list";
import { ButtonLink } from "@/components/ui/button";
import { repo } from "@/lib/data";

export const metadata: Metadata = { title: "Produtos" };

export default async function AdminProductsPage() {
  const products = await repo.listProducts({ includeDrafts: true });
  products.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="display text-2xl sm:text-3xl">Produtos</h1>
          <p className="meta mt-1">
            {products.length} cadastrados · {products.filter((p) => !p.published).length} rascunhos
          </p>
        </div>
        <ButtonLink href="/admin/produtos/novo">
          <Plus /> Novo
        </ButtonLink>
      </div>
      <ProductAdminList products={products} />
    </div>
  );
}
