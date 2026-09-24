import { clsx } from "clsx";
import { EVENT_KIND_LABEL, GAME_INFO } from "@/lib/catalog";
import { formatBRL } from "@/lib/format";
import type { StoreEvent } from "@/lib/types";

const tz = "America/Sao_Paulo";

function parts(iso: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString("pt-BR", { timeZone: tz, day: "2-digit" }),
    month: d.toLocaleDateString("pt-BR", { timeZone: tz, month: "short" }).replace(".", ""),
    weekday: d.toLocaleDateString("pt-BR", { timeZone: tz, weekday: "long" }),
    time: d.toLocaleTimeString("pt-BR", { timeZone: tz, hour: "2-digit", minute: "2-digit" }).replace(":00", "h").replace(":", "h"),
  };
}

export function EventList({ events, compact = false }: { events: StoreEvent[]; compact?: boolean }) {
  return (
    <ol className="border-t border-line">
      {events.map((e) => {
        const p = parts(e.startsAt);
        return (
          <li key={e.id} data-game={e.game ?? undefined} className="grid grid-cols-[4rem_1fr] gap-4 border-b border-line py-4 sm:grid-cols-[5rem_1fr_auto] sm:items-center">
            <time dateTime={e.startsAt} className="flex flex-col items-start border-l-2 border-[var(--game,var(--gold))] pl-3">
              <span className="display text-3xl leading-none">{p.day}</span>
              <span className="meta mt-1">{p.month}</span>
            </time>
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="meta !text-[var(--game,var(--ink-muted))]">{EVENT_KIND_LABEL[e.kind]}</span>
                {e.game && <span className="meta">· {GAME_INFO[e.game].short}</span>}
              </div>
              <h3 className="font-medium leading-snug text-ink">{e.title}</h3>
              <p className="meta normal-case">
                {p.weekday}, {p.time}
                {e.entryFeeCents !== null && e.entryFeeCents > 0 ? ` · inscrição ${formatBRL(e.entryFeeCents)}` : " · entrada livre"}
              </p>
              {!compact && e.description && <p className="mt-1 max-w-prose text-sm text-ink-muted">{e.description}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function EventListEmpty({ className }: { className?: string }) {
  return (
    <p className={clsx("border-y border-line py-6 text-sm text-ink-muted", className)}>
      Agenda sendo fechada. Segue{" "}
      <a href="https://instagram.com/brahimcardsjf" className="text-ink underline underline-offset-2" target="_blank" rel="noopener">
        @brahimcardsjf
      </a>{" "}
      que as datas de liga e campeonato saem lá primeiro.
    </p>
  );
}
