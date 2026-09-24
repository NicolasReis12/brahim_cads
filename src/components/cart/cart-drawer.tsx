"use client";

import { ArrowLeft, CreditCard, MessageCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { validateCart } from "@/app/actions/cart";
import { Button, ButtonA, ButtonLink } from "@/components/ui/button";
import { Field, Input, Segmented } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import { LanguageTag } from "@/components/ui/tags";
import { formatBRL, formatCep, isValidCep } from "@/lib/format";
import type { DeliveryMethod } from "@/lib/types";
import { generalWhatsappUrl, orderWhatsappUrl } from "@/lib/whatsapp";
import { cart, cartDrawer, cartTotals, useCart, useCartDrawerOpen } from "./cart-store";
import { QuantityStepper } from "./quantity";

const CUSTOMER_KEY = "bc:customer:v1";
function savedCustomer(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMER_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function CartDrawer({ onlineCheckout }: { onlineCheckout: boolean }) {
  const open = useCartDrawerOpen();
  const items = useCart();
  const { count, subtotalCents } = cartTotals(items);
  const [step, setStep] = useState<"cart" | "whatsapp" | "sent">("cart");
  const validatedFor = useRef<string>("");

  // Ao abrir, confere estoque/preço atuais e ajusta o carrinho salvo.
  useEffect(() => {
    if (!open || !items.length) return;
    const key = items.map((i) => i.productId).sort().join(",");
    if (validatedFor.current === key) return;
    validatedFor.current = key;
    validateCart(items.map((i) => i.productId))
      .then(cart.sync)
      .catch(() => {});
  }, [open, items]);

  const onOpenChange = (v: boolean) => {
    cartDrawer.set(v);
    if (!v) setTimeout(() => setStep((s) => (s === "sent" ? "sent" : "cart")), 300);
  };

  const title = step === "whatsapp" ? "Finalizar no WhatsApp" : step === "sent" ? "Pedido enviado" : "Carrinho";
  const description =
    step === "cart" && count > 0 ? `${count} ${count === 1 ? "item" : "itens"} · ${formatBRL(subtotalCents)}` : undefined;

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        step === "cart" && items.length > 0 ? (
          <div className="flex flex-col gap-2">
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-sm text-ink-muted">Subtotal</span>
              <span className="font-display text-xl font-bold tabular-nums" style={{ fontVariationSettings: '"wdth" 112' }}>
                {formatBRL(subtotalCents)}
              </span>
            </div>
            <p className="meta mb-1 normal-case">Frete calculado no fechamento. Retirada na loja é grátis.</p>
            {onlineCheckout && (
              <ButtonLink href="/checkout" size="lg" onClick={() => cartDrawer.set(false)}>
                <CreditCard /> Pagar online · Pix ou cartão
              </ButtonLink>
            )}
            <Button
              size="lg"
              variant={onlineCheckout ? "secondary" : "primary"}
              onClick={() => setStep("whatsapp")}
            >
              <MessageCircle /> Finalizar pelo WhatsApp
            </Button>
          </div>
        ) : null
      }
    >
      {step === "sent" ? (
        <SentStep onDone={() => setStep("cart")} />
      ) : step === "whatsapp" ? (
        <WhatsappStep onBack={() => setStep("cart")} onSent={() => setStep("sent")} />
      ) : items.length === 0 ? (
        <EmptyCart />
      ) : (
        <ul className="divide-y divide-line">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-3 px-4 py-3">
              <Link
                href={`/produto/${item.slug}`}
                onClick={() => cartDrawer.set(false)}
                className="relative size-18 shrink-0 overflow-hidden rounded-xs border border-line bg-sunken"
              >
                {item.image ? (
                  <Image src={item.image} alt="" fill sizes="72px" className="object-cover" />
                ) : (
                  <span className="grid size-full place-items-center meta">sem foto</span>
                )}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/produto/${item.slug}`}
                    onClick={() => cartDrawer.set(false)}
                    className="line-clamp-2 text-sm leading-snug text-ink hover:underline"
                  >
                    {item.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => cart.remove(item.productId)}
                    className="-mr-1 -mt-1 grid size-8 shrink-0 place-items-center rounded-sm text-ink-subtle hover:bg-raised hover:text-ink"
                    aria-label={`Remover ${item.name}`}
                  >
                    <Trash2 size={15} strokeWidth={1.75} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {item.language && <LanguageTag language={item.language} />}
                  {item.preorder && <span className="meta !text-violet">pré-venda</span>}
                  <span className="meta">{formatBRL(item.priceCents)} {item.unitLabel ?? "cada"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <QuantityStepper
                    size="sm"
                    label={`Quantidade de ${item.name}`}
                    value={item.qty}
                    max={item.maxQty}
                    onChange={(v) => cart.setQty(item.productId, v)}
                  />
                  <span className="font-mono text-sm tabular-nums">{formatBRL(item.priceCents * item.qty)}</span>
                </div>
                {item.qty >= item.maxQty && (
                  <p className="meta normal-case !text-warn">Máximo disponível em estoque</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-start gap-4 px-4 py-10">
      <p className="display text-2xl">Carrinho vazio</p>
      <p className="text-sm text-ink-muted">
        Dá uma olhada no que chegou ou chama no WhatsApp se estiver procurando algo específico.
      </p>
      <div className="flex flex-wrap gap-2">
        <ButtonLink href="/loja" onClick={() => cartDrawer.set(false)}>
          Ver a loja
        </ButtonLink>
        <ButtonA href={generalWhatsappUrl()} variant="whatsapp" target="_blank" rel="noopener">
          <MessageCircle /> WhatsApp
        </ButtonA>
      </div>
    </div>
  );
}

function WhatsappStep({ onBack, onSent }: { onBack: () => void; onSent: () => void }) {
  const items = useCart();
  // Só renderiza no cliente (dentro do drawer aberto), então dá pra ler o localStorage na inicialização
  const [name, setName] = useState(() => savedCustomer().name ?? "");
  const [cep, setCep] = useState(() => savedCustomer().cep ?? "");
  const [delivery, setDelivery] = useState<DeliveryMethod>(() => (savedCustomer().delivery as DeliveryMethod) ?? "envio");
  const [errors, setErrors] = useState<{ name?: string; cep?: string }>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = "Coloca seu nome pra gente saber quem é";
    if (delivery === "envio" && !isValidCep(cep)) next.cep = "CEP precisa ter 8 números";
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify({ name, cep, delivery }));
    } catch {}
    const url = orderWhatsappUrl({
      lines: items.map((i) => ({ name: i.name, language: i.language, priceCents: i.priceCents, qty: i.qty })),
      name,
      cep,
      delivery,
    });
    window.open(url, "_blank", "noopener");
    onSent();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 px-4 py-4" noValidate>
      <button type="button" onClick={onBack} className="-ml-1 inline-flex w-fit items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft size={16} /> Voltar ao carrinho
      </button>
      <p className="text-sm text-ink-muted">
        A gente monta a mensagem com o pedido e abre o WhatsApp. Lá você confirma frete e forma de pagamento com o Guilherme.
      </p>
      <Field label="Seu nome" htmlFor="wa-name" error={errors.name}>
        <Input
          id="wa-name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!errors.name}
        />
      </Field>
      <div className="flex flex-col gap-1.5">
        <span className="text-[0.8125rem] font-medium text-ink-muted">Entrega</span>
        <Segmented
          name="wa-delivery"
          value={delivery}
          onChange={setDelivery}
          options={[
            { value: "envio", label: "Envio pelos Correios", hint: "PAC ou SEDEX" },
            { value: "retirada", label: "Retirar na loja", hint: "Grátis · Juiz de Fora" },
          ]}
        />
      </div>
      {delivery === "envio" && (
        <Field label="CEP" htmlFor="wa-cep" error={errors.cep}>
          <Input
            id="wa-cep"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="00000-000"
            value={cep}
            onChange={(e) => setCep(formatCep(e.target.value))}
            aria-invalid={!!errors.cep}
          />
        </Field>
      )}
      <Button type="submit" size="lg" className="mt-1">
        <MessageCircle /> Abrir WhatsApp com o pedido
      </Button>
    </form>
  );
}

function SentStep({ onDone }: { onDone: () => void }) {
  return (
    <div className="flex flex-col gap-4 px-4 py-8">
      <p className="display text-2xl">Mensagem pronta</p>
      <p className="text-sm text-ink-muted">
        O WhatsApp abriu numa nova aba com o pedido. É só enviar — a gente responde com o frete e o Pix.
        Se o WhatsApp não abriu, volta e tenta de novo.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            cart.clear();
            cartDrawer.set(false);
            onDone();
          }}
        >
          Enviei, pode esvaziar o carrinho
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Voltar ao carrinho
        </Button>
      </div>
    </div>
  );
}
