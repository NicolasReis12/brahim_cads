import type { Product, StoreEvent } from "../types";

type SeedProduct = Omit<Product, "id" | "createdAt" | "updatedAt" | "featured" | "published" | "unitLabel" | "preorderEta" | "images"> &
  Partial<Pick<Product, "featured" | "published" | "unitLabel" | "preorderEta">> & { image: string | null; extraImages?: string[]; created: string };

/**
 * Catálogo inicial (produtos e preços do site atual). Os estoques variam de propósito
 * para mostrar todos os estados: normal, últimas unidades, pré-venda e esgotado.
 * Os 3 de One Piece são exemplos em rascunho (published: false).
 */
const SEED: SeedProduct[] = [
  {
    slug: "booster-avulso-fogo-fantasmagorico",
    name: "Booster Avulso Fogo Fantasmagórico",
    game: "pokemon", type: "booster", language: "BR", collection: "Fogo Fantasmagórico",
    priceCents: 1500, stock: 48, availability: "pronta-entrega",
    packageContents: "1 booster lacrado",
    description: "Booster avulso da coleção Fogo Fantasmagórico, edição nacional da Copag. Bom pra abrir na hora ou completar o fichário.",
    image: "/produtos/booster-fogo-fantasmagorico.png", created: "2026-09-18T10:00:00Z", featured: true,
  },
  {
    slug: "blister-quadruplo-escuridao-absoluta",
    name: "Blister Quádruplo - Escuridão Absoluta",
    game: "pokemon", type: "blister-quadruplo", language: "BR", collection: "Escuridão Absoluta",
    priceCents: 5200, stock: 2, availability: "pronta-entrega",
    packageContents: "4 boosters + 1 carta promocional (25 cartas)",
    description: "Blister com 4 boosters de Megaevolução — Escuridão Absoluta e uma carta promocional à mostra na frente da embalagem.",
    image: "/produtos/blister-quad-escuridao.png", extraImages: ["/produtos/escuridao-triple.png"], created: "2026-09-15T10:00:00Z", featured: true,
  },
  {
    slug: "combo-de-pacotes-escuridao-absoluta-ing",
    name: "Combo de Pacotes - Escuridão Absoluta",
    game: "pokemon", type: "combo", language: "ING", collection: "Escuridão Absoluta",
    priceCents: 23900, stock: 5, availability: "pronta-entrega",
    packageContents: "Booster Bundle com 6 boosters",
    description: "Combo de pacotes da versão em inglês (Pitch Black). Chama no WhatsApp se quiser saber a composição exata antes de fechar.",
    image: "/produtos/combo-escuridao-ing.png", created: "2026-09-12T10:00:00Z",
  },
  {
    slug: "etb-colecao-treinador-avancado-caos-ascendente",
    name: "ETB Coleção Treinador Avançado - Caos Ascendente",
    game: "pokemon", type: "etb", language: "BR", collection: "Caos Ascendente",
    priceCents: 31900, stock: 0, availability: "pronta-entrega",
    packageContents: "Boosters, sleeves, dados, marcadores e caixa organizadora",
    description: "A Elite Trainer Box nacional de Caos Ascendente. Vem com boosters e tudo que precisa pra montar e organizar o deck.",
    image: "/produtos/etb-caos-ascendente.png", created: "2026-08-20T10:00:00Z",
  },
  {
    slug: "booster-box-fogo-fantasmagorico",
    name: "Booster Box - Fogo Fantasmagórico",
    game: "pokemon", type: "booster-box", language: "BR", collection: "Fogo Fantasmagórico",
    priceCents: 45900, stock: 3, availability: "pronta-entrega",
    packageContents: "36 boosters",
    description: "Caixa fechada de Fogo Fantasmagórico, lacrada de fábrica. Pra quem quer abrir em quantidade ou guardar lacrada.",
    image: "/produtos/bb-fogo-fantasmagorico.png", created: "2026-09-18T09:00:00Z", featured: true,
  },
  {
    slug: "box-colecao-mega-charizard-x-ex",
    name: "Box Coleção - Mega Charizard X ex",
    game: "pokemon", type: "box-colecao", language: "BR", collection: "Megaevolução",
    priceCents: 39900, stock: 6, availability: "pronta-entrega",
    packageContents: "Carta promocional Mega Charizard X ex, boosters e acessórios",
    description: "Box de coleção com a carta promocional do Mega Charizard X ex. Presente certo pra fã de Charizard.",
    image: "/produtos/box-mega-charizard.png", created: "2026-08-28T10:00:00Z", featured: true,
  },
  {
    slug: "caixa-de-booster-mega-dream-ex-jap",
    name: "Caixa de Booster Mega Dream ex",
    game: "pokemon", type: "booster-box", language: "JAP", collection: "Mega Dream ex",
    priceCents: 89900, stock: 8, availability: "pre-venda", preorderEta: "2026-10-30",
    packageContents: "Caixa japonesa lacrada",
    description: "Caixa japonesa de Mega Dream ex, em pré-venda. Reserva com sinal pelo WhatsApp ou pagamento total pelo site.",
    image: "/produtos/mega-dream-jap.png", created: "2026-09-20T10:00:00Z", featured: true,
  },
  {
    slug: "baralho-batalha-de-liga-dragapult-ex",
    name: "Baralho Batalha de Liga - Dragapult ex",
    game: "pokemon", type: "deck", language: "BR", collection: "Batalha de Liga",
    priceCents: 15900, stock: 4, availability: "pronta-entrega",
    packageContents: "Deck de 60 cartas pronto pra jogar + acessórios",
    description: "Deck competitivo pronto do Dragapult ex. Dá pra levar direto pra liga da loja.",
    image: "/produtos/baralho-dragapult.png", created: "2026-09-02T10:00:00Z",
  },
  {
    slug: "deck-inicial-fabled-esmeralda-e-rubi",
    name: "Deck Inicial Fabled - Esmeralda e Rubi",
    game: "lorcana", type: "deck", language: "ING", collection: "Fabled",
    priceCents: 34900, stock: 1, availability: "pronta-entrega",
    packageContents: "Deck inicial de 60 cartas",
    description: "Deck inicial Esmeralda e Rubi da coleção Fabled. Bom ponto de partida pra entrar em Lorcana.",
    image: "/produtos/deck-fabled.png", extraImages: ["/produtos/deck-fabled-2.png"], created: "2026-08-25T10:00:00Z",
  },
  {
    slug: "booster-avulso-archazias-island",
    name: "Booster Avulso Archazia's Island",
    game: "lorcana", type: "booster", language: "ING", collection: "Archazia's Island",
    priceCents: 2990, stock: 24, availability: "pronta-entrega",
    packageContents: "1 booster de 12 cartas",
    description: "Booster avulso de Archazia's Island, em inglês.",
    image: "/produtos/lorcana-booster.png", created: "2026-09-10T10:00:00Z",
  },
  {
    slug: "caixa-de-booster-archazias-island",
    name: "Caixa de Booster Archazia's Island",
    game: "lorcana", type: "booster-box", language: "ING", collection: "Archazia's Island",
    priceCents: 80000, stock: 4, availability: "pre-venda", preorderEta: "2026-10-17",
    packageContents: "24 boosters de 12 cartas",
    description: "Caixa fechada de Archazia's Island em pré-venda. Garante a sua antes de chegar.",
    image: "/produtos/lorcana-bb.png", created: "2026-09-19T10:00:00Z",
  },
  {
    slug: "sleeve-100-unidades",
    name: "Sleeve (100 un.)",
    game: null, type: "acessorio", language: null, collection: null,
    priceCents: 1600, stock: 60, availability: "pronta-entrega",
    packageContents: "Pacote com 100 sleeves tamanho padrão",
    description: "Sleeve tamanho padrão (serve em Pokémon, Lorcana e One Piece). Protege o deck do dia a dia.",
    image: "/produtos/sleeve.png", created: "2026-07-10T10:00:00Z",
  },
  {
    slug: "toploader-semi-rigido",
    name: "Toploader Semi Rígido",
    game: null, type: "acessorio", language: null, collection: null,
    priceCents: 350, unitLabel: "a unidade", stock: 200, availability: "pronta-entrega",
    packageContents: "1 toploader semi rígido",
    description: "Toploader pra guardar carta boa ou mandar pra graduação. Vendido por unidade — coloca a quantidade no carrinho.",
    image: null, created: "2026-07-10T09:00:00Z",
  },
  {
    slug: "playmat-viper-3mm-61x35",
    name: "Playmat Viper 3mm 61x35cm",
    game: null, type: "acessorio", language: null, collection: null,
    priceCents: 9900, stock: 0, availability: "esgotado",
    packageContents: "Playmat de borracha 3mm, 61x35cm",
    description: "Playmat de 3mm com base emborrachada, tamanho padrão de torneio.",
    image: null, created: "2026-07-01T10:00:00Z",
  },
  {
    slug: "booster-avulso-one-piece-exemplo",
    name: "Booster Avulso One Piece (exemplo)",
    game: "one-piece", type: "booster", language: "ING", collection: "Coleção a definir",
    priceCents: 3500, stock: 20, availability: "pronta-entrega", published: false,
    packageContents: "1 booster de 12 cartas",
    description: "Produto de exemplo em rascunho. Edite nome, coleção, preço e foto antes de publicar.",
    image: null, created: "2026-09-21T10:00:00Z",
  },
  {
    slug: "booster-box-one-piece-exemplo",
    name: "Booster Box One Piece (exemplo)",
    game: "one-piece", type: "booster-box", language: "JAP", collection: "Coleção a definir",
    priceCents: 75000, stock: 3, availability: "pre-venda", preorderEta: "2026-11-14", published: false,
    packageContents: "24 boosters",
    description: "Produto de exemplo em rascunho. Edite nome, coleção, preço e foto antes de publicar.",
    image: null, created: "2026-09-21T09:00:00Z",
  },
  {
    slug: "starter-deck-one-piece-exemplo",
    name: "Starter Deck One Piece (exemplo)",
    game: "one-piece", type: "deck", language: "ING", collection: "Coleção a definir",
    priceCents: 12900, stock: 0, availability: "esgotado", published: false,
    packageContents: "Deck de 51 cartas (50 + líder)",
    description: "Produto de exemplo em rascunho. Edite nome, coleção, preço e foto antes de publicar.",
    image: null, created: "2026-09-21T08:00:00Z",
  },
];

export function seedProducts(): Product[] {
  return SEED.map((s, i) => {
    const { image, extraImages, created, ...rest } = s;
    return {
      id: `seed-${String(i + 1).padStart(2, "0")}`,
      unitLabel: null,
      preorderEta: null,
      featured: false,
      published: true,
      ...rest,
      images: [image, ...(extraImages ?? [])].filter(Boolean) as string[],
      createdAt: created,
      updatedAt: created,
    };
  });
}

/** Eventos de exemplo — troque pela agenda real no painel. */
export function seedEvents(): StoreEvent[] {
  return [
    {
      id: "seed-ev-1", title: "Liga Pokémon TCG", kind: "liga", game: "pokemon",
      startsAt: "2026-09-26T14:00:00-03:00", entryFeeCents: null, published: true,
      description: "Liga semanal no formato Padrão. Traz o deck; tem mesa pra quem quiser só treinar.",
    },
    {
      id: "seed-ev-2", title: "Liga Lorcana", kind: "liga", game: "lorcana",
      startsAt: "2026-10-01T19:00:00-03:00", entryFeeCents: null, published: true,
      description: "Partidas casuais e ranqueadas de Lorcana. Iniciante é bem-vindo, a gente empresta deck.",
    },
    {
      id: "seed-ev-3", title: "Campeonato Pokémon — Escuridão Absoluta", kind: "campeonato", game: "pokemon",
      startsAt: "2026-10-11T13:00:00-03:00", entryFeeCents: 3000, published: true,
      description: "Torneio suíço com premiação em boosters. Inscrição na loja ou pelo WhatsApp.",
    },
  ];
}
