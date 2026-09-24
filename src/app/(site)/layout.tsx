import { CartDrawer } from "@/components/cart/cart-drawer";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { WhatsappFloat } from "@/components/site/whatsapp-float";
import { onlineCheckoutEnabled } from "@/lib/payments/config";
import { JsonLd, localBusinessJsonLd } from "@/lib/seo";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-sm focus:bg-gold focus:px-3 focus:py-2 focus:text-on-gold"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" className="min-h-[60dvh]">
        {children}
      </main>
      <Footer />
      <WhatsappFloat />
      <CartDrawer onlineCheckout={onlineCheckoutEnabled()} />
      <JsonLd data={localBusinessJsonLd()} />
    </>
  );
}
