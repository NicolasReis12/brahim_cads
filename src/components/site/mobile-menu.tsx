"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { STORE, instagramUrl } from "@/config/store";
import { Sheet } from "@/components/ui/sheet";
import { InstagramIcon, WhatsappIcon } from "@/components/ui/icons";
import { generalWhatsappUrl } from "@/lib/whatsapp";
import { NavLinks } from "./nav-active";
import { SECONDARY_NAV } from "./nav-links";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="-ml-2 grid size-10 place-items-center rounded-sm text-ink-muted hover:bg-raised hover:text-ink lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu size={22} strokeWidth={1.75} />
      </button>
      <Sheet open={open} onOpenChange={setOpen} title="Menu">
        <nav aria-label="Menu" className="py-2">
          <NavLinks vertical onNavigate={() => setOpen(false)} />
          <ul className="mt-2 border-t border-line pt-2">
            {SECONDARY_NAV.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setOpen(false)} className="flex h-11 items-center px-4 text-sm text-ink-muted hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mx-4 mt-4 flex flex-col gap-3 border-t border-line pt-4 text-sm">
          <a href={generalWhatsappUrl()} target="_blank" rel="noopener" className="flex items-center gap-2.5 text-ink-muted hover:text-ink">
            <WhatsappIcon /> {STORE.whatsappDisplay}
          </a>
          <a href={instagramUrl} target="_blank" rel="noopener" className="flex items-center gap-2.5 text-ink-muted hover:text-ink">
            <InstagramIcon /> @{STORE.instagram}
          </a>
          <p className="meta normal-case">
            {STORE.address.street} · {STORE.address.district} · {STORE.address.city}
          </p>
        </div>
      </Sheet>
    </>
  );
}
