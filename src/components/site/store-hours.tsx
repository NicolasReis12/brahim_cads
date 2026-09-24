import { STORE } from "@/config/store";

export function StoreHours() {
  if (!STORE.hours.length) {
    return <p className="text-sm text-ink-muted">Confirme o horário do balcão pelo WhatsApp antes de passar.</p>;
  }
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
      {STORE.hours.map((h) => (
        <div key={h.days} className="contents">
          <dt className="text-ink-muted">{h.days}</dt>
          <dd className="font-mono tabular-nums text-ink">{h.hours}</dd>
        </div>
      ))}
    </dl>
  );
}

export const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(STORE.mapsQuery)}`;
export const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(STORE.mapsQuery)}&output=embed`;
