import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/catalog-view";
import { GAME_INFO } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Pokémon TCG em Juiz de Fora — boosters, ETB e booster box",
  description: GAME_INFO["pokemon"].blurb + " Loja física em Juiz de Fora - MG e envio pra todo o Brasil.",
  alternates: { canonical: "/pokemon" },
};

export default function Page(props: PageProps<"/pokemon">) {
  return <CatalogView searchParams={props.searchParams} game="pokemon" />;
}
