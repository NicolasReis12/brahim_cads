import { effectiveAvailability } from "./catalog";
import {
  AVAILABILITIES,
  GAMES,
  LANGUAGES,
  PRODUCT_TYPES,
  type Availability,
  type Game,
  type Language,
  type Product,
  type ProductType,
} from "./types";

export const SORTS = {
  novidades: "Novidades",
  "menor-preco": "Menor preço",
  "maior-preco": "Maior preço",
} as const;
export type Sort = keyof typeof SORTS;

export type CatalogQuery = {
  q: string;
  jogo: Game[];
  tipo: ProductType[];
  idioma: Language[];
  colecao: string[];
  disp: Availability[];
  min: number | null; // reais inteiros
  max: number | null;
  ordem: Sort;
};

type RawParams = Record<string, string | string[] | undefined>;

function list<T extends string>(raw: RawParams, key: string, allowed?: readonly T[]): T[] {
  const v = raw[key];
  const values = (Array.isArray(v) ? v : v ? [v] : []).flatMap((s) => s.split(",")).filter(Boolean);
  return (allowed ? values.filter((x) => (allowed as readonly string[]).includes(x)) : values) as T[];
}

function num(raw: RawParams, key: string): number | null {
  const v = raw[key];
  const n = Number(Array.isArray(v) ? v[0] : v);
  return v !== undefined && Number.isFinite(n) && n >= 0 ? n : null;
}

export function parseCatalogQuery(raw: RawParams, fixedGame?: Game): CatalogQuery {
  const ordem = (Array.isArray(raw.ordem) ? raw.ordem[0] : raw.ordem) as Sort;
  const q = Array.isArray(raw.q) ? raw.q[0] : raw.q;
  return {
    q: (q ?? "").trim().slice(0, 80),
    jogo: fixedGame ? [fixedGame] : list(raw, "jogo", GAMES),
    tipo: list(raw, "tipo", PRODUCT_TYPES),
    idioma: list(raw, "idioma", LANGUAGES),
    colecao: list(raw, "colecao"),
    disp: list(raw, "disp", AVAILABILITIES),
    min: num(raw, "min"),
    max: num(raw, "max"),
    ordem: ordem in SORTS ? ordem : "novidades",
  };
}

/** Serializa de volta pra URL. Omite valores padrão pra manter o link curto. */
export function serializeCatalogQuery(q: CatalogQuery, fixedGame?: Game): URLSearchParams {
  const p = new URLSearchParams();
  if (q.q) p.set("q", q.q);
  if (!fixedGame && q.jogo.length) p.set("jogo", q.jogo.join(","));
  if (q.tipo.length) p.set("tipo", q.tipo.join(","));
  if (q.idioma.length) p.set("idioma", q.idioma.join(","));
  if (q.colecao.length) p.set("colecao", q.colecao.join(","));
  if (q.disp.length) p.set("disp", q.disp.join(","));
  if (q.min !== null) p.set("min", String(q.min));
  if (q.max !== null) p.set("max", String(q.max));
  if (q.ordem !== "novidades") p.set("ordem", q.ordem);
  return p;
}

export function activeFilterCount(q: CatalogQuery, fixedGame?: Game): number {
  return (
    (fixedGame ? 0 : q.jogo.length) +
    q.tipo.length +
    q.idioma.length +
    q.colecao.length +
    q.disp.length +
    (q.min !== null || q.max !== null ? 1 : 0)
  );
}

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function applyCatalogQuery(products: Product[], q: CatalogQuery): Product[] {
  const terms = normalize(q.q).split(/\s+/).filter(Boolean);
  const out = products.filter((p) => {
    if (q.jogo.length && !(p.game && q.jogo.includes(p.game))) return false;
    if (q.tipo.length && !q.tipo.includes(p.type)) return false;
    if (q.idioma.length && !(p.language && q.idioma.includes(p.language))) return false;
    if (q.colecao.length && !(p.collection && q.colecao.includes(p.collection))) return false;
    if (q.disp.length && !q.disp.includes(effectiveAvailability(p))) return false;
    if (q.min !== null && p.priceCents < q.min * 100) return false;
    if (q.max !== null && p.priceCents > q.max * 100) return false;
    if (terms.length) {
      const hay = normalize([p.name, p.collection, p.language, p.type].filter(Boolean).join(" "));
      if (!terms.every((t) => hay.includes(t))) return false;
    }
    return true;
  });

  // Esgotados vão pro fim em qualquer ordenação — continuam visíveis, mas não na frente.
  const soldOutLast = (a: Product, b: Product) =>
    Number(effectiveAvailability(a) === "esgotado") - Number(effectiveAvailability(b) === "esgotado");

  return out.sort((a, b) => {
    const s = soldOutLast(a, b);
    if (s) return s;
    if (q.ordem === "menor-preco") return a.priceCents - b.priceCents;
    if (q.ordem === "maior-preco") return b.priceCents - a.priceCents;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

/** Opções de filtro disponíveis, com contagem, a partir do catálogo base. */
export function facetOptions(products: Product[]) {
  const count = <K extends string>(get: (p: Product) => K | null) => {
    const m: Partial<Record<K, number>> = {};
    for (const p of products) {
      const k = get(p);
      if (k) m[k] = (m[k] ?? 0) + 1;
    }
    return m;
  };
  return {
    jogo: count((p) => p.game),
    tipo: count((p) => p.type),
    idioma: count((p) => p.language),
    colecao: count((p) => p.collection),
    disp: count((p) => effectiveAvailability(p)),
  };
}
export type Facets = ReturnType<typeof facetOptions>;
