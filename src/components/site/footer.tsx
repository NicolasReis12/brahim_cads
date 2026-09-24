import Link from "next/link";
import { STORE, instagramUrl } from "@/config/store";
import { InstagramIcon, WhatsappIcon } from "@/components/ui/icons";
import { generalWhatsappUrl } from "@/lib/whatsapp";
import { NAV, SECONDARY_NAV } from "./nav-links";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-sunken">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <p className="display text-2xl">
            Brahim<span className="text-gold"> Cards</span>
          </p>
          <address className="not-italic text-sm leading-relaxed text-ink-muted">
            {STORE.address.street}
            <br />
            {STORE.address.district} · {STORE.address.city} - {STORE.address.state}
            <br />
            CEP {STORE.address.cep}
          </address>
          <div className="flex flex-wrap gap-4 text-sm">
            <a href={generalWhatsappUrl()} target="_blank" rel="noopener" className="flex items-center gap-2 text-ink-muted hover:text-ink">
              <WhatsappIcon width={18} height={18} /> {STORE.whatsappDisplay}
            </a>
            <a href={instagramUrl} target="_blank" rel="noopener" className="flex items-center gap-2 text-ink-muted hover:text-ink">
              <InstagramIcon width={18} height={18} /> @{STORE.instagram}
            </a>
          </div>
        </div>

        <nav aria-label="Catálogo">
          <p className="meta mb-3">Catálogo</p>
          <ul className="flex flex-col gap-2 text-sm">
            {NAV.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-ink-muted hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Ajuda">
          <p className="meta mb-3">Ajuda</p>
          <ul className="flex flex-col gap-2 text-sm">
            {SECONDARY_NAV.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-ink-muted hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 pb-20 pt-5 meta normal-case sm:flex-row sm:items-center sm:justify-between sm:pb-5 sm:pr-20">
          <p>
            © {new Date().getFullYear()} {STORE.name} · Juiz de Fora - MG
          </p>
          <p>Pokémon, Disney Lorcana e One Piece são marcas de seus respectivos donos.</p>
        </div>
      </div>
    </footer>
  );
}
