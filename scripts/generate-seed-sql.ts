/**
 * Gera supabase/seed.sql a partir de src/lib/data/seed.ts (mesma fonte do modo local).
 * Uso: node --experimental-strip-types scripts/generate-seed-sql.ts
 */
import { writeFileSync } from "node:fs";
import { seedEvents, seedProducts } from "../src/lib/data/seed.ts";

const q = (v: unknown): string => {
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean" || typeof v === "number") return String(v);
  if (Array.isArray(v)) return `array[${v.map(q).join(", ")}]::text[]`;
  return `'${String(v).replace(/'/g, "''")}'`;
};

const products = seedProducts().map((p) =>
  `(${[p.slug, p.name, p.game, p.type, p.language, p.collection, p.priceCents, p.unitLabel, p.packageContents, p.description, p.images, p.stock, p.availability, p.preorderEta, p.featured, p.published, p.createdAt].map(q).join(", ")})`,
);
const events = seedEvents().map((e) =>
  `(${[e.title, e.kind, e.game, e.startsAt, e.description, e.entryFeeCents, e.published].map(q).join(", ")})`,
);

const sql = `-- Gerado por scripts/generate-seed-sql.ts — não edite à mão.
-- As fotos apontam para /produtos/*.png (pasta public). Ao trocar por fotos novas pelo painel, elas vão pro Storage.

insert into products (slug, name, game, type, language, collection, price_cents, unit_label, package_contents, description, images, stock, availability, preorder_eta, featured, published, created_at) values
${products.join(",\n")}
on conflict (slug) do nothing;

-- Eventos de exemplo: ajuste ou apague pelo painel.
insert into events (title, kind, game, starts_at, description, entry_fee_cents, published) values
${events.join(",\n")};
`;
writeFileSync("supabase/seed.sql", sql);
console.log(`seed.sql: ${products.length} produtos, ${events.length} eventos`);
