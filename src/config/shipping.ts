/**
 * Frete do checkout online: tabela fixa por região, usando o primeiro dígito do CEP.
 * Valores de partida — ajuste para o que a loja realmente cobra.
 *
 * Para integrar o Melhor Envio depois, implemente outro `ShippingProvider`
 * (cotação por CEP + peso/dimensões) e troque em `getShippingProvider()`.
 */

export type ShippingQuote = { region: string; label: string; cents: number; days: string };

export interface ShippingProvider {
  quote(cep: string, subtotalCents: number): Promise<ShippingQuote>;
}

type Region = { id: string; label: string; match: (cep: string) => boolean; cents: number; days: string };

const REGIONS: Region[] = [
  { id: "jf", label: "Juiz de Fora", match: (c) => /^360[0-4]/.test(c), cents: 1200, days: "1 a 2 dias úteis" },
  { id: "mg", label: "Minas Gerais", match: (c) => /^3[0-9]/.test(c), cents: 2200, days: "2 a 5 dias úteis" },
  { id: "sudeste", label: "SP, RJ e ES", match: (c) => /^[0-2]/.test(c), cents: 2800, days: "3 a 6 dias úteis" },
  { id: "sul", label: "Sul", match: (c) => /^[89]/.test(c), cents: 3400, days: "4 a 8 dias úteis" },
  { id: "centro-oeste", label: "Centro-Oeste", match: (c) => /^7/.test(c), cents: 3600, days: "4 a 8 dias úteis" },
  { id: "nordeste", label: "Nordeste", match: (c) => /^[45]/.test(c), cents: 4200, days: "5 a 10 dias úteis" },
  { id: "norte", label: "Norte", match: (c) => /^6/.test(c), cents: 4800, days: "6 a 12 dias úteis" },
];

export const fixedTableProvider: ShippingProvider = {
  async quote(cep) {
    const digits = cep.replace(/\D/g, "");
    const region = REGIONS.find((r) => r.match(digits)) ?? REGIONS[REGIONS.length - 1];
    return { region: region.id, label: region.label, cents: region.cents, days: region.days };
  },
};

export function getShippingProvider(): ShippingProvider {
  return fixedTableProvider;
}
