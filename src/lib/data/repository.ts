import type {
  NewOrder,
  Order,
  OrderChannel,
  OrderStatus,
  Product,
  ProductInput,
  StoreEvent,
  StoreEventInput,
} from "../types";

export type SaleLine = { productId: string; quantity: number; unitPriceCents?: number };

export class StockError extends Error {
  constructor(public productName: string, public available: number) {
    super(`Estoque insuficiente de "${productName}" (disponível: ${available})`);
  }
}

export interface Repository {
  readonly mode: "supabase" | "local";

  listProducts(opts?: { includeDrafts?: boolean }): Promise<Product[]>;
  getProductBySlug(slug: string, opts?: { includeDrafts?: boolean }): Promise<Product | null>;
  getProductById(id: string): Promise<Product | null>;
  getProductsByIds(ids: string[]): Promise<Product[]>;
  createProduct(input: ProductInput): Promise<Product>;
  updateProduct(id: string, input: Partial<ProductInput>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  /** Soma delta ao estoque (nunca abaixo de zero). Retorna o novo estoque. */
  adjustStock(id: string, delta: number, reason: string): Promise<number>;

  listEvents(opts?: { includeUnpublished?: boolean; upcomingOnly?: boolean }): Promise<StoreEvent[]>;
  getEvent(id: string): Promise<StoreEvent | null>;
  createEvent(input: StoreEventInput): Promise<StoreEvent>;
  updateEvent(id: string, input: Partial<StoreEventInput>): Promise<StoreEvent>;
  deleteEvent(id: string): Promise<void>;

  listOrders(opts?: { channel?: OrderChannel }): Promise<Order[]>;
  getOrder(id: string): Promise<Order | null>;
  createOrder(order: NewOrder): Promise<Order>;
  /** Marca como pago e baixa o estoque uma única vez (idempotente). */
  markOrderPaid(id: string, paymentId: string): Promise<Order | null>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<void>;
  /** Venda feita fora do site (WhatsApp/balcão): cria pedido pago e baixa estoque. */
  recordSale(input: {
    channel: Exclude<OrderChannel, "online">;
    lines: SaleLine[];
    customerName: string;
    notes: string | null;
  }): Promise<Order>;

  uploadImage(file: File): Promise<string>;
}
