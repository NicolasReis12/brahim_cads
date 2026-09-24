"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "./nav-links";

export function NavLinks({ vertical = false, onNavigate }: { vertical?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className={clsx("flex", vertical ? "flex-col" : "items-center gap-1")}>
      {NAV.map((item) => {
        const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              data-game={item.game}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "relative flex items-center gap-2 rounded-sm text-sm transition-colors",
                vertical ? "h-12 px-4 text-base" : "h-9 px-3",
                active ? "text-ink" : "text-ink-muted hover:text-ink",
                !vertical && active && "after:absolute after:inset-x-3 after:-bottom-[calc((var(--header-h)-2.25rem)/2+1px)] after:h-0.5 after:bg-[var(--game,var(--gold))]",
              )}
            >
              {item.game && <span aria-hidden className="size-1.5 rotate-45 bg-[var(--game)]" />}
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
