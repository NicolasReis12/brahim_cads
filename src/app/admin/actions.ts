"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, signIn, signOut } from "@/lib/auth";
import { StockError, repo } from "@/lib/data";
import { slugify } from "@/lib/format";
import {
  AVAILABILITIES,
  EVENT_KINDS,
  GAMES,
  LANGUAGES,
  ORDER_STATUSES,
  PRODUCT_TYPES,
  type OrderStatus,
} from "@/lib/types";

export type ActionState = { error?: string; fieldErrors?: Record<string, string>; ok?: boolean; message?: string } | null;

function refreshStorefront() {
  revalidatePath("/", "layout");
}

// Login -------------------------------------------------------------------------------

export async function loginAction(_: ActionState, form: FormData): Promise<ActionState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!password) return { error: "Informe a senha." };
  const error = await signIn(email, password);
  if (error) return { error };
  redirect("/admin");
}

export async function logoutAction() {
  await signOut();
  redirect("/admin/login");
}

// Produtos ----------------------------------------------------------------------------

const nullableEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess((v) => (v === "" || v === null ? null : v), z.enum(values).nullable());

const productSchema = z.object({
  name: z.string().trim().min(3, "Nome muito curto").max(160),
  slug: z.string().trim().max(160).optional(),
  game: nullableEnum(GAMES),
  type: z.enum(PRODUCT_TYPES),
  language: nullableEnum(LANGUAGES),
  collection: z.string().trim().max(80).transform((v) => v || null),
  price: z.string().regex(/^\d{1,6}([.,]\d{1,2})?$/, "Preço tipo 52,00"),
  unitLabel: z.string().trim().max(30).transform((v) => v || null),
  packageContents: z.string().trim().max(200).transform((v) => v || null),
  description: z.string().trim().max(4000),
  stock: z.coerce.number().int("Estoque inteiro").min(0, "Estoque não pode ser negativo").max(99999),
  availability: z.enum(AVAILABILITIES),
  preorderEta: z.preprocess((v) => (v === "" ? null : v), z.iso.date().nullable()),
  featured: z.boolean(),
  published: z.boolean(),
  images: z.array(z.string().min(1)).max(12),
});

export async function saveProductAction(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  const parsed = productSchema.safeParse({
    name: form.get("name"),
    slug: form.get("slug") ?? undefined,
    game: form.get("game"),
    type: form.get("type"),
    language: form.get("language"),
    collection: form.get("collection") ?? "",
    price: String(form.get("price") ?? "").trim(),
    unitLabel: form.get("unitLabel") ?? "",
    packageContents: form.get("packageContents") ?? "",
    description: form.get("description") ?? "",
    stock: form.get("stock"),
    availability: form.get("availability"),
    preorderEta: form.get("preorderEta") ?? "",
    featured: form.get("featured") === "on",
    published: form.get("published") === "on",
    images: form.getAll("images").map(String),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { error: "Confere os campos destacados.", fieldErrors };
  }

  const { price, slug, ...rest } = parsed.data;
  const input = {
    ...rest,
    slug: slugify(slug || rest.name) + (rest.language && rest.language !== "BR" && !slug ? `-${rest.language.toLowerCase()}` : ""),
    priceCents: Math.round(Number(price.replace(",", ".")) * 100),
  };

  let savedId: string;
  try {
    savedId = (id ? await repo.updateProduct(id, input) : await repo.createProduct(input)).id;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (/duplicate key|slug/i.test(msg)) return { error: "Já existe um produto com esse endereço (slug).", fieldErrors: { slug: "Já em uso" } };
    return { error: msg || "Não foi possível salvar." };
  }
  refreshStorefront();
  if (!id) redirect(`/admin/produtos/${savedId}?salvo=1`);
  return { ok: true, message: "Produto salvo." };
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  await repo.deleteProduct(id);
  refreshStorefront();
  redirect("/admin");
}

export async function adjustStockAction(id: string, delta: number): Promise<number> {
  await requireAdmin();
  if (!Number.isInteger(delta) || Math.abs(delta) > 1000) throw new Error("Ajuste inválido");
  const stock = await repo.adjustStock(id, delta, "ajuste_manual");
  refreshStorefront();
  return stock;
}

export async function uploadImagesAction(form: FormData): Promise<{ urls: string[]; error?: string }> {
  await requireAdmin();
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const urls: string[] = [];
  for (const file of files.slice(0, 8)) {
    if (!file.type.startsWith("image/")) return { urls, error: `${file.name} não é imagem` };
    if (file.size > 8 * 1024 * 1024) return { urls, error: `${file.name} passa de 8 MB` };
    urls.push(await repo.uploadImage(file));
  }
  return { urls };
}

// Vendas fora do site -------------------------------------------------------------------

const saleSchema = z.object({
  channel: z.enum(["whatsapp", "balcao"]),
  customerName: z.string().trim().max(120),
  notes: z.string().trim().max(500),
  lines: z
    .array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(999), unitPriceCents: z.number().int().min(0).optional() }))
    .min(1, "Adicione pelo menos um produto"),
});

export async function recordSaleAction(input: z.input<typeof saleSchema>): Promise<ActionState> {
  await requireAdmin();
  const parsed = saleSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  try {
    const order = await repo.recordSale({ ...parsed.data, notes: parsed.data.notes || null });
    refreshStorefront();
    revalidatePath("/admin", "layout");
    return { ok: true, message: `Venda #${order.number} registrada. Estoque atualizado.` };
  } catch (err) {
    if (err instanceof StockError) return { error: err.message };
    return { error: err instanceof Error ? err.message : "Não foi possível registrar." };
  }
}

// Pedidos -------------------------------------------------------------------------------

export async function updateOrderStatusAction(id: string, status: OrderStatus) {
  await requireAdmin();
  if (!ORDER_STATUSES.includes(status)) throw new Error("Status inválido");
  await repo.updateOrderStatus(id, status);
  revalidatePath("/admin/pedidos");
}

// Eventos -------------------------------------------------------------------------------

const eventSchema = z.object({
  title: z.string().trim().min(3, "Título muito curto").max(120),
  kind: z.enum(EVENT_KINDS),
  game: nullableEnum(GAMES),
  date: z.iso.date("Data inválida"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
  description: z.string().trim().max(1000),
  fee: z.string().trim().regex(/^(\d{1,5}([.,]\d{1,2})?)?$/, "Valor tipo 30,00"),
  published: z.boolean(),
});

export async function saveEventAction(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  const parsed = eventSchema.safeParse({
    title: form.get("title"),
    kind: form.get("kind"),
    game: form.get("game"),
    date: form.get("date"),
    time: form.get("time"),
    description: form.get("description") ?? "",
    fee: form.get("fee") ?? "",
    published: form.get("published") === "on",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { error: "Confere os campos.", fieldErrors };
  }
  const d = parsed.data;
  const input = {
    title: d.title,
    kind: d.kind,
    game: d.game,
    startsAt: `${d.date}T${d.time}:00-03:00`,
    description: d.description,
    entryFeeCents: d.fee ? Math.round(Number(d.fee.replace(",", ".")) * 100) : null,
    published: d.published,
  };
  if (id) await repo.updateEvent(id, input);
  else await repo.createEvent(input);
  refreshStorefront();
  redirect("/admin/eventos");
}

export async function deleteEventAction(id: string) {
  await requireAdmin();
  await repo.deleteEvent(id);
  refreshStorefront();
  redirect("/admin/eventos");
}
