import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";

export const inputClass =
  "h-11 w-full rounded-sm border border-line bg-sunken px-3 text-[0.9375rem] text-ink placeholder:text-ink-subtle transition-colors hover:border-line-strong focus:border-gold focus:outline-none focus-visible:outline-none aria-[invalid=true]:border-danger";

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
  className,
}: {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
  htmlFor: string;
  className?: string;
}) {
  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-[0.8125rem] font-medium text-ink-muted">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-ink-subtle">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={clsx(inputClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={clsx(inputClass, "h-auto min-h-24 py-2.5 leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={clsx(
        inputClass,
        "appearance-none bg-[length:12px] bg-[position:right_0.75rem_center] bg-no-repeat pr-9",
        "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='none' stroke='%23a8a29a' stroke-width='1.5'%3E%3Cpath d='M2.5 4.5 6 8l3.5-3.5'/%3E%3C/svg%3E\")]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

/** Opção segmentada (radio estilizado), usado em entrega/retirada e similares. */
export function Segmented<T extends string>({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; hint?: string }[];
}) {
  return (
    <div role="radiogroup" className="grid grid-cols-2 gap-2">
      {options.map((o) => (
        <label
          key={o.value}
          className={clsx(
            "flex cursor-pointer flex-col gap-0.5 rounded-sm border px-3 py-2.5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold",
            value === o.value ? "border-gold bg-gold/8" : "border-line hover:border-line-strong",
          )}
        >
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="sr-only"
          />
          <span className="text-sm font-medium text-ink">{o.label}</span>
          {o.hint && <span className="text-xs text-ink-subtle">{o.hint}</span>}
        </label>
      ))}
    </div>
  );
}
