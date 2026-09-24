import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { EVENT_KIND_LABEL, GAME_INFO } from "@/lib/catalog";
import { repo } from "@/lib/data";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Eventos" };

function splitByDate<T extends { startsAt: string }>(events: T[]) {
  const cutoff = Date.now() - 6 * 3600_000;
  const upcoming = events.filter((e) => new Date(e.startsAt).getTime() >= cutoff);
  const past = events.filter((e) => !upcoming.includes(e)).reverse().slice(0, 10);
  return { upcoming, past };
}

export default async function EventsAdminPage() {
  const events = await repo.listEvents({ includeUnpublished: true });
  const { upcoming, past } = splitByDate(events);

  const Row = ({ e }: { e: (typeof events)[number] }) => (
    <li className="border-b border-line">
      <Link href={`/admin/eventos/${e.id}`} className="flex items-center gap-3 py-3 hover:bg-surface">
        <span className="w-24 shrink-0 font-mono text-xs tabular-nums text-ink-muted">{formatDateTime(e.startsAt)}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-ink">{e.title}</span>
          <span className="meta">
            {EVENT_KIND_LABEL[e.kind]}
            {e.game && ` · ${GAME_INFO[e.game].short}`}
            {!e.published && <span className="!text-warn"> · oculto</span>}
          </span>
        </span>
      </Link>
    </li>
  );

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="display text-2xl sm:text-3xl">Eventos</h1>
        <ButtonLink href="/admin/eventos/novo"><Plus /> Novo</ButtonLink>
      </div>
      <section>
        <h2 className="meta mb-2">Próximos</h2>
        {upcoming.length ? <ul className="border-t border-line">{upcoming.map((e) => <Row key={e.id} e={e} />)}</ul> : <p className="text-sm text-ink-muted">Nada agendado.</p>}
      </section>
      {past.length > 0 && (
        <section>
          <h2 className="meta mb-2">Já aconteceram</h2>
          <ul className="border-t border-line opacity-70">{past.map((e) => <Row key={e.id} e={e} />)}</ul>
        </section>
      )}
    </div>
  );
}
