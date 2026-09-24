import { SITE_URL, STORE, instagramUrl } from "@/config/store";
import { stockState } from "./catalog";
import type { Product, StoreEvent } from "./types";

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Store", "LocalBusiness"],
    "@id": `${SITE_URL}/#loja`,
    name: STORE.name,
    description: "Loja de card games em Juiz de Fora: Pokémon TCG, Disney Lorcana e One Piece Card Game. Ligas, trocas e campeonatos.",
    url: SITE_URL,
    image: `${SITE_URL}/loja/wa-12.jpg`,
    logo: `${SITE_URL}/brand/logo-256.png`,
    telephone: `+${STORE.whatsapp}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: STORE.address.street,
      addressLocality: STORE.address.city,
      addressRegion: STORE.address.state,
      postalCode: STORE.address.cep,
      addressCountry: STORE.address.country,
    },
    areaServed: "BR",
    paymentAccepted: "Pix, Cartão de crédito, Transferência bancária, Dinheiro",
    currenciesAccepted: "BRL",
    sameAs: [instagramUrl],
    ...(STORE.hours.length && {
      openingHoursSpecification: STORE.hours.map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.schema,
        opens: h.opens,
        closes: h.closes,
      })),
    }),
  };
}

export function productJsonLd(p: Product) {
  const s = stockState(p);
  const availability =
    s.kind === "esgotado"
      ? "https://schema.org/OutOfStock"
      : s.kind === "pre-venda"
        ? "https://schema.org/PreOrder"
        : "https://schema.org/InStock";
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    sku: p.id,
    image: p.images.map((src) => (src.startsWith("http") ? src : `${SITE_URL}${src}`)),
    category: p.type,
    ...(p.collection && { additionalProperty: [{ "@type": "PropertyValue", name: "Coleção", value: p.collection }] }),
    ...(p.language && { inLanguage: p.language }),
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/produto/${p.slug}`,
      priceCurrency: "BRL",
      price: (p.priceCents / 100).toFixed(2),
      availability,
      itemCondition: "https://schema.org/NewCondition",
      ...(s.kind === "pre-venda" && s.eta && { availabilityStarts: s.eta }),
      seller: { "@id": `${SITE_URL}/#loja` },
    },
  };
}

export function eventJsonLd(e: StoreEvent) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.title,
    startDate: e.startsAt,
    description: e.description,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: { "@id": `${SITE_URL}/#loja` },
    organizer: { "@id": `${SITE_URL}/#loja` },
    ...(e.entryFeeCents !== null && {
      offers: { "@type": "Offer", price: (e.entryFeeCents / 100).toFixed(2), priceCurrency: "BRL" },
    }),
  };
}

export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
