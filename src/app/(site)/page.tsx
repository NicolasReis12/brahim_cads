import { ArrowRight, MapPin, PackageCheck, Store, Truck, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PreorderList } from "@/components/catalog/preorder-list";
import { ProductGrid } from "@/components/catalog/product-card";
import { EventList, EventListEmpty } from "@/components/site/event-list";
import { SectionHeading } from "@/components/site/section-heading";
import { StoreHours, mapsDirectionsUrl } from "@/components/site/store-hours";
import { ButtonA, ButtonLink } from "@/components/ui/button";
import { STORE } from "@/config/store";
import { GAME_INFO, stockState } from "@/lib/catalog";
import { repo } from "@/lib/data";
import { GAMES } from "@/lib/types";

export const revalidate = 60;

export default async function HomePage() {
  const [products, events] = await Promise.all([repo.listProducts(), repo.listEvents({ upcomingOnly: true })]);

  const available = products.filter((p) => stockState(p).kind === "pronta-entrega");
  const newest = [...available].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const featured = [...available.filter((p) => p.featured), ...newest.filter((p) => !p.featured)].slice(0, 4);
  const rest = newest.filter((p) => !featured.includes(p));
  // múltiplo de 5 (colunas no desktop) pra não sobrar fileira quebrada; mínimo 4 no celular
  const novidades = rest.slice(0, rest.length >= 10 ? 10 : rest.length >= 5 ? 5 : rest.length);
  const preorders = products
    .filter((p) => stockState(p).kind === "pre-venda")
    .sort((a, b) => (a.preorderEta ?? "9").localeCompare(b.preorderEta ?? "9"));
  const countByGame = Object.fromEntries(GAMES.map((g) => [g, products.filter((p) => p.game === g).length]));
  const accessories = products.filter((p) => p.type === "acessorio").length;

  return (
    <>
      {/* Abertura: texto curto + atalhos por jogo à esquerda, vitrine de destaques à direita */}
      <section aria-labelledby="abertura" className="container-page grid gap-8 pb-14 pt-6 md:pt-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
        <div className="flex flex-col">
          <p className="meta flex items-center gap-1.5">
            <MapPin size={12} strokeWidth={2} aria-hidden /> Juiz de Fora · MG · desde {STORE.since}
          </p>
          <h1 id="abertura" className="display mt-4 text-[2.5rem] sm:text-6xl lg:text-[3.4rem] xl:text-[3.9rem]">
            Card game <span className="text-gold">lacrado</span>, com estoque na tela.
          </h1>
          <p className="mt-5 max-w-md text-ink-muted">
            Booster, ETB, booster box e acessório de Pokémon, Lorcana e One Piece. Compra aqui e recebe pelos Correios, ou
            retira no balcão do Alto dos Passos.
          </p>

          <nav aria-label="Jogos" className="mt-8 border-t border-line">
            <ul>
              {GAMES.map((g, i) => (
                <li key={g} data-game={g}>
                  <Link
                    href={GAME_INFO[g].path}
                    className="group flex items-center gap-4 border-b border-line py-3.5 transition-colors hover:bg-surface"
                  >
                    <span className="meta w-6">0{i + 1}</span>
                    <span aria-hidden className="h-7 w-1 bg-[var(--game)] transition-[width] group-hover:w-2" />
                    <span className="flex-1 font-display text-[0.95rem] font-bold uppercase leading-tight tracking-tight sm:text-lg" style={{ fontVariationSettings: '"wdth" 118' }}>
                      {GAME_INFO[g].label}
                    </span>
                    <span className="meta">{countByGame[g] ? `${countByGame[g]} itens` : "em breve"}</span>
                    <ArrowRight size={16} strokeWidth={1.75} className="text-ink-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/loja?tipo=acessorio" className="group flex items-center gap-4 border-b border-line py-3.5 transition-colors hover:bg-surface">
                  <span className="meta w-6">04</span>
                  <span aria-hidden className="h-7 w-1 bg-ink-subtle transition-[width] group-hover:w-2" />
                  <span className="flex-1 font-display text-[0.95rem] font-bold uppercase leading-tight tracking-tight sm:text-lg" style={{ fontVariationSettings: '"wdth" 118' }}>
                    Acessórios
                  </span>
                  <span className="meta">{accessories} itens</span>
                  <ArrowRight size={16} strokeWidth={1.75} className="text-ink-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="meta">Em destaque no balcão</h2>
            <Link href="/loja" className="meta hover:text-ink">
              Loja completa →
            </Link>
          </div>
          <ProductGrid products={featured} priorityCount={4} variant="feature" />
        </div>
      </section>

      {novidades.length > 0 && (
        <section aria-labelledby="novidades" className="container-page py-10">
          <SectionHeading index="Chegou" id="novidades" title="Novidades" href="/loja" linkLabel="Ver a loja" />
          <ProductGrid products={novidades} />
        </section>
      )}

      {preorders.length > 0 && (
        <section aria-labelledby="pre-venda" className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_2fr] lg:gap-12">
          <div>
            <SectionHeading index="Reserva" id="pre-venda" title={<>Pré-venda <span className="text-violet">aberta</span></>} />
            <p className="max-w-sm text-sm text-ink-muted">
              Garante antes de chegar: paga aqui no site ou reserva com sinal pelo WhatsApp. Se a data de chegada mudar, a gente
              avisa.
            </p>
            <Link href="/loja?disp=pre-venda" className="meta mt-4 inline-block hover:text-ink">
              Todas as pré-vendas →
            </Link>
          </div>
          <PreorderList products={preorders.slice(0, 6)} />
        </section>
      )}

      <section aria-labelledby="eventos" className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_2fr] lg:gap-12">
        <div>
          <SectionHeading index="Agenda" id="eventos" title="Próximos eventos" />
          <p className="max-w-sm text-sm text-ink-muted">
            Liga, campeonato e mesa aberta pra troca na loja. Traz o deck — iniciante é bem-vindo.
          </p>
          <Link href="/loja-fisica#agenda" className="meta mt-4 inline-block hover:text-ink">
            Agenda completa →
          </Link>
        </div>
        {events.length ? <EventList events={events.slice(0, 4)} compact /> : <EventListEmpty />}
      </section>

      <section aria-labelledby="loja-fisica" className="mt-10 border-y border-line bg-sunken">
        <div className="container-page grid gap-8 py-12 lg:grid-cols-[1fr_1.3fr] lg:items-center lg:gap-14">
          <div className="flex flex-col gap-4">
            <span className="meta">Balcão</span>
            <h2 id="loja-fisica" className="display text-3xl sm:text-4xl">
              A loja é de verdade
            </h2>
            <p className="max-w-md text-ink-muted">
              Prateleira cheia, mesa pra jogar e gente trocando carta. Passa pra ver os produtos de perto, retirar pedido do site
              sem pagar frete ou jogar a liga.
            </p>
            <address className="not-italic">
              <p className="text-ink">{STORE.address.street}</p>
              <p className="text-sm text-ink-muted">
                {STORE.address.district} · {STORE.address.city} - {STORE.address.state}
              </p>
            </address>
            <StoreHours />
            <div className="flex flex-wrap gap-2 pt-1">
              <ButtonLink href="/loja-fisica" variant="secondary">
                <Store /> Loja física e eventos
              </ButtonLink>
              <ButtonA href={mapsDirectionsUrl} target="_blank" rel="noopener" variant="ghost">
                <MapPin /> Como chegar
              </ButtonA>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative col-span-2 aspect-[16/9] overflow-hidden border border-line">
              <Image src="/loja/wa-11.jpg" alt="Mesas da loja com jogadores durante a liga e quadro de boosters na parede" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="relative aspect-[4/5] overflow-hidden border border-line">
              <Image src="/loja/wa-12.jpg" alt="Balcão e prateleiras com boosters, blisters e boxes de Pokémon" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[4/5] overflow-hidden border border-line">
              <Image src="/loja/wa-17.jpg" alt="Partida de Pokémon TCG na mesa da loja" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="diferenciais" className="container-page py-14">
        <h2 id="diferenciais" className="sr-only">
          Por que comprar aqui
        </h2>
        <ul className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, title: "Original e lacrado", text: "Só produto oficial: nacional da Copag e importado de distribuidor." },
            { icon: PackageCheck, title: "Embalagem reforçada", text: "Plástico bolha, toploader pra carta avulsa e caixa rígida pros maiores." },
            { icon: Truck, title: "Envio pra todo o Brasil", text: "PAC ou SEDEX com rastreio. Pagou, a gente posta." },
            { icon: Store, title: "Retirada grátis em JF", text: "Compra no site e busca no balcão, sem frete." },
          ].map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex flex-col gap-2 bg-canvas p-5">
              <Icon size={20} strokeWidth={1.75} className="text-gold" aria-hidden />
              <h3 className="font-medium text-ink">{title}</h3>
              <p className="text-sm text-ink-muted">{text}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
