import { clsx } from "clsx";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "whatsapp";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm font-medium whitespace-nowrap select-none transition-colors duration-150 disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-[1.1em] [&_svg]:shrink-0";

const variants: Record<Variant, string> = {
  primary: "bg-gold text-on-gold hover:bg-gold-hover active:bg-gold-deep",
  secondary: "border border-line-strong text-ink hover:border-ink-muted hover:bg-raised",
  ghost: "text-ink-muted hover:text-ink hover:bg-raised",
  // WhatsApp: contorno com o verde de status — sem imitar o verde da marca em bloco
  whatsapp: "border border-ok/50 text-ok hover:bg-ok/10 hover:border-ok",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[0.8125rem]",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-[0.9375rem]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return clsx(base, variants[variant], sizes[size], className);
}

type Common = { variant?: Variant; size?: Size; children: ReactNode; className?: string };

export function Button({ variant, size, className, ...props }: Common & ComponentProps<"button">) {
  return <button type="button" className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: Common & ComponentProps<typeof Link>) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonA({ variant, size, className, ...props }: Common & ComponentProps<"a">) {
  return <a className={buttonClass(variant, size, className)} {...props} />;
}
