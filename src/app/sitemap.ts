import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/store";
import { repo } from "@/lib/data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await repo.listProducts();
  const pages = ["", "/loja", "/pokemon", "/lorcana", "/one-piece", "/loja-fisica", "/como-comprar", "/faq", "/sobre"];
  return [
    ...pages.map((p) => ({
      url: `${SITE_URL}${p}`,
      changeFrequency: "daily" as const,
      priority: p === "" ? 1 : p === "/loja-fisica" ? 0.9 : 0.8,
    })),
    ...products.map((p) => ({
      url: `${SITE_URL}/produto/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
      images: p.images.slice(0, 1).map((src) => (src.startsWith("http") ? src : `${SITE_URL}${src}`)),
    })),
  ];
}
