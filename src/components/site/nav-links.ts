import type { Game } from "@/lib/types";

export const NAV: { href: string; label: string; game?: Game }[] = [
  { href: "/loja", label: "Loja" },
  { href: "/pokemon", label: "Pokémon", game: "pokemon" },
  { href: "/lorcana", label: "Lorcana", game: "lorcana" },
  { href: "/one-piece", label: "One Piece", game: "one-piece" },
  { href: "/loja-fisica", label: "Loja física e eventos" },
];

export const SECONDARY_NAV = [
  { href: "/como-comprar", label: "Como comprar" },
  { href: "/faq", label: "Perguntas frequentes" },
  { href: "/sobre", label: "Sobre" },
];
