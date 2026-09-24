import type { Metadata } from "next";
import Image from "next/image";
import { InstagramIcon } from "@/components/ui/icons";
import { ButtonA } from "@/components/ui/button";
import { STORE, instagramUrl } from "@/config/store";

export const metadata: Metadata = {
  title: "Sobre a Brahim Cards",
  description: "Guilherme Brahim, colecionador, vende cartas desde 2024. Começou em grupos de WhatsApp e hoje tem loja física em Juiz de Fora.",
  alternates: { canonical: "/sobre" },
};

export default function SobrePage() {
  return (
    <div className="container-page grid gap-10 pt-6 md:pt-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
      <div className="relative aspect-[4/5] overflow-hidden border border-line lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start">
        <Image
          src="/brand/guilherme.jpg"
          alt="Guilherme Brahim, dono da Brahim Cards"
          fill
          preload
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-cover"
        />
      </div>

      <article className="flex flex-col gap-5">
        <p className="meta">Sobre</p>
        <h1 className="display text-4xl sm:text-5xl">Oi, eu sou o Guilherme</h1>
        {/*
          Texto em primeira pessoa com base na história do site antigo.
          Vale o Guilherme revisar e ajustar com as palavras dele.
        */}
        <div className="flex max-w-prose flex-col gap-4 text-[1.0625rem] leading-relaxed text-ink-muted">
          <p>
            Coleciono carta faz tempo, e em {STORE.since} comecei a vender — primeiro em grupo de WhatsApp, separando pedido na
            mesa de casa e levando nos Correios.
          </p>
          <p>
            O movimento cresceu e virou a loja da Barão do Rio Branco, no Alto dos Passos. Hoje tem balcão, prateleira cheia e
            mesa pra jogar. Toda semana tem liga, e quando sai coleção nova a gente faz campeonato.
          </p>
          <p>
            Trabalho só com produto original e lacrado: nacional da Copag e importado de distribuidor. Embalo tudo como eu
            gostaria de receber — plástico bolha, toploader nas avulsas e caixa rígida nos produtos grandes.
          </p>
          <p>
            Esse site é pra você ver o que tem de verdade no estoque antes de chamar. Se não achar o que procura, me manda
            mensagem que eu corro atrás.
          </p>
        </div>
        <p className="font-display text-lg font-bold uppercase tracking-tight text-ink" style={{ fontVariationSettings: '"wdth" 118' }}>
          — {STORE.owner}
        </p>
        <ButtonA href={instagramUrl} target="_blank" rel="noopener" variant="secondary" className="w-fit">
          <InstagramIcon /> @{STORE.instagram}
        </ButtonA>
      </article>
    </div>
  );
}
