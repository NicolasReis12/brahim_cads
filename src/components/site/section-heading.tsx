import Link from "next/link";
import type { ReactNode } from "react";

/** Cabeçalho de seção estilo aba de fichário: índice em mono + título display + link à direita. */
export function SectionHeading({
  index,
  title,
  id,
  href,
  linkLabel,
  children,
}: {
  index: string;
  title: ReactNode;
  id: string;
  href?: string;
  linkLabel?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <div className="flex flex-col gap-2">
        <span className="meta">{index}</span>
        <h2 id={id} className="display text-3xl sm:text-4xl">
          {title}
        </h2>
        {children}
      </div>
      {href && (
        <Link href={href} className="meta shrink-0 whitespace-nowrap py-1 hover:text-ink">
          {linkLabel ?? "Ver tudo"} →
        </Link>
      )}
    </div>
  );
}
