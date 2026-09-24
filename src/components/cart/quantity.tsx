"use client";

import { clsx } from "clsx";
import { Minus, Plus } from "lucide-react";

export function QuantityStepper({
  value,
  max,
  min = 1,
  onChange,
  label,
  size = "md",
}: {
  value: number;
  max: number;
  min?: number;
  onChange: (v: number) => void;
  label: string;
  size?: "sm" | "md" | "lg";
}) {
  const btn = clsx(
    "grid place-items-center text-ink-muted transition-colors hover:bg-raised hover:text-ink disabled:opacity-35 disabled:hover:bg-transparent",
    size === "sm" ? "size-8" : size === "lg" ? "h-12 w-10" : "size-10",
  );
  return (
    <div className="inline-flex items-center rounded-sm border border-line" role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Diminuir quantidade">
        <Minus size={14} strokeWidth={2} />
      </button>
      <output
        aria-live="polite"
        className={clsx("min-w-8 text-center font-mono tabular-nums text-ink", size === "sm" ? "text-xs" : "text-sm")}
      >
        {value}
      </output>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Aumentar quantidade">
        <Plus size={14} strokeWidth={2} />
      </button>
    </div>
  );
}
