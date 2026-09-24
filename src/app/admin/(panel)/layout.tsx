import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "../actions";

export const metadata: Metadata = { title: { default: "Painel", template: "%s · Painel" }, robots: { index: false } };

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();
  return (
    <div className="min-h-dvh pb-[calc(4rem+env(safe-area-inset-bottom))] lg:grid lg:grid-cols-[14rem_1fr] lg:pb-0">
      <aside className="hidden border-r border-line bg-sunken lg:flex lg:flex-col">
        <Link href="/admin" className="flex items-center gap-2.5 border-b border-line px-4 py-4">
          <Image src="/brand/logo-256.png" alt="" width={32} height={32} />
          <span className="display text-sm leading-none">
            Painel<span className="text-gold"> BC</span>
          </span>
        </Link>
        <div className="flex-1 p-2">
          <AdminNav variant="side" />
        </div>
        <div className="border-t border-line p-4">
          <p className="meta truncate normal-case">{admin.email}</p>
          <div className="mt-2 flex gap-3 text-xs">
            <Link href="/" className="text-ink-muted hover:text-ink" target="_blank">
              Ver site
            </Link>
            <form action={logoutAction}>
              <button className="text-ink-muted hover:text-ink">Sair</button>
            </form>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-line bg-canvas/95 px-4 backdrop-blur-sm lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/brand/logo-256.png" alt="" width={26} height={26} />
          <span className="display text-xs leading-none">
            Painel<span className="text-gold"> BC</span>
          </span>
        </Link>
        <div className="flex items-center gap-4 text-xs">
          <Link href="/" className="text-ink-muted" target="_blank">
            Ver site
          </Link>
          <form action={logoutAction}>
            <button className="text-ink-muted">Sair</button>
          </form>
        </div>
      </header>

      <main className="min-w-0 px-4 py-5 lg:px-8 lg:py-8">{children}</main>

      <nav
        aria-label="Painel"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <AdminNav variant="bottom" />
      </nav>
    </div>
  );
}
