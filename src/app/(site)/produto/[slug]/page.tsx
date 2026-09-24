import { Banknote, PackageCheck, Store, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { ProductGrid } from "@/components/catalog/product-card";
import { ProductPurchase } from "@/components/catalog/product-purchase";
import { Price } from "@/components/ui/price";
import { GameTag, StockStatus } from "@/components/ui/tags";
import { GAME_INFO, LANGUAGE_LABEL, TYPE_LABEL, formatEta, stockState } from "@/lib/catalog";
import { repo } from "@/lib/data";
import { formatBRL } from "@/lib/format";
import { JsonLd, productJsonLd } from "@/lib/seo";
import type { Product } from "@/lib/types";

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await repo.listProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/produto/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = await repo.getProductBySlug(slug);
  if (!p) return { title: "Produto não encontrado" };
  const s = stockState(p);
  const status = s.kind === "esgotado" ? "Esgotado" : s.kind === "pre-venda" ? "Pré-venda" : "Pronta entrega";
  const title = `${p.language && p.language !== "BR" ? `(${p.language}) ` : ""}${p.name}`;
  const description = `${formatBRL(p.priceCents)} à vista · ${status}. ${p.description}`.slice(0, 160);
  return {
    title,
    description,
    alternates: { canonical: `/produto/${p.slug}` },
    openGraph: {
      title: `${title} · ${formatBRL(p.priceCents)}`,
      description,
      images: p.images[0] ? [{ url: p.images[0], width: 1080, height: 1080, alt: p.name }] : undefined,
    },
  };
}

function related(all: Product[], p: Product): Product[] {
  const score = (x: Product) =>
    (x.collection && x.collection === p.collection ? 2 : 0) + (x.game === p.game ? 1 : 0) + (x.type === p.type ? 0.5 : 0);
  return all
    .filter((x) => x.id !== p.id && score(x) >= 1 && stockState(x).kind !== "esgotado")
    .sort((a, b) => score(b) - score(a) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);
}

export default async function ProductPage(props: PageProps<"/produto/[slug]">) {
  const { slug } = await props.params;
  const [product, all] = await Promise.all([repo.getProductBySlug(slug), repo.listProducts()]);
  if (!product) notFound();

  const s = stockState(product);
  const game = product.game ? GAME_INFO[product.game] : null;
  const rel = related(all, product);

  const specs: [string, string | null][] = [
    ["Jogo", game?.label ?? "Acessório (serve em todos)"],
    ["Tipo", TYPE_LABEL[product.type]],
    ["Idioma", product.language ? `${product.language} · ${LANGUAGE_LABEL[product.language]}` : null],
    ["Coleção", product.collection],
    ["Conteúdo", product.packageContents],
  ];

  return (
    <div data-game={product.game ?? undefined}>
      <div className="container-page pt-4 md:pt-8">
        <nav aria-label="Você está em" className="meta mb-4 flex items-center gap-1.5 whitespace-nowrap normal-case">
          <Link href="/loja" className="hover:text-ink">
            Loja
          </Link>
          <span aria-hidden>/</span>
          {game && (
            <>
              <Link href={game.path} className="hover:text-ink">
                {game.short}
              </Link>
              <span aria-hidden>/</span>
            </>
          )}
          <span aria-current="page" className="min-w-0 truncate text-ink-muted">
            {product.name}
          </span>
        </nav>

        <div className="grid gap-6 md:grid-cols-2 md:gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          <ProductGallery product={product} />

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {product.game && <GameTag game={product.game} />}
                <span className="meta">{TYPE_LABEL[product.type]}</span>
              </div>
              <h1 className="text-[1.625rem] font-semibold leading-[1.15] tracking-[-0.015em] text-ink sm:text-3xl lg:text-[2.125rem]">
                {product.name}
              </h1>
              <p className="meta flex flex-wrap gap-x-2">
                {[product.language, product.collection].filter(Boolean).map((m, i) => (
                  <span key={i} className="flex gap-2">
                    {i > 0 && <span aria-hidden>·</span>}
                    {m}
                  </span>
                ))}
              </p>
            </div>

            <div className="flex flex-col gap-2 border-y border-line py-4">
              <div className="flex items-baseline gap-2">
                <Price cents={product.priceCents} unitLabel={product.unitLabel} size="lg" />
                <span className="text-xs text-ink-subtle">à vista</span>
              </div>
              <StockStatus product={product} className="text-xs" />
              {s.kind === "pre-venda" && (
                <p className="mt-1 border-l-2 border-violet pl-3 text-sm text-ink-muted">
                  {s.eta ? `Previsão de chegada: ${formatEta(s.eta)}. ` : ""}
                  Dá pra garantir pagando aqui ou reservar com sinal pelo WhatsApp. Se a data mudar, a gente avisa.
                </p>
              )}
            </div>

            <ProductPurchase product={product} />

            <ul className="grid grid-cols-1 gap-px border border-line bg-line text-sm sm:grid-cols-2">
              <li className="flex gap-3 bg-canvas p-3">
                <Truck size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-ink-subtle" />
                <span className="text-ink-muted">Envio pra todo o Brasil (PAC/SEDEX) com embalagem reforçada</span>
              </li>
              <li className="flex gap-3 bg-canvas p-3">
                <Store size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-ink-subtle" />
                <span className="text-ink-muted">Retirada grátis na loja em Juiz de Fora</span>
              </li>
              <li className="flex gap-3 bg-canvas p-3">
                <Banknote size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-ink-subtle" />
                <span className="text-ink-muted">Pix, cartão via link, transferência ou dinheiro no balcão</span>
              </li>
              <li className="flex gap-3 bg-canvas p-3">
                <PackageCheck size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-ink-subtle" />
                <span className="text-ink-muted">Original e lacrado de fábrica</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 grid gap-10 border-t border-line pt-8 md:grid-cols-[1fr_1fr] lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          <section aria-labelledby="descricao">
            <h2 id="descricao" className="meta mb-3">
              Descrição
            </h2>
            <p className="max-w-prose whitespace-pre-line leading-relaxed text-ink-muted">{product.description}</p>
          </section>
          <section aria-labelledby="ficha">
            <h2 id="ficha" className="meta mb-3">
              Ficha
            </h2>
            <dl className="border-t border-line">
              {specs
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[7rem_1fr] gap-3 border-b border-line py-2.5 text-sm">
                    <dt className="font-mono text-[0.6875rem] uppercase tracking-wide text-ink-subtle">{k}</dt>
                    <dd className="text-ink">{v}</dd>
                  </div>
                ))}
            </dl>
          </section>
        </div>
      </div>

      {rel.length > 0 && (
        <section aria-labelledby="relacionados" className="container-page mt-16">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <h2 id="relacionados" className="display text-2xl sm:text-3xl">
              {product.collection && rel.some((r) => r.collection === product.collection)
                ? `Mais de ${product.collection}`
                : "Pra levar junto"}
            </h2>
            {game && (
              <Link href={game.path} className="meta hover:text-ink sm:shrink-0">
                Ver tudo de {game.short} →
              </Link>
            )}
          </div>
          <ProductGrid products={rel} />
        </section>
      )}

      <JsonLd data={productJsonLd(product)} />
    </div>
  );
}
