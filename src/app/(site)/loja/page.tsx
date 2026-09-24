import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/catalog-view";

export const metadata: Metadata = {
  title: "Loja — cartas Pokémon, Lorcana, One Piece e acessórios",
  description:
    "Catálogo completo com estoque visível: booster avulso, blister, ETB, booster box, decks e acessórios. Filtre por jogo, idioma, coleção e preço.",
  alternates: { canonical: "/loja" },
};

export default function Page(props: PageProps<"/loja">) {
  return <CatalogView searchParams={props.searchParams} />;
}
