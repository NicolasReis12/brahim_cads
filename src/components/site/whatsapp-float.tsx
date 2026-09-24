import { WhatsappIcon } from "@/components/ui/icons";
import { generalWhatsappUrl } from "@/lib/whatsapp";

/** Botão flutuante discreto: ícone em contorno, sem pulsar nem balão. */
export function WhatsappFloat() {
  return (
    <a
      href={generalWhatsappUrl()}
      target="_blank"
      rel="noopener"
      aria-label="Falar com a loja no WhatsApp"
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-30 grid size-12 place-items-center rounded-sm border border-line-strong bg-surface text-ok shadow-[0_6px_20px_-8px_rgb(0_0_0/0.7)] transition-colors hover:border-ok hover:bg-raised"
    >
      <WhatsappIcon width={22} height={22} />
    </a>
  );
}
