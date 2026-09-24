"use client";

import { clsx } from "clsx";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { createContext, use, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Select, inputClass } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import { GAME_INFO, LANGUAGE_LABEL, TYPE_LABEL } from "@/lib/catalog";
import {
  SORTS,
  activeFilterCount,
  serializeCatalogQuery,
  type CatalogQuery,
  type Facets,
  type Sort,
} from "@/lib/catalog-query";
import { AVAILABILITIES, GAMES, LANGUAGES, PRODUCT_TYPES, type Game } from "@/lib/types";

// Contexto: navegação com transição + estado pendente pra esmaecer a grade -----------------

type Ctx = {
  query: CatalogQuery;
  fixedGame?: Game;
  facets: Facets;
  total: number;
  pending: boolean;
  update: (patch: Partial<CatalogQuery>) => void;
};

const CatalogCtx = createContext<Ctx | null>(null);
const useCatalog = () => use(CatalogCtx)!;

export function CatalogProvider({
  query,
  fixedGame,
  facets,
  total,
  children,
}: Omit<Ctx, "pending" | "update"> & { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const update = (patch: Partial<CatalogQuery>) => {
    const params = serializeCatalogQuery({ ...query, ...patch }, fixedGame).toString();
    startTransition(() => {
      router.replace(params ? `${pathname}?${params}` : pathname, { scroll: false });
    });
  };

  return <CatalogCtx value={{ query, fixedGame, facets, total, pending, update }}>{children}</CatalogCtx>;
}

export function PendingArea({ children }: { children: ReactNode }) {
  const { pending } = useCatalog();
  return (
    <div aria-busy={pending} className={clsx("transition-opacity duration-200", pending && "opacity-50")}>
      {children}
    </div>
  );
}

// Busca -----------------------------------------------------------------------------------

export function SearchBox() {
  const { query, update } = useCatalog();
  const [value, setValue] = useState(query.q);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // mantém sincronizado quando a URL muda por fora (ex.: limpar filtros, voltar)
  const [prevQ, setPrevQ] = useState(query.q);
  if (prevQ !== query.q) {
    setPrevQ(query.q);
    if (value.trim() !== query.q) setValue(query.q);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <form
      role="search"
      className="relative flex-1"
      onSubmit={(e) => {
        e.preventDefault();
        clearTimeout(timer.current);
        update({ q: value.trim() });
      }}
    >
      <label htmlFor="busca" className="sr-only">
        Buscar por nome ou coleção
      </label>
      <Search size={18} strokeWidth={1.75} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
      <input
        id="busca"
        type="search"
        enterKeyHint="search"
        placeholder="Buscar por nome ou coleção"
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          setValue(v);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => update({ q: v.trim() }), 350);
        }}
        className={clsx(inputClass, "pl-10")}
      />
    </form>
  );
}

export function SortSelect() {
  const { query, update } = useCatalog();
  return (
    <div className="shrink-0">
      <label htmlFor="ordem" className="sr-only">
        Ordenar por
      </label>
      <Select id="ordem" value={query.ordem} onChange={(e) => update({ ordem: e.target.value as Sort })} className="w-auto">
        {Object.entries(SORTS).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </Select>
    </div>
  );
}

// Painel de filtros -----------------------------------------------------------------------

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-t border-line py-4 first:border-t-0 first:pt-0">
      <legend className="meta mb-2.5 float-left w-full">{title}</legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

function CheckRow({
  checked,
  onChange,
  label,
  count,
  game,
}: {
  checked: boolean;
  onChange: () => void;
  label: ReactNode;
  count?: number;
  game?: Game;
}) {
  return (
    <label
      data-game={game}
      className="group/check flex min-h-9 cursor-pointer items-center gap-2.5 text-sm text-ink-muted hover:text-ink has-[:checked]:text-ink"
    >
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        aria-hidden
        className={clsx(
          "grid size-4 shrink-0 place-items-center rounded-xs border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold",
          checked ? "border-[var(--game,var(--gold))] bg-[var(--game,var(--gold))]" : "border-line-strong",
        )}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="size-3 text-canvas" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="m2.5 6.2 2.3 2.3 4.7-5" />
          </svg>
        )}
      </span>
      {game && <span aria-hidden className="size-1.5 rotate-45 bg-[var(--game)]" />}
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="font-mono text-[0.6875rem] tabular-nums text-ink-subtle">{count}</span>}
    </label>
  );
}

const AVAILABILITY_LABEL = { "pronta-entrega": "Pronta entrega", "pre-venda": "Pré-venda", esgotado: "Esgotado" } as const;

export function FilterPanel() {
  const { query, update, facets, fixedGame } = useCatalog();
  const [min, setMin] = useState(query.min?.toString() ?? "");
  const [max, setMax] = useState(query.max?.toString() ?? "");

  const priceKey = `${query.min}-${query.max}`;
  const [prevPrice, setPrevPrice] = useState(priceKey);
  if (prevPrice !== priceKey) {
    setPrevPrice(priceKey);
    setMin(query.min?.toString() ?? "");
    setMax(query.max?.toString() ?? "");
  }

  const applyPrice = () => {
    const n = (s: string) => (s.trim() === "" ? null : Math.max(0, Math.floor(Number(s.replace(",", "."))) || 0));
    update({ min: n(min), max: n(max) });
  };

  const collections = Object.entries(facets.colecao).sort(([a], [b]) => a.localeCompare(b, "pt-BR"));

  return (
    <div className="flex flex-col">
      {!fixedGame && (
        <Group title="Jogo">
          {GAMES.filter((g) => facets.jogo[g]).map((g) => (
            <CheckRow
              key={g}
              game={g}
              checked={query.jogo.includes(g)}
              onChange={() => update({ jogo: toggle(query.jogo, g) })}
              label={GAME_INFO[g].label}
              count={facets.jogo[g]}
            />
          ))}
        </Group>
      )}

      <Group title="Disponibilidade">
        {AVAILABILITIES.filter((a) => facets.disp[a]).map((a) => (
          <CheckRow
            key={a}
            checked={query.disp.includes(a)}
            onChange={() => update({ disp: toggle(query.disp, a) })}
            label={AVAILABILITY_LABEL[a]}
            count={facets.disp[a]}
          />
        ))}
      </Group>

      <Group title="Idioma">
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGES.filter((l) => facets.idioma[l]).map((l) => {
            const on = query.idioma.includes(l);
            return (
              <button
                key={l}
                type="button"
                aria-pressed={on}
                title={LANGUAGE_LABEL[l]}
                onClick={() => update({ idioma: toggle(query.idioma, l) })}
                className={clsx(
                  "h-9 min-w-12 rounded-xs border px-2.5 font-mono text-xs tracking-wider transition-colors",
                  on ? "border-gold bg-gold text-on-gold" : "border-line-strong text-ink-muted hover:border-ink-muted hover:text-ink",
                )}
              >
                {l}
                <span className="sr-only"> ({LANGUAGE_LABEL[l]})</span>
              </button>
            );
          })}
        </div>
      </Group>

      <Group title="Tipo">
        {PRODUCT_TYPES.filter((t) => facets.tipo[t]).map((t) => (
          <CheckRow
            key={t}
            checked={query.tipo.includes(t)}
            onChange={() => update({ tipo: toggle(query.tipo, t) })}
            label={TYPE_LABEL[t]}
            count={facets.tipo[t]}
          />
        ))}
      </Group>

      {collections.length > 0 && (
        <Group title="Coleção">
          {collections.map(([c, n]) => (
            <CheckRow
              key={c}
              checked={query.colecao.includes(c)}
              onChange={() => update({ colecao: toggle(query.colecao, c) })}
              label={c}
              count={n}
            />
          ))}
        </Group>
      )}

      <Group title="Preço (R$)">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            applyPrice();
          }}
        >
          <label className="sr-only" htmlFor="preco-min">
            Preço mínimo
          </label>
          <input
            id="preco-min"
            inputMode="numeric"
            placeholder="mín."
            value={min}
            onChange={(e) => setMin(e.target.value.replace(/[^\d]/g, ""))}
            onBlur={applyPrice}
            className={clsx(inputClass, "h-9 font-mono text-sm")}
          />
          <span aria-hidden className="text-ink-subtle">
            –
          </span>
          <label className="sr-only" htmlFor="preco-max">
            Preço máximo
          </label>
          <input
            id="preco-max"
            inputMode="numeric"
            placeholder="máx."
            value={max}
            onChange={(e) => setMax(e.target.value.replace(/[^\d]/g, ""))}
            onBlur={applyPrice}
            className={clsx(inputClass, "h-9 font-mono text-sm")}
          />
          <button type="submit" className="sr-only">
            Aplicar preço
          </button>
        </form>
      </Group>
    </div>
  );
}

// Chips dos filtros ativos ------------------------------------------------------------------

export function ActiveFilters() {
  const { query, update, fixedGame } = useCatalog();
  const chips: { key: string; label: string; remove: () => void; game?: Game }[] = [];

  if (!fixedGame)
    query.jogo.forEach((g) =>
      chips.push({ key: `j-${g}`, label: GAME_INFO[g].short, game: g, remove: () => update({ jogo: toggle(query.jogo, g) }) }),
    );
  query.disp.forEach((d) => chips.push({ key: `d-${d}`, label: AVAILABILITY_LABEL[d], remove: () => update({ disp: toggle(query.disp, d) }) }));
  query.idioma.forEach((l) => chips.push({ key: `i-${l}`, label: l, remove: () => update({ idioma: toggle(query.idioma, l) }) }));
  query.tipo.forEach((t) => chips.push({ key: `t-${t}`, label: TYPE_LABEL[t], remove: () => update({ tipo: toggle(query.tipo, t) }) }));
  query.colecao.forEach((c) => chips.push({ key: `c-${c}`, label: c, remove: () => update({ colecao: toggle(query.colecao, c) }) }));
  if (query.min !== null || query.max !== null)
    chips.push({
      key: "preco",
      label: `R$ ${query.min ?? 0} – ${query.max !== null ? `R$ ${query.max}` : "∞"}`,
      remove: () => update({ min: null, max: null }),
    });
  if (query.q) chips.push({ key: "q", label: `“${query.q}”`, remove: () => update({ q: "" }) });

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          data-game={c.game}
          onClick={c.remove}
          className="inline-flex h-8 items-center gap-1.5 rounded-xs border border-[var(--game,var(--line-strong))] bg-raised pl-2.5 pr-1.5 text-xs text-ink hover:border-ink-muted"
          aria-label={`Remover filtro ${c.label}`}
        >
          {c.label}
          <X size={13} strokeWidth={2} className="text-ink-subtle" />
        </button>
      ))}
      <button
        type="button"
        onClick={() => update({ q: "", jogo: [], tipo: [], idioma: [], colecao: [], disp: [], min: null, max: null })}
        className="h-8 px-2 text-xs text-ink-muted underline-offset-2 hover:text-ink hover:underline"
      >
        Limpar tudo
      </button>
    </div>
  );
}

// Botão + drawer inferior no celular ---------------------------------------------------------

export function MobileFilters() {
  const { query, fixedGame, total, pending } = useCatalog();
  const [open, setOpen] = useState(false);
  const n = activeFilterCount(query, fixedGame);
  return (
    <>
      <Button variant="secondary" className="h-11 shrink-0 lg:hidden" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <SlidersHorizontal /> Filtros
        {n > 0 && (
          <span className="grid h-5 min-w-5 place-items-center rounded-xs bg-gold px-1 font-mono text-[0.625rem] text-on-gold">{n}</span>
        )}
      </Button>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        side="bottom"
        title="Filtros"
        footer={
          <Button size="lg" className="w-full" onClick={() => setOpen(false)}>
            {pending ? "Filtrando…" : `Ver ${total} ${total === 1 ? "produto" : "produtos"}`}
          </Button>
        }
      >
        <div className="px-4 py-4">
          <FilterPanel />
        </div>
      </Sheet>
    </>
  );
}
