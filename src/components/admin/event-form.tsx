"use client";

import { useActionState, useState } from "react";
import { deleteEventAction, saveEventAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { EVENT_KIND_LABEL, GAME_INFO } from "@/lib/catalog";
import { centsToInput } from "@/lib/format";
import { EVENT_KINDS, GAMES, type StoreEvent } from "@/lib/types";

function splitDate(iso?: string) {
  if (!iso) return { date: "", time: "19:00" };
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  const time = d.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" });
  return { date, time };
}

export function EventForm({ event }: { event?: StoreEvent }) {
  const [state, action, pending] = useActionState(saveEventAction, null);
  const [confirm, setConfirm] = useState(false);
  const fe = state?.fieldErrors ?? {};
  const { date, time } = splitDate(event?.startsAt);

  return (
    <form action={action} className="flex flex-col gap-4">
      {event && <input type="hidden" name="id" value={event.id} />}
      <Field label="Título" htmlFor="title" error={fe.title}>
        <Input id="title" name="title" defaultValue={event?.title} placeholder="Liga Pokémon TCG" required />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tipo" htmlFor="kind">
          <Select id="kind" name="kind" defaultValue={event?.kind ?? "liga"}>
            {EVENT_KINDS.map((k) => <option key={k} value={k}>{EVENT_KIND_LABEL[k]}</option>)}
          </Select>
        </Field>
        <Field label="Jogo" htmlFor="game">
          <Select id="game" name="game" defaultValue={event?.game ?? ""}>
            <option value="">Vários</option>
            {GAMES.map((g) => <option key={g} value={g}>{GAME_INFO[g].short}</option>)}
          </Select>
        </Field>
        <Field label="Data" htmlFor="date" error={fe.date}>
          <Input id="date" name="date" type="date" defaultValue={date} required />
        </Field>
        <Field label="Hora" htmlFor="time" error={fe.time}>
          <Input id="time" name="time" type="time" defaultValue={time} required />
        </Field>
        <Field label="Inscrição (R$)" htmlFor="fee" error={fe.fee} hint="Vazio = entrada livre">
          <Input id="fee" name="fee" inputMode="decimal" defaultValue={event?.entryFeeCents ? centsToInput(event.entryFeeCents) : ""} className="font-mono" />
        </Field>
      </div>
      <Field label="Descrição" htmlFor="description">
        <Textarea id="description" name="description" defaultValue={event?.description} rows={3} />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={event?.published ?? true} className="size-4 accent-[var(--gold)]" />
        Mostrar no site
      </label>
      {state?.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="lg" disabled={pending}>{pending ? "Salvando…" : "Salvar evento"}</Button>
        {event &&
          (confirm ? (
            <>
              <Button variant="secondary" className="text-danger" onClick={() => deleteEventAction(event.id)}>Confirmar exclusão</Button>
              <Button variant="ghost" onClick={() => setConfirm(false)}>Cancelar</Button>
            </>
          ) : (
            <Button variant="ghost" className="text-danger" onClick={() => setConfirm(true)}>Apagar</Button>
          ))}
      </div>
    </form>
  );
}
