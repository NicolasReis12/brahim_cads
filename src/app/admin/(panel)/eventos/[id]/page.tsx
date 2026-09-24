import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventForm } from "@/components/admin/event-form";
import { repo } from "@/lib/data";

export const metadata: Metadata = { title: "Editar evento" };

export default async function EditEventPage(props: PageProps<"/admin/eventos/[id]">) {
  const { id } = await props.params;
  const event = await repo.getEvent(id);
  if (!event) notFound();
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link href="/admin/eventos" className="meta hover:text-ink">← Eventos</Link>
        <h1 className="display mt-2 text-2xl sm:text-3xl">Editar evento</h1>
      </div>
      <EventForm event={event} />
    </div>
  );
}