export const STORE = {
  name: "Brahim Cards",
  owner: "Guilherme Brahim",
  since: 2024,
  whatsapp: "5532999716834",
  whatsappDisplay: "(32) 99971-6834",
  instagram: "brahimcardsjf",
  address: {
    street: "Av. Barão do Rio Branco, 4617",
    district: "Alto dos Passos",
    city: "Juiz de Fora",
    state: "MG",
    cep: "36026-500",
    country: "BR",
  },
  /**
   * Horário do balcão. Preencha com o horário real — enquanto estiver vazio o site
   * mostra "Confirme o horário pelo WhatsApp" em vez de inventar um.
   * Formato: { days: "Seg a Sex", hours: "10h às 19h", schema: ["Mo","Tu","We","Th","Fr"], opens: "10:00", closes: "19:00" }
   */
  hours: [] as { days: string; hours: string; schema: string[]; opens: string; closes: string }[],
  mapsQuery: "Av. Barão do Rio Branco, 4617, Alto dos Passos, Juiz de Fora - MG",
} as const;

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export function whatsappLink(message: string): string {
  return `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const instagramUrl = `https://instagram.com/${STORE.instagram}`;
