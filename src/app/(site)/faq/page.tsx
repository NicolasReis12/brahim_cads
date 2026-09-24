import { MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import { FaqList } from "@/components/site/faq-list";
import { ButtonA } from "@/components/ui/button";
import { FAQ } from "@/config/faq";
import { JsonLd } from "@/lib/seo";
import { generalWhatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Perguntas frequentes",
  description: "Produtos originais, envio, formas de pagamento, reserva, pré-venda e compra em quantidade na Brahim Cards.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <div className="container-page grid gap-10 pt-6 md:pt-10 lg:grid-cols-[1fr_2fr] lg:gap-14">
      <header className="flex flex-col gap-4">
        <p className="meta">Ajuda</p>
        <h1 className="display text-4xl sm:text-5xl">Perguntas frequentes</h1>
        <p className="text-ink-muted">Não achou a resposta? Pergunta direto, a gente responde rápido.</p>
        <ButtonA href={generalWhatsappUrl("Oi! Tenho uma dúvida:")} target="_blank" rel="noopener" variant="whatsapp" className="w-fit">
          <MessageCircle /> Perguntar no WhatsApp
        </ButtonA>
      </header>
      <FaqList items={FAQ} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
    </div>
  );
}
