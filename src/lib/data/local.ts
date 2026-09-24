import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { NewOrder, Order, Product, StoreEvent } from "../types";
import { StockError, type Repository } from "./repository";
import { seedEvents, seedProducts } from "./seed";

/**
 * Modo local: usado quando o Supabase não está configurado. Guarda tudo em
 * .data/demo-db.json para que o site e o painel funcionem em desenvolvimento.
 * Não use em produção.
 */

type DB = { products: Product[]; events: StoreEvent[]; orders: Order[]; nextOrderNumber: number };

const DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DIR, "demo-db.json");

const g = globalThis as unknown as { __bcLocalDb?: Promise<DB> };

async function load(): Promise<DB> {
  g.__bcLocalDb ??= (async () => {
    try {
      return JSON.parse(await readFile(FILE, "utf8")) as DB;
    } catch {
      return { products: seedProducts(), events: seedEvents(), orders: [], nextOrderNumber: 1001 };
    }
  })();
  return g.__bcLocalDb;
}

async function persist(db: DB) {
  try {
    await mkdir(DIR, { recursive: true });
    await writeFile(FILE, JSON.stringify(db, null, 2));
  } catch {
    // ambiente sem disco gravável: segue só em memória
  }
}

const now = () => new Date().toISOString();
const clone = <T>(v: T): T => structuredClone(v);

function mustFind<T extends { id: string }>(list: T[], id: string): T {
  const item = list.find((x) => x.id === id);
  if (!item) throw new Error("Registro não encontrado");
  return item;
}

function applyStockDecrement(db: DB, lines: { productId: string; quantity: number }[]) {
  for (const line of lines) {
    const p = db.products.find((x) => x.id === line.productId);
    if (!p) continue;
    p.stock = Math.max(0, p.stock - line.quantity);
    p.updatedAt = now();
  }
}

export const localRepository: Repository = {
  mode: "local",

  async listProducts(opts) {
    const db = await load();
    return clone(db.products.filter((p) => opts?.includeDrafts || p.published));
  },
  async getProductBySlug(slug, opts) {
    const db = await load();
    const p = db.products.find((x) => x.slug === slug && (opts?.includeDrafts || x.published));
    return p ? clone(p) : null;
  },
  async getProductById(id) {
    const db = await load();
    const p = db.products.find((x) => x.id === id);
    return p ? clone(p) : null;
  },
  async getProductsByIds(ids) {
    const db = await load();
    return clone(db.products.filter((p) => ids.includes(p.id)));
  },
  async createProduct(input) {
    const db = await load();
    if (db.products.some((p) => p.slug === input.slug)) throw new Error("Já existe um produto com esse endereço (slug)");
    const p: Product = { ...input, id: randomUUID(), createdAt: now(), updatedAt: now() };
    db.products.push(p);
    await persist(db);
    return clone(p);
  },
  async updateProduct(id, input) {
    const db = await load();
    if (input.slug && db.products.some((p) => p.slug === input.slug && p.id !== id))
      throw new Error("Já existe um produto com esse endereço (slug)");
    const p = mustFind(db.products, id);
    Object.assign(p, input, { updatedAt: now() });
    await persist(db);
    return clone(p);
  },
  async deleteProduct(id) {
    const db = await load();
    db.products = db.products.filter((p) => p.id !== id);
    await persist(db);
  },
  async adjustStock(id, delta) {
    const db = await load();
    const p = mustFind(db.products, id);
    p.stock = Math.max(0, p.stock + delta);
    p.updatedAt = now();
    await persist(db);
    return p.stock;
  },

  async listEvents(opts) {
    const db = await load();
    const cutoff = Date.now() - 6 * 3600_000;
    return clone(
      db.events
        .filter((e) => opts?.includeUnpublished || e.published)
        .filter((e) => !opts?.upcomingOnly || new Date(e.startsAt).getTime() >= cutoff)
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    );
  },
  async getEvent(id) {
    const db = await load();
    const e = db.events.find((x) => x.id === id);
    return e ? clone(e) : null;
  },
  async createEvent(input) {
    const db = await load();
    const e: StoreEvent = { ...input, id: randomUUID() };
    db.events.push(e);
    await persist(db);
    return clone(e);
  },
  async updateEvent(id, input) {
    const db = await load();
    const e = mustFind(db.events, id);
    Object.assign(e, input);
    await persist(db);
    return clone(e);
  },
  async deleteEvent(id) {
    const db = await load();
    db.events = db.events.filter((e) => e.id !== id);
    await persist(db);
  },

  async listOrders(opts) {
    const db = await load();
    return clone(
      db.orders.filter((o) => !opts?.channel || o.channel === opts.channel).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  },
  async getOrder(id) {
    const db = await load();
    const o = db.orders.find((x) => x.id === id);
    return o ? clone(o) : null;
  },
  async createOrder(order: NewOrder) {
    const db = await load();
    const o: Order = { ...order, id: randomUUID(), number: db.nextOrderNumber++, createdAt: now(), paidAt: null, paymentId: null };
    db.orders.push(o);
    await persist(db);
    return clone(o);
  },
  async markOrderPaid(id, paymentId) {
    const db = await load();
    const o = db.orders.find((x) => x.id === id);
    if (!o) return null;
    if (o.paidAt) return clone(o);
    o.status = "pago";
    o.paidAt = now();
    o.paymentId = paymentId;
    applyStockDecrement(db, o.items);
    await persist(db);
    return clone(o);
  },
  async updateOrderStatus(id, status) {
    const db = await load();
    mustFind(db.orders, id).status = status;
    await persist(db);
  },
  async recordSale({ channel, lines, customerName, notes }) {
    const db = await load();
    const items = lines.map((l) => {
      const p = mustFind(db.products, l.productId);
      if (p.stock < l.quantity) throw new StockError(p.name, p.stock);
      return { productId: p.id, name: p.name, unitPriceCents: l.unitPriceCents ?? p.priceCents, quantity: l.quantity };
    });
    const subtotal = items.reduce((s, i) => s + i.unitPriceCents * i.quantity, 0);
    const o: Order = {
      id: randomUUID(),
      number: db.nextOrderNumber++,
      status: "entregue",
      channel,
      customerName: customerName || (channel === "balcao" ? "Balcão" : "WhatsApp"),
      customerEmail: null,
      customerPhone: null,
      cep: null,
      address: null,
      deliveryMethod: "retirada",
      shippingCents: 0,
      subtotalCents: subtotal,
      totalCents: subtotal,
      items,
      notes,
      paymentId: null,
      createdAt: now(),
      paidAt: now(),
    };
    applyStockDecrement(db, items);
    db.orders.push(o);
    await persist(db);
    return clone(o);
  },

  async uploadImage(file) {
    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const name = `${randomUUID()}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
    return `/uploads/${name}`;
  },
};
