import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/catalog-view";
import { GAME_INFO } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "One Piece Card Game em Juiz de Fora",
  description: GAME_INFO["one-piece"].blurb + " Loja física em Juiz de Fora - MG e envio pra todo o Brasil.",
  alternates: { canonical: "/one-piece" },
};

export default function Page(props: PageProps<"/one-piece">) {
  return <CatalogView searchParams={props.searchParams} game="one-piece" />;
}
