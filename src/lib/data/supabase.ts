import "server-only";
import { randomUUID } from "node:crypto";
import { publicClient, serviceClient } from "../supabase/clients";
import type { NewOrder, Order, OrderItem, Product, ProductInput, StoreEvent, StoreEventInput } from "../types";
import { StockError, type Repository } from "./repository";

// Mapeamento snake_case (banco) <-> camelCase (app) ---------------------------------

type ProductRow = {
  id: string; slug: string; name: string; game: Product["game"]; type: Product["type"];
  language: Product["language"]; collection: string | null; price_cents: number; unit_label: string | null;
  package_contents: string | null; description: string; images: string[]; stock: number;
  availability: Product["availability"]; preorder_eta: string | null; featured: boolean; published: boolean;
  created_at: string; updated_at: string;
};

const toProduct = (r: ProductRow): Product => ({
  id: r.id, slug: r.slug, name: r.name, game: r.game, type: r.type, language: r.language,
  collection: r.collection, priceCents: r.price_cents, unitLabel: r.unit_label,
  packageContents: r.package_contents, description: r.description, images: r.images ?? [],
  stock: r.stock, availability: r.availability, preorderEta: r.preorder_eta, featured: r.featured,
  published: r.published, createdAt: r.created_at, updatedAt: r.updated_at,
});

function fromProduct(p: Partial<ProductInput>): Partial<ProductRow> {
  const map: Record<string, keyof ProductRow> = {
    slug: "slug", name: "name", game: "game", type: "type", language: "language", collection: "collection",
    priceCents: "price_cents", unitLabel: "unit_label", packageContents: "package_contents",
    description: "description", images: "images", stock: "stock", availability: "availability",
    preorderEta: "preorder_eta", featured: "featured", published: "published",
  };
  const row: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(p)) if (k in map && v !== undefined) row[map[k]] = v;
  return row as Partial<ProductRow>;
}

type EventRow = {
  id: string; title: string; kind: StoreEvent["kind"]; game: StoreEvent["game"]; starts_at: string;
  description: string; entry_fee_cents: number | null; published: boolean;
};

const toEvent = (r: EventRow): StoreEvent => ({
  id: r.id, title: r.title, kind: r.kind, game: r.game, startsAt: r.starts_at,
  description: r.description, entryFeeCents: r.entry_fee_cents, published: r.published,
});

function fromEvent(e: Partial<StoreEventInput>) {
  const row: Record<string, unknown> = {};
  if (e.title !== undefined) row.title = e.title;
  if (e.kind !== undefined) row.kind = e.kind;
  if (e.game !== undefined) row.game = e.game;
  if (e.startsAt !== undefined) row.starts_at = e.startsAt;
  if (e.description !== undefined) row.description = e.description;
  if (e.entryFeeCents !== undefined) row.entry_fee_cents = e.entryFeeCents;
  if (e.published !== undefined) row.published = e.published;
  return row;
}

type OrderRow = {
  id: string; number: number; status: Order["status"]; channel: Order["channel"]; customer_name: string;
  customer_email: string | null; customer_phone: string | null; cep: string | null; address: string | null;
  delivery_method: Order["deliveryMethod"]; shipping_cents: number; subtotal_cents: number; total_cents: number;
  notes: string | null; payment_id: string | null; created_at: string; paid_at: string | null;
  order_items: { product_id: string | null; name: string; unit_price_cents: number; quantity: number }[];
};

const toOrder = (r: OrderRow): Order => ({
  id: r.id, number: r.number, status: r.status, channel: r.channel, customerName: r.customer_name,
  customerEmail: r.customer_email, customerPhone: r.customer_phone, cep: r.cep, address: r.address,
  deliveryMethod: r.delivery_method, shippingCents: r.shipping_cents, subtotalCents: r.subtotal_cents,
  totalCents: r.total_cents, notes: r.notes, paymentId: r.payment_id, createdAt: r.created_at, paidAt: r.paid_at,
  items: (r.order_items ?? []).map((i) => ({
    productId: i.product_id ?? "", name: i.name, unitPriceCents: i.unit_price_cents, quantity: i.quantity,
  })),
});

const ORDER_SELECT = "*, order_items(product_id, name, unit_price_cents, quantity)";

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

// Leitura pública usa a chave publicável (RLS garante só publicados).
// Escrita e leitura de rascunhos usam a secret key — as server actions checam admin antes.

export const supabaseRepository: Repository = {
  mode: "supabase",

  async listProducts(opts) {
    const db = opts?.includeDrafts ? serviceClient() : publicClient();
    const rows = check(await db.from("products").select("*").order("created_at", { ascending: false }));
    return (rows as ProductRow[]).map(toProduct);
  },
  async getProductBySlug(slug, opts) {
    const db = opts?.includeDrafts ? serviceClient() : publicClient();
    const row = check(await db.from("products").select("*").eq("slug", slug).maybeSingle());
    return row ? toProduct(row as ProductRow) : null;
  },
  async getProductById(id) {
    const row = check(await serviceClient().from("products").select("*").eq("id", id).maybeSingle());
    return row ? toProduct(row as ProductRow) : null;
  },
  async getProductsByIds(ids) {
    if (!ids.length) return [];
    const rows = check(await serviceClient().from("products").select("*").in("id", ids));
    return (rows as ProductRow[]).map(toProduct);
  },
  async createProduct(input) {
    const row = check(await serviceClient().from("products").insert(fromProduct(input)).select("*").single());
    return toProduct(row as ProductRow);
  },
  async updateProduct(id, input) {
    const row = check(await serviceClient().from("products").update(fromProduct(input)).eq("id", id).select("*").single());
    return toProduct(row as ProductRow);
  },
  async deleteProduct(id) {
    check(await serviceClient().from("products").delete().eq("id", id));
  },
  async adjustStock(id, delta, reason) {
    const stock = check(
      await serviceClient().rpc("adjust_stock", { p_product_id: id, p_delta: delta, p_reason: reason }),
    );
    return stock as number;
  },

  async listEvents(opts) {
    const db = opts?.includeUnpublished ? serviceClient() : publicClient();
    let q = db.from("events").select("*").order("starts_at", { ascending: true });
    if (opts?.upcomingOnly) q = q.gte("starts_at", new Date(Date.now() - 6 * 3600_000).toISOString());
    return (check(await q) as EventRow[]).map(toEvent);
  },
  async getEvent(id) {
    const row = check(await serviceClient().from("events").select("*").eq("id", id).maybeSingle());
    return row ? toEvent(row as EventRow) : null;
  },
  async createEvent(input) {
    const row = check(await serviceClient().from("events").insert(fromEvent(input)).select("*").single());
    return toEvent(row as EventRow);
  },
  async updateEvent(id, input) {
    const row = check(await serviceClient().from("events").update(fromEvent(input)).eq("id", id).select("*").single());
    return toEvent(row as EventRow);
  },
  async deleteEvent(id) {
    check(await serviceClient().from("events").delete().eq("id", id));
  },

  async listOrders(opts) {
    let q = serviceClient().from("orders").select(ORDER_SELECT).order("created_at", { ascending: false }).limit(200);
    if (opts?.channel) q = q.eq("channel", opts.channel);
    return (check(await q) as OrderRow[]).map(toOrder);
  },
  async getOrder(id) {
    const row = check(await serviceClient().from("orders").select(ORDER_SELECT).eq("id", id).maybeSingle());
    return row ? toOrder(row as OrderRow) : null;
  },
  async createOrder(order: NewOrder) {
    const db = serviceClient();
    const row = check(
      await db
        .from("orders")
        .insert({
          status: order.status, channel: order.channel, customer_name: order.customerName,
          customer_email: order.customerEmail, customer_phone: order.customerPhone, cep: order.cep,
          address: order.address, delivery_method: order.deliveryMethod, shipping_cents: order.shippingCents,
          subtotal_cents: order.subtotalCents, total_cents: order.totalCents, notes: order.notes,
        })
        .select("id")
        .single(),
    ) as { id: string };
    check(
      await db.from("order_items").insert(
        order.items.map((i: OrderItem) => ({
          order_id: row.id, product_id: i.productId, name: i.name,
          unit_price_cents: i.unitPriceCents, quantity: i.quantity,
        })),
      ),
    );
    return (await this.getOrder(row.id))!;
  },
  async markOrderPaid(id, paymentId) {
    check(await serviceClient().rpc("mark_order_paid", { p_order_id: id, p_payment_id: paymentId }));
    return this.getOrder(id);
  },
  async updateOrderStatus(id, status) {
    check(await serviceClient().from("orders").update({ status }).eq("id", id));
  },
  async recordSale({ channel, lines, customerName, notes }) {
    const res = await serviceClient().rpc("record_sale", {
      p_channel: channel,
      p_customer: customerName,
      p_notes: notes,
      p_lines: lines.map((l) => ({ product_id: l.productId, quantity: l.quantity, unit_price_cents: l.unitPriceCents ?? null })),
    });
    if (res.error) {
      const m = /Estoque insuficiente de "(.+)" \(disponível: (\d+)\)/.exec(res.error.message);
      if (m) throw new StockError(m[1], Number(m[2]));
      throw new Error(res.error.message);
    }
    return (await this.getOrder(res.data as string))!;
  },

  async uploadImage(file) {
    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${new Date().getFullYear()}/${randomUUID()}.${ext}`;
    const db = serviceClient();
    check(await db.storage.from("product-images").upload(path, file, { contentType: file.type, upsert: false }));
    return db.storage.from("product-images").getPublicUrl(path).data.publicUrl;
  },
};
