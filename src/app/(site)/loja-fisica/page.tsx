import { MapPin, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { EventList, EventListEmpty } from "@/components/site/event-list";
import { StoreHours, mapsDirectionsUrl, mapsEmbedUrl } from "@/components/site/store-hours";
import { ButtonA } from "@/components/ui/button";
import { STORE } from "@/config/store";
import { repo } from "@/lib/data";
import { JsonLd, eventJsonLd } from "@/lib/seo";
import { generalWhatsappUrl } from "@/lib/whatsapp";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Loja física e eventos em Juiz de Fora — liga Pokémon e Lorcana",
  description: `Loja de cartas Pokémon, Lorcana e One Piece em Juiz de Fora: ${STORE.address.street}, ${STORE.address.district}. Liga, campeonato, trocas e retirada de pedidos no balcão.`,
  alternates: { canonical: "/loja-fisica" },
};

const PHOTOS = [
  { src: "/loja/wa-11.jpg", alt: "Mesas de jogo cheias durante a liga, com quadro de boosters na parede" },
  { src: "/loja/wa-12.jpg", alt: "Balcão com prateleiras de boosters, blisters e boxes" },
  { src: "/loja/wa-17.jpg", alt: "Partida de Pokémon TCG com playmat na mesa" },
];

export default async function LojaFisicaPage() {
  const events = await repo.listEvents({ upcomingOnly: true });

  return (
    <div className="container-page pt-6 md:pt-10">
      <header className="border-b border-line pb-6">
        <p className="meta">Alto dos Passos · Juiz de Fora</p>
        <h1 className="display mt-3 text-4xl sm:text-6xl">Loja física</h1>
      </header>

      <div className="grid gap-10 py-8 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
        <div className="flex flex-col gap-6">
          <p className="text-ink-muted">
            Balcão pra comprar e retirar pedido, mesa pra jogar e trocar carta. Tem liga toda semana e campeonato quando sai
            coleção nova. Pedido feito no site pode ser retirado aqui sem frete.
          </p>

          <section aria-labelledby="endereco" className="flex flex-col gap-2 border-t border-line pt-5">
            <h2 id="endereco" className="meta">
              Endereço
            </h2>
            <address className="not-italic">
              <p className="text-lg text-ink">{STORE.address.street}</p>
              <p className="text-ink-muted">
                {STORE.address.district} · {STORE.address.city} - {STORE.address.state} · CEP {STORE.address.cep}
              </p>
            </address>
          </section>

          <section aria-labelledby="horario" className="flex flex-col gap-2 border-t border-line pt-5">
            <h2 id="horario" className="meta">
              Horário do balcão
            </h2>
            <StoreHours />
          </section>

          <div className="flex flex-wrap gap-2">
            <ButtonA href={mapsDirectionsUrl} target="_blank" rel="noopener" variant="secondary">
              <MapPin /> Como chegar
            </ButtonA>
            <ButtonA href={generalWhatsappUrl("Oi! Vou passar na loja, vocês estão abertos hoje?")} target="_blank" rel="noopener" variant="whatsapp">
              <MessageCircle /> Confirmar no WhatsApp
            </ButtonA>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden border border-line bg-sunken">
            <iframe
              title={`Mapa: ${STORE.address.street}, ${STORE.address.city}`}
              src={mapsEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 size-full grayscale-[0.4] invert-[0.9] hue-rotate-180"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 self-start">
          {PHOTOS.map((p, i) => (
            <div key={p.src} className={`relative overflow-hidden border border-line ${i === 0 ? "col-span-2 aspect-[16/9]" : "aspect-[3/4]"}`}>
              <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1024px) 30vw, 50vw" className="object-cover" />
            </div>
          ))}
        </div>
      </div>

      <section id="agenda" aria-labelledby="agenda-titulo" className="scroll-mt-24 border-t border-line py-10">
        <div className="mb-6 flex flex-col gap-2">
          <span className="meta">Agenda</span>
          <h2 id="agenda-titulo" className="display text-3xl sm:text-4xl">
            Ligas e campeonatos
          </h2>
          <p className="max-w-lg text-sm text-ink-muted">
            Inscrição na loja ou pelo WhatsApp. Datas podem mudar — confirma antes de vir, principalmente em campeonato.
          </p>
        </div>
        {events.length ? <EventList events={events} /> : <EventListEmpty />}
      </section>

      {events.length > 0 && <JsonLd data={events.map(eventJsonLd)} />}
    </div>
  );
}
