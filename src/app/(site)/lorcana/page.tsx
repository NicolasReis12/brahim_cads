import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/catalog-view";
import { GAME_INFO } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Disney Lorcana em Juiz de Fora — boosters e decks",
  description: GAME_INFO["lorcana"].blurb + " Loja física em Juiz de Fora - MG e envio pra todo o Brasil.",
  alternates: { canonical: "/lorcana" },
};

export default function Page(props: PageProps<"/lorcana">) {
  return <CatalogView searchParams={props.searchParams} game="lorcana" />;
}
