import { clsx } from "clsx";
import { formatBRL } from "@/lib/format";

export function Price({
  cents,
  unitLabel,
  size = "md",
  className,
}: {
  cents: number;
  unitLabel?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span className={clsx("inline-flex items-baseline gap-1.5", className)}>
      <span
        className={clsx(
          "font-display font-bold tabular-nums tracking-tight text-ink",
          size === "sm" && "text-base",
          size === "md" && "text-lg",
          size === "lg" && "text-3xl",
        )}
        style={{ fontVariationSettings: '"wdth" 112' }}
      >
        {formatBRL(cents)}
      </span>
      {unitLabel && <span className="text-xs text-ink-subtle">{unitLabel}</span>}
    </span>
  );
}
