"use client";

import { clsx } from "clsx";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { deleteProductAction, saveProductAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { GAME_INFO, LANGUAGE_LABEL, TYPE_LABEL } from "@/lib/catalog";
import { centsToInput } from "@/lib/format";
import { GAMES, LANGUAGES, PRODUCT_TYPES, type Availability, type Product } from "@/lib/types";
import { ImageManager } from "./image-manager";

function Toggle({ name, label, hint, defaultChecked }: { name: string; label: string; hint: string; defaultChecked: boolean }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 border border-line p-3 has-[:checked]:border-gold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span aria-hidden className="relative mt-0.5 h-5 w-9 shrink-0 rounded-full bg-line-strong transition-colors peer-checked:bg-gold after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-ink after:transition-transform peer-checked:after:translate-x-4 peer-checked:after:bg-on-gold" />
      <span className="flex flex-col">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="text-xs text-ink-subtle">{hint}</span>
      </span>
    </label>
  );
}

export function ProductForm({ product, collections, saved }: { product?: Product; collections: string[]; saved?: boolean }) {
  const [state, action, pending] = useActionState(saveProductAction, saved ? { ok: true, message: "Produto criado." } : null);
  const [availability, setAvailability] = useState<Availability>(product?.availability ?? "pronta-entrega");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fe = state?.fieldErrors ?? {};

  return (
    <form action={action} className="flex flex-col gap-8 pb-24 lg:pb-8">
      {product && <input type="hidden" name="id" value={product.id} />}

      <section className="flex flex-col gap-4">
        <h2 className="meta">Fotos</h2>
        <ImageManager initial={product?.images ?? []} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="meta">Produto</h2>
        <Field label="Nome" htmlFor="name" error={fe.name} hint="Sem o idioma no nome — ele vai no campo próprio">
          <Input id="name" name="name" defaultValue={product?.name} required aria-invalid={!!fe.name} />
        </Field>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Field label="Jogo" htmlFor="game">
            <Select id="game" name="game" defaultValue={product?.game ?? ""}>
              <option value="">Acessório</option>
              {GAMES.map((g) => (
                <option key={g} value={g}>{GAME_INFO[g].label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Tipo" htmlFor="type">
            <Select id="type" name="type" defaultValue={product?.type ?? "booster"}>
              {PRODUCT_TYPES.map((t) => (
                <option key={t} value={t}>{TYPE_LABEL[t]}</option>
              ))}
            </Select>
          </Field>
          <Field label="Idioma" htmlFor="language">
            <Select id="language" name="language" defaultValue={product ? (product.language ?? "") : "BR"}>
              <option value="">Não se aplica</option>
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>{l} · {LANGUAGE_LABEL[l]}</option>
              ))}
            </Select>
          </Field>
          <Field label="Coleção" htmlFor="collection" className="col-span-2 sm:col-span-3">
            <Input id="collection" name="collection" defaultValue={product?.collection ?? ""} list="collections" placeholder="Ex.: Escuridão Absoluta" />
            <datalist id="collections">
              {collections.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
        </div>
        <Field label="Conteúdo da embalagem" htmlFor="packageContents" hint='Ex.: "36 boosters de 10 cartas"'>
          <Input id="packageContents" name="packageContents" defaultValue={product?.packageContents ?? ""} />
        </Field>
        <Field label="Descrição" htmlFor="description">
          <Textarea id="description" name="description" rows={4} defaultValue={product?.description ?? ""} />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="meta">Preço e estoque</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Preço à vista (R$)" htmlFor="price" error={fe.price}>
            <Input id="price" name="price" inputMode="decimal" defaultValue={product ? centsToInput(product.priceCents) : ""} placeholder="52,00" className="font-mono" required aria-invalid={!!fe.price} />
          </Field>
          <Field label="Rótulo do preço" htmlFor="unitLabel" hint='Opcional, ex.: "a unidade"'>
            <Input id="unitLabel" name="unitLabel" defaultValue={product?.unitLabel ?? ""} />
          </Field>
          <Field label="Status" htmlFor="availability">
            <Select id="availability" name="availability" value={availability} onChange={(e) => setAvailability(e.target.value as Availability)}>
              <option value="pronta-entrega">Pronta entrega</option>
              <option value="pre-venda">Pré-venda</option>
              <option value="esgotado">Esgotado</option>
            </Select>
          </Field>
          <Field
            label={availability === "pre-venda" ? "Vagas de reserva" : "Estoque"}
            htmlFor="stock"
            error={fe.stock}
            hint={availability === "pre-venda" ? "Limite de unidades na pré-venda" : "Zerado aparece como esgotado"}
          >
            <Input id="stock" name="stock" type="number" inputMode="numeric" min={0} defaultValue={product?.stock ?? 0} className="font-mono" aria-invalid={!!fe.stock} />
          </Field>
          <Field label="Previsão de chegada" htmlFor="preorderEta" error={fe.preorderEta} className={clsx(availability !== "pre-venda" && "hidden")}>
            <Input id="preorderEta" name="preorderEta" type="date" defaultValue={product?.preorderEta ?? ""} />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="meta">Visibilidade</h2>
        <Toggle name="published" label="Publicado" hint="Desligado = rascunho, só aparece aqui no painel" defaultChecked={product?.published ?? true} />
        <Toggle name="featured" label="Destaque na home" hint="Aparece em “Em destaque no balcão”" defaultChecked={product?.featured ?? false} />
        <Field label="Endereço da página (slug)" htmlFor="slug" error={fe.slug} hint="Deixa em branco pra gerar pelo nome">
          <Input id="slug" name="slug" defaultValue={product?.slug ?? ""} className="font-mono text-sm" />
        </Field>
      </section>

      {/* Barra de salvar fixa no celular, acima da navegação inferior */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 flex items-center gap-3 border-t border-line bg-surface px-4 py-3 lg:static lg:border-0 lg:bg-transparent lg:p-0">
        <Button type="submit" size="lg" disabled={pending} className="flex-1 lg:flex-none">
          {pending ? "Salvando…" : "Salvar produto"}
        </Button>
        {state?.error ? (
          <p role="alert" className="text-sm text-danger">{state.error}</p>
        ) : state?.ok ? (
          <p role="status" className="text-sm text-ok">
            {state.message}{" "}
            {product?.published && (
              <Link href={`/produto/${product.slug}`} target="_blank" className="underline underline-offset-2">Ver na loja</Link>
            )}
          </p>
        ) : null}
      </div>

      {product && (
        <section className="border-t border-line pt-6">
          {confirmDelete ? (
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm text-ink-muted">Apagar de vez? Pedidos antigos continuam com o nome.</p>
              <Button variant="secondary" className="border-danger text-danger" onClick={() => deleteProductAction(product.id)}>
                Sim, apagar
              </Button>
              <Button variant="ghost" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
            </div>
          ) : (
            <Button variant="ghost" className="text-danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 /> Apagar produto
            </Button>
          )}
          <p className="mt-2 text-xs text-ink-subtle">Dica: pra tirar da loja sem perder o cadastro, desliga “Publicado”.</p>
        </section>
      )}
    </form>
  );
}
