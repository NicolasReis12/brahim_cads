import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import localFont from "next/font/local";
import { SITE_URL, STORE } from "@/config/store";
import "./globals.css";

// Archivo recortada (como gerar: README, seção Fontes): só largura 112–125% e peso 700–800, glifos latinos.
// 31 KB em vez de 88 KB da variável completa — é a fonte do título, que define o LCP.
const archivo = localFont({
  src: [{ path: "../fonts/archivo-display.woff2", weight: "700 800", style: "normal" }],
  variable: "--font-archivo",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "112% 125%" }],
  fallback: ["Arial Narrow", "Arial", "sans-serif"],
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
  // metadado secundário: não disputa banda com a fonte do título
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Brahim Cards — Loja de cartas Pokémon, Lorcana e One Piece em Juiz de Fora",
    template: "%s · Brahim Cards",
  },
  description:
    "Loja de card games em Juiz de Fora (MG): boosters, ETBs, booster box e acessórios de Pokémon TCG, Disney Lorcana e One Piece. Produtos originais e lacrados, envio pra todo o Brasil e retirada no balcão.",
  applicationName: STORE.name,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: STORE.name,
    images: [{ url: "/brand/og.jpg", width: 1200, height: 630, alt: STORE.name }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#1c1a18",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${instrument.variable} ${plexMono.variable}`}>
      <body className="bg-canvas text-ink antialiased">{children}</body>
    </html>
  );
}
