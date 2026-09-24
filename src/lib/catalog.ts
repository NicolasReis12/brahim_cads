import type { Availability, EventKind, Game, Language, Product, ProductType } from "./types";

export const GAME_INFO: Record<Game, { label: string; short: string; path: string; blurb: string }> = {
  pokemon: {
    label: "Pokémon TCG",
    short: "Pokémon",
    path: "/pokemon",
    blurb:
      "Booster avulso, blister, ETB, booster box e baralho de liga. Coleções nacionais da Copag e importados em inglês, japonês e chinês.",
  },
  lorcana: {
    label: "Disney Lorcana",
    short: "Lorcana",
    path: "/lorcana",
    blurb: "Boosters, caixas e decks iniciais de Lorcana, em inglês. Pré-venda aberta a cada lançamento.",
  },
  "one-piece": {
    label: "One Piece Card Game",
    short: "One Piece",
    path: "/one-piece",
    blurb: "Boosters, decks e caixas de One Piece Card Game. Chegando aos poucos — pergunta no WhatsApp o que tem.",
  },
};

export const TYPE_LABEL: Record<ProductType, string> = {
  booster: "Booster avulso",
  "blister-unitario": "Blister unitário",
  "blister-triplo": "Blister triplo",
  "blister-quadruplo": "Blister quádruplo",
  "booster-box": "Booster Box",
  etb: "ETB",
  "box-colecao": "Box Coleção",
  combo: "Combo",
  deck: "Baralho / Deck",
  colecionavel: "Colecionável",
  acessorio: "Acessório",
};

export const LANGUAGE_LABEL: Record<Language, string> = {
  BR: "Português",
  ING: "Inglês",
  JAP: "Japonês",
  CHN: "Chinês",
};

export const EVENT_KIND_LABEL: Record<EventKind, string> = {
  liga: "Liga",
  campeonato: "Campeonato",
  "pre-release": "Pré-release",
  encontro: "Encontro / trocas",
};

export const LOW_STOCK_THRESHOLD = 3;

export type StockState =
  | { kind: "pronta-entrega"; stock: number; low: boolean }
  | { kind: "pre-venda"; stock: number; eta: string | null }
  | { kind: "esgotado" };

/** Status real exibido: pronta entrega com estoque zerado vira esgotado. */
export function stockState(p: Pick<Product, "availability" | "stock" | "preorderEta">): StockState {
  if (p.availability === "esgotado" || p.stock <= 0) return { kind: "esgotado" };
  if (p.availability === "pre-venda") return { kind: "pre-venda", stock: p.stock, eta: p.preorderEta };
  return { kind: "pronta-entrega", stock: p.stock, low: p.stock <= LOW_STOCK_THRESHOLD };
}

export function effectiveAvailability(p: Pick<Product, "availability" | "stock" | "preorderEta">): Availability {
  return stockState(p).kind;
}

export function stockLabel(s: StockState): string {
  switch (s.kind) {
    case "esgotado":
      return "Esgotado";
    case "pre-venda":
      return s.eta ? `Pré-venda · chega ${formatEta(s.eta)}` : "Pré-venda";
    case "pronta-entrega":
      if (s.low) return s.stock === 1 ? "Última unidade" : `Últimas ${s.stock} unidades`;
      return `${s.stock} em estoque`;
  }
}

export function formatEta(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");
}

/** Linha de metadados em mono, estilo rodapé de carta: "ING · Escuridão Absoluta · 4 em estoque" */
export function metaLine(p: Product): string[] {
  return [p.language, p.collection, stockLabel(stockState(p))].filter(Boolean) as string[];
}

export function isPurchasable(p: Pick<Product, "availability" | "stock" | "preorderEta">): boolean {
  return stockState(p).kind !== "esgotado";
}
