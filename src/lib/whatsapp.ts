import { whatsappLink } from "@/config/store";
import { formatBRL, formatCep } from "./format";
import type { DeliveryMethod, Language, Product } from "./types";

export type MessageLine = { name: string; language: Language | null; priceCents: number; qty: number };

function lineName(l: Pick<MessageLine, "name" | "language">) {
  return l.language && l.language !== "BR" ? `(${l.language}) ${l.name}` : l.name;
}

export function orderMessage(input: {
  lines: MessageLine[];
  name: string;
  delivery: DeliveryMethod;
  cep: string;
}): string {
  const subtotal = input.lines.reduce((s, l) => s + l.priceCents * l.qty, 0);
  const items = input.lines.map(
    (l) => `${l.qty}x ${lineName(l)} (${formatBRL(l.priceCents)}${l.qty > 1 ? " cada" : ""})`,
  );
  const delivery =
    input.delivery === "retirada" ? "retirada na loja em Juiz de Fora" : `envio para CEP ${formatCep(input.cep)}`;
  return [
    "Olá! Quero fazer este pedido pelo site:",
    ...items,
    `Subtotal: ${formatBRL(subtotal)}`,
    `Entrega: ${delivery}`,
    `Nome: ${input.name.trim()}`,
  ].join("\n");
}

export function orderWhatsappUrl(input: Parameters<typeof orderMessage>[0]) {
  return whatsappLink(orderMessage(input));
}

export function notifyMeUrl(p: Pick<Product, "name" | "language">) {
  return whatsappLink(`Oi! Quero ser avisado quando chegar: ${lineName(p)}. Me chama quando tiver?`);
}

export function productQuestionUrl(p: Pick<Product, "name" | "language">) {
  return whatsappLink(`Oi! Tenho uma dúvida sobre ${lineName(p)}:`);
}

export function generalWhatsappUrl(text = "Oi! Vim pelo site da Brahim Cards.") {
  return whatsappLink(text);
}
