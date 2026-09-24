import type { Metadata } from "next";
import Link from "next/link";
import { EventForm } from "@/components/admin/event-form";

export const metadata: Metadata = { title: "Novo evento" };

export default function NewEventPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link href="/admin/eventos" className="meta hover:text-ink">← Eventos</Link>
        <h1 className="display mt-2 text-2xl sm:text-3xl">Novo evento</h1>
      </div>
      <EventForm />
    </div>
  );
}