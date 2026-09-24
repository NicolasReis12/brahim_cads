"use client";

import { MessageCircle, RotateCcw } from "lucide-react";
import { Button, ButtonA } from "@/components/ui/button";
import { generalWhatsappUrl } from "@/lib/whatsapp";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-page flex flex-col items-start gap-4 py-20">
      <p className="meta">Erro</p>
      <h1 className="display text-4xl sm:text-5xl">Deu ruim ao carregar</h1>
      <p className="max-w-md text-ink-muted">
        Não conseguimos buscar os produtos agora. Tenta de novo em alguns segundos — se continuar, chama no WhatsApp.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={reset}>
          <RotateCcw /> Tentar de novo
        </Button>
        <ButtonA href={generalWhatsappUrl("Oi! O site deu erro aqui pra mim.")} target="_blank" rel="noopener" variant="whatsapp">
          <MessageCircle /> WhatsApp
        </ButtonA>
      </div>
    </div>
  );
}
