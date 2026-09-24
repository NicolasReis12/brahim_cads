"use client";

import { clsx } from "clsx";
import { X } from "lucide-react";
import { AnimatePresence, domAnimation, LazyMotion, m, useReducedMotion } from "motion/react";
import { Dialog } from "radix-ui";
import type { ReactNode } from "react";

/**
 * Painel deslizante acessível (Radix Dialog + Motion).
 * side="right" para o carrinho, side="bottom" para filtros no celular.
 */
export function Sheet({
  open,
  onOpenChange,
  side = "right",
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "right" | "bottom";
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const reduce = useReducedMotion();
  const offscreen = side === "right" ? { x: "100%" } : { y: "100%" };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <LazyMotion features={domAnimation}>
        <AnimatePresence>
          {open && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild forceMount>
                <m.div
                  className="fixed inset-0 z-50 bg-black/60"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.18 }}
                />
              </Dialog.Overlay>
              <Dialog.Content asChild forceMount>
                <m.div
                  className={clsx(
                    "fixed z-50 flex flex-col border-line bg-surface shadow-[0_0_0_1px_var(--line)] focus:outline-none",
                    side === "right" && "inset-y-0 right-0 w-full max-w-md border-l",
                    side === "bottom" && "inset-x-0 bottom-0 max-h-[88dvh] rounded-t-md border-t",
                  )}
                  initial={reduce ? { opacity: 0 } : offscreen}
                  animate={reduce ? { opacity: 1 } : { x: 0, y: 0 }}
                  exit={reduce ? { opacity: 0 } : offscreen}
                  transition={{ type: "tween", ease: [0.2, 0.8, 0.2, 1], duration: reduce ? 0 : 0.26 }}
                >
                  {side === "bottom" && (
                    <div aria-hidden className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-line-strong" />
                  )}
                  <header className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-4 py-3">
                    <div className="min-w-0">
                      <Dialog.Title className="font-display text-base font-extrabold uppercase tracking-tight" style={{ fontVariationSettings: '"wdth" 118' }}>
                        {title}
                      </Dialog.Title>
                      {description ? (
                        <Dialog.Description className="meta mt-0.5">{description}</Dialog.Description>
                      ) : (
                        <Dialog.Description className="sr-only">Painel</Dialog.Description>
                      )}
                    </div>
                    <Dialog.Close
                      className="-mr-2 -mt-1 grid size-10 place-items-center rounded-sm text-ink-muted hover:bg-raised hover:text-ink"
                      aria-label="Fechar"
                    >
                      <X size={20} strokeWidth={1.75} />
                    </Dialog.Close>
                  </header>
                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
                  {footer && (
                    <footer className="shrink-0 border-t border-line bg-surface px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                      {footer}
                    </footer>
                  )}
                </m.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </LazyMotion>
    </Dialog.Root>
  );
}
