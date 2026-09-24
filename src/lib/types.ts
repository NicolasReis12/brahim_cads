export const GAMES = ["pokemon", "lorcana", "one-piece"] as const;
export type Game = (typeof GAMES)[number];

export const PRODUCT_TYPES = [
  "booster",
  "blister-unitario",
  "blister-triplo",
  "blister-quadruplo",
  "booster-box",
  "etb",
  "box-colecao",
  "combo",
  "deck",
  "colecionavel",
  "acessorio",
] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const LANGUAGES = ["BR", "ING", "JAP", "CHN"] as const;
export type Language = (typeof LANGUAGES)[number];

/** Status configurado pelo admin. "esgotado" também é derivado quando o estoque zera. */
export const AVAILABILITIES = ["pronta-entrega", "pre-venda", "esgotado"] as const;
export type Availability = (typeof AVAILABILITIES)[number];

export type Product = {
  id: string;
  slug: string;
  name: string;
  game: Game | null;
  type: ProductType;
  language: Language | null;
  collection: string | null;
  priceCents: number;
  /** Ex.: "a unidade" — exibido ao lado do preço */
  unitLabel: string | null;
  packageContents: string | null;
  description: string;
  images: string[];
  stock: number;
  availability: Availability;
  /** Data ISO (yyyy-mm-dd) da previsão de chegada da pré-venda */
  preorderEta: string | null;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

export const ORDER_STATUSES = [
  "pendente",
  "pago",
  "enviado",
  "entregue",
  "cancelado",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_CHANNELS = ["online", "whatsapp", "balcao"] as const;
export type OrderChannel = (typeof ORDER_CHANNELS)[number];

export type DeliveryMethod = "envio" | "retirada";

export type OrderItem = {
  productId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
};

export type Order = {
  id: string;
  number: number;
  status: OrderStatus;
  channel: OrderChannel;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  cep: string | null;
  address: string | null;
  deliveryMethod: DeliveryMethod;
  shippingCents: number;
  subtotalCents: number;
  totalCents: number;
  items: OrderItem[];
  notes: string | null;
  paymentId: string | null;
  createdAt: string;
  paidAt: string | null;
};

export type NewOrder = Omit<Order, "id" | "number" | "createdAt" | "paidAt" | "paymentId">;

export const EVENT_KINDS = ["liga", "campeonato", "pre-release", "encontro"] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

export type StoreEvent = {
  id: string;
  title: string;
  kind: EventKind;
  game: Game | null;
  startsAt: string;
  description: string;
  entryFeeCents: number | null;
  published: boolean;
};

export type StoreEventInput = Omit<StoreEvent, "id">;
