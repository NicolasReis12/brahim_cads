import { MessageCircle } from "lucide-react";
import { ButtonA, ButtonLink } from "@/components/ui/button";
import { generalWhatsappUrl } from "@/lib/whatsapp";

export default function ProductNotFound() {
  return (
    <div className="container-page flex flex-col items-start gap-4 py-20">
      <p className="meta">Erro 404</p>
      <h1 className="display text-4xl sm:text-5xl">Esse produto saiu da prateleira</h1>
      <p className="max-w-md text-ink-muted">
        Pode ter sido removido ou o link mudou. Procura na loja ou chama no WhatsApp que a gente verifica.
      </p>
      <div className="flex flex-wrap gap-2">
        <ButtonLink href="/loja">Ver a loja</ButtonLink>
        <ButtonA href={generalWhatsappUrl("Oi! Tentei abrir um produto no site e não encontrei.")} target="_blank" rel="noopener" variant="whatsapp">
          <MessageCircle /> WhatsApp
        </ButtonA>
      </div>
    </div>
  );
}
