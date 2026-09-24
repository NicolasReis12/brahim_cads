import { MessageCircle } from "lucide-react";
import { ButtonA } from "@/components/ui/button";
import { GAME_INFO } from "@/lib/catalog";
import { applyCatalogQuery, facetOptions, parseCatalogQuery } from "@/lib/catalog-query";
import { repo } from "@/lib/data";
import type { Game } from "@/lib/types";
import { generalWhatsappUrl } from "@/lib/whatsapp";
import {
  ActiveFilters,
  CatalogProvider,
  FilterPanel,
  MobileFilters,
  PendingArea,
  SearchBox,
  SortSelect,
} from "./catalog-controls";
import { ProductGrid } from "./product-card";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  game?: Game;
};

export async function CatalogView({ searchParams, game }: Props) {
  const [raw, all] = await Promise.all([searchParams, repo.listProducts()]);
  const base = game ? all.filter((p) => p.game === game) : all;
  const query = parseCatalogQuery(raw, game);
  const results = applyCatalogQuery(base, query);
  const facets = facetOptions(base);

  return (
    <CatalogProvider query={query} fixedGame={game} facets={facets} total={results.length}>
      <CatalogHeader game={game} total={base.length} />
      <div className="container-page grid gap-8 pb-8 lg:grid-cols-[15rem_1fr]">
        <aside aria-label="Filtros" className="hidden lg:block">
          <div className="sticky top-[calc(var(--header-h)+1.5rem)] max-h-[calc(100dvh-var(--header-h)-3rem)] overflow-y-auto pr-2">
            <FilterPanel />
          </div>
        </aside>

        <section aria-labelledby="lista-produtos" className="flex min-w-0 flex-col gap-4">
          <h2 id="lista-produtos" className="sr-only">
            Produtos
          </h2>
          <div className="flex gap-2">
            <SearchBox />
            <MobileFilters />
            <div className="hidden sm:block">
              <SortSelect />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 sm:hidden">
            <p className="meta" aria-live="polite">
              {results.length} {results.length === 1 ? "produto" : "produtos"}
            </p>
            <SortSelect />
          </div>
          <div className="hidden items-center justify-between sm:flex">
            <p className="meta" aria-live="polite">
              {results.length} {results.length === 1 ? "produto" : "produtos"}
            </p>
          </div>
          <ActiveFilters />

          <PendingArea>
            {results.length ? (
              <ProductGrid products={results} priorityCount={4} variant="catalog" />
            ) : (
              <EmptyResults q={query.q} gameLabel={game ? GAME_INFO[game].short : undefined} />
            )}
          </PendingArea>
        </section>
      </div>
    </CatalogProvider>
  );
}

function CatalogHeader({ game, total }: { game?: Game; total: number }) {
  const info = game ? GAME_INFO[game] : null;
  return (
    <div data-game={game} className="container-page pb-6 pt-6 md:pt-10">
      <div className="flex flex-col gap-3 border-b border-line pb-6 md:flex-row md:items-end md:justify-between md:gap-10">
        <div className="flex flex-col gap-3">
          <p className="meta flex items-center gap-2">
            {info ? (
              <>
                <span aria-hidden className="size-2 rotate-45 bg-[var(--game)]" />
                <span className="!text-[var(--game)]">{info.label}</span>
              </>
            ) : (
              "Catálogo completo"
            )}
            <span aria-hidden>·</span>
            <span>{total} itens</span>
          </p>
          <h1 className="display text-4xl sm:text-5xl md:text-6xl">{info ? info.short : "Loja"}</h1>
        </div>
        <p className="max-w-md text-sm text-ink-muted md:text-right">
          {info
            ? info.blurb
            : "Tudo que está no balcão e no estoque: Pokémon, Lorcana, One Piece e acessórios. Esgotado continua aqui — clica em Avise-me que a gente te chama quando chegar."}
        </p>
      </div>
    </div>
  );
}

function EmptyResults({ q, gameLabel }: { q: string; gameLabel?: string }) {
  const ask = q
    ? `Oi! Procurei "${q}" no site e não achei. Vocês conseguem?`
    : `Oi! Estou procurando um produto${gameLabel ? ` de ${gameLabel}` : ""} que não achei no site.`;
  return (
    <div className="flex flex-col items-start gap-4 border border-dashed border-line-strong px-5 py-12 sm:px-10">
      <p className="display text-2xl sm:text-3xl">Não achou?</p>
      <p className="max-w-md text-ink-muted">
        Chama no WhatsApp que a gente procura. Muita coisa chega por encomenda e nem sempre dá tempo de cadastrar.
      </p>
      <ButtonA href={generalWhatsappUrl(ask)} target="_blank" rel="noopener" variant="whatsapp">
        <MessageCircle /> Pedir no WhatsApp
      </ButtonA>
    </div>
  );
}
