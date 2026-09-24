"use client";

import { clsx } from "clsx";
import { CalendarDays, Package, Receipt, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Produtos", icon: Package, match: (p: string) => p === "/admin" || p.startsWith("/admin/produtos") },
  { href: "/admin/vender", label: "Registrar venda", short: "Vender", icon: ShoppingCart, match: (p: string) => p.startsWith("/admin/vender") },
  { href: "/admin/pedidos", label: "Pedidos", icon: Receipt, match: (p: string) => p.startsWith("/admin/pedidos") },
  { href: "/admin/eventos", label: "Eventos", icon: CalendarDays, match: (p: string) => p.startsWith("/admin/eventos") },
];

export function AdminNav({ variant }: { variant: "side" | "bottom" }) {
  const pathname = usePathname();
  return (
    <ul className={clsx(variant === "bottom" ? "grid grid-cols-4" : "flex flex-col gap-0.5")}>
      {ITEMS.map(({ href, label, short, icon: Icon, match }) => {
        const active = match(pathname);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "flex items-center transition-colors",
                variant === "bottom"
                  ? "h-16 flex-col justify-center gap-1 text-[0.6875rem]"
                  : "h-10 gap-3 rounded-sm px-3 text-sm",
                active ? "text-gold" : "text-ink-muted hover:text-ink",
                variant === "side" && active && "bg-raised",
              )}
            >
              <Icon size={variant === "bottom" ? 20 : 17} strokeWidth={1.75} />
              {variant === "bottom" ? (short ?? label) : label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
