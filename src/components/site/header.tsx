import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CartButton } from "./header-client";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-active";

export function Header() {
  return (
    <header
      className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur-sm supports-[backdrop-filter]:bg-canvas/85"
      style={{ viewTransitionName: "site-header" }}
    >
      <div className="container-page flex h-[var(--header-h)] items-center gap-3">
        <MobileMenu />
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Brahim Cards — início">
          <Image src="/brand/logo-256.png" alt="" width={36} height={36} loading="eager" className="size-9" />
          <span className="display hidden text-[0.95rem] leading-none sm:block">
            Brahim<span className="text-gold"> Cards</span>
          </span>
        </Link>

        <nav aria-label="Principal" className="ml-6 hidden lg:block">
          <NavLinks />
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <form action="/loja" role="search" className="relative hidden md:block">
            <label htmlFor="header-search" className="sr-only">
              Buscar produtos
            </label>
            <Search size={16} strokeWidth={1.75} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-subtle" />
            <input
              id="header-search"
              name="q"
              type="search"
              placeholder="Buscar booster, coleção…"
              className="h-9 w-56 rounded-sm border border-line bg-sunken pl-8 pr-3 text-sm placeholder:text-ink-subtle hover:border-line-strong focus:w-72 focus:border-gold focus:outline-none transition-[width,border-color] duration-200"
            />
          </form>
          <Link
            href="/loja#busca"
            className="grid size-10 place-items-center rounded-sm text-ink-muted hover:bg-raised hover:text-ink md:hidden"
            aria-label="Buscar produtos"
          >
            <Search size={20} strokeWidth={1.75} />
          </Link>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
