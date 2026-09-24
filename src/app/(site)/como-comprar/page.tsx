import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Como comprar",
  description: "Monte o carrinho, finalize pelo WhatsApp ou pague online com Pix ou cartão. Envio pelos Correios ou retirada grátis na loja em Juiz de Fora.",
  alternates: { canonical: "/como-comprar" },
};

const STEPS = [
  {
    title: "Escolhe e coloca no carrinho",
    text: "O estoque de cada produto aparece na página. O carrinho não deixa passar do que tem na loja, e fica salvo no seu navegador — pode fechar e voltar depois.",
  },
  {
    title: "Finaliza do jeito que preferir",
    text: "Pelo WhatsApp: você informa nome, CEP e se quer envio ou retirada, e a gente recebe a mensagem com o pedido montado. Pagando online (quando a opção aparece no carrinho): Pix ou cartão pelo Mercado Pago, com frete calculado na hora.",
  },
  {
    title: "Pagamento",
    text: "Pix é o principal. Também aceitamos cartão de crédito via link, transferência e dinheiro no balcão. No pagamento online, a confirmação é automática e o estoque já sai reservado pra você.",
  },
  {
    title: "Envio ou retirada",
    text: "Mandamos pelos Correios (PAC ou SEDEX) com embalagem reforçada e rastreio. Em Juiz de Fora dá pra retirar na loja, no Alto dos Passos, sem frete.",
  },
];

export default function ComoComprarPage() {
  return (
    <div className="container-page pt-6 md:pt-10">
      <header className="flex flex-col gap-3 border-b border-line pb-6">
        <p className="meta">Ajuda</p>
        <h1 className="display text-4xl sm:text-6xl">Como comprar</h1>
      </header>

      <ol className="grid gap-px border-b border-line md:grid-cols-2">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-5 border-t border-line py-6 md:pr-10 md:[&:nth-child(2)]:border-t-0 md:[&:nth-child(1)]:border-t-0">
            <span className="display text-4xl text-gold" aria-hidden>
              {i + 1}
            </span>
            <div className="flex flex-col gap-2">
              <h2 className="font-display text-xl font-bold uppercase tracking-tight" style={{ fontVariationSettings: '"wdth" 115' }}>
                {s.title}
              </h2>
              <p className="max-w-prose text-ink-muted">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <section className="grid gap-8 py-10 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <h2 className="meta">Pré-venda e reserva</h2>
          <p className="text-sm text-ink-muted">
            Produto em pré-venda mostra a previsão de chegada. Dá pra pagar tudo no site ou reservar com sinal pelo WhatsApp.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="meta">Compra em quantidade e lojistas</h2>
          <p className="text-sm text-ink-muted">Tem condição especial pra caixa fechada, combo e pedido de lojista. Chama no WhatsApp.</p>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="meta">Ainda com dúvida?</h2>
          <p className="text-sm text-ink-muted">
            Veja as <Link href="/faq" className="text-ink underline underline-offset-2">perguntas frequentes</Link> ou passa na{" "}
            <Link href="/loja-fisica" className="text-ink underline underline-offset-2">loja</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
