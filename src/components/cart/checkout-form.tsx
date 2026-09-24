"use client";

import { Lock, Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { quoteShipping, startCheckout } from "@/app/actions/checkout";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Segmented } from "@/components/ui/form";
import type { ShippingQuote } from "@/config/shipping";
import { formatBRL, formatCep, isValidCep } from "@/lib/format";
import type { DeliveryMethod } from "@/lib/types";
import { cart, cartTotals, useCart } from "./cart-store";

const CUSTOMER_KEY = "bc:customer:v1";
function savedCustomer(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMER_KEY) ?? "{}");
  } catch {
    return {};
  }
}

type Addr = { street: string; number: string; complement: string; district: string; city: string };

export function CheckoutForm() {
  const items = useCart();
  const { subtotalCents } = cartTotals(items);
  const [pending, startTransition] = useTransition();

  // O formulário só aparece no cliente (carrinho vem do localStorage), então lê os dados salvos direto
  const [name, setName] = useState(() => savedCustomer().name ?? "");
  const [email, setEmail] = useState(() => savedCustomer().email ?? "");
  const [phone, setPhone] = useState(() => savedCustomer().phone ?? "");
  const [delivery, setDelivery] = useState<DeliveryMethod>("envio");
  const [cep, setCep] = useState(() => savedCustomer().cep ?? "");
  const [addr, setAddr] = useState<Addr>({ street: "", number: "", complement: "", district: "", city: "" });
  const [quoted, setQuoted] = useState<{ cep: string; quote: ShippingQuote | null }>({ cep: "", quote: null });
  const quote = quoted.cep === cep.replace(/\D/g, "") ? quoted.quote : null;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);


  // CEP completo: cota o frete e tenta preencher o endereço pelo ViaCEP
  useEffect(() => {
    if (!isValidCep(cep)) return;
    let alive = true;
    const digits = cep.replace(/\D/g, "");
    quoteShipping(digits, subtotalCents).then((q) => alive && setQuoted({ cep: digits, quote: q }));
    fetch(`https://viacep.com.br/ws/${digits}/json/`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive || d.erro) return;
        setAddr((a) => ({
          ...a,
          street: a.street || d.logradouro || "",
          district: a.district || d.bairro || "",
          city: `${d.localidade}/${d.uf}`,
        }));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [cep, subtotalCents]);

  if (!items.length) {
    return (
      <div className="flex flex-col items-start gap-4 py-10">
        <p className="text-ink-muted">Seu carrinho está vazio.</p>
        <ButtonLink href="/loja">Ver a loja</ButtonLink>
      </div>
    );
  }

  const shippingCents = delivery === "envio" ? (quote?.cents ?? null) : 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify({ name, email, phone, cep, delivery }));
    } catch {}
    const address = [
      `${addr.street}, ${addr.number}`,
      addr.complement,
      addr.district,
      addr.city,
    ]
      .map((s) => s.trim())
      .filter((s) => s && s !== ",")
      .join(" · ");

    startTransition(async () => {
      const res = await startCheckout({
        name,
        email,
        phone,
        delivery,
        cep,
        address: addr.street && addr.number ? address : "",
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
      });
      if (res.ok) {
        window.location.assign(res.url);
        return;
      }
      setErrors(res.fieldErrors ?? {});
      setFormError(res.error);
      if (res.stock) {
        cart.sync(
          res.stock.map((s) => ({
            productId: s.productId,
            maxQty: s.maxQty,
            priceCents: items.find((i) => i.productId === s.productId)!.priceCents,
          })),
        );
      }
    });
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-10 py-8 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
      <div className="flex flex-col gap-8">
        <fieldset className="flex flex-col gap-4">
          <legend className="meta mb-4">Seus dados</legend>
          <Field label="Nome completo" htmlFor="co-name" error={errors.name}>
            <Input id="co-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="E-mail" htmlFor="co-email" error={errors.email} hint="Pro comprovante do Mercado Pago">
              <Input id="co-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} />
            </Field>
            <Field label="WhatsApp" htmlFor="co-phone" error={errors.phone} hint="Com DDD, pra avisar do envio">
              <Input id="co-phone" type="tel" inputMode="tel" autoComplete="tel-national" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!errors.phone} />
            </Field>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="meta mb-4">Entrega</legend>
          <Segmented
            name="co-delivery"
            value={delivery}
            onChange={setDelivery}
            options={[
              { value: "envio", label: "Correios", hint: "PAC ou SEDEX, com rastreio" },
              { value: "retirada", label: "Retirar na loja", hint: "Grátis · Juiz de Fora" },
            ]}
          />
          {delivery === "envio" && (
            <>
              <Field
                label="CEP"
                htmlFor="co-cep"
                error={errors.cep}
                hint={quote ? `${quote.label} · ${formatBRL(quote.cents)} · ${quote.days}` : undefined}
              >
                <Input
                  id="co-cep"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="00000-000"
                  value={cep}
                  onChange={(e) => setCep(formatCep(e.target.value))}
                  aria-invalid={!!errors.cep}
                  className="max-w-40 font-mono"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
                <Field label="Rua" htmlFor="co-street" error={errors.address}>
                  <Input id="co-street" autoComplete="address-line1" value={addr.street} onChange={(e) => setAddr({ ...addr, street: e.target.value })} aria-invalid={!!errors.address} />
                </Field>
                <Field label="Número" htmlFor="co-number">
                  <Input id="co-number" inputMode="numeric" value={addr.number} onChange={(e) => setAddr({ ...addr, number: e.target.value })} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Complemento" htmlFor="co-comp">
                  <Input id="co-comp" autoComplete="address-line2" value={addr.complement} onChange={(e) => setAddr({ ...addr, complement: e.target.value })} />
                </Field>
                <Field label="Bairro" htmlFor="co-district">
                  <Input id="co-district" value={addr.district} onChange={(e) => setAddr({ ...addr, district: e.target.value })} />
                </Field>
                <Field label="Cidade/UF" htmlFor="co-city">
                  <Input id="co-city" autoComplete="address-level2" value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} />
                </Field>
              </div>
            </>
          )}
        </fieldset>
      </div>

      <aside aria-label="Resumo do pedido" className="flex flex-col gap-4 self-start border border-line bg-surface p-4 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
        <h2 className="meta">Resumo</h2>
        <ul className="flex flex-col gap-3">
          {items.map((i) => (
            <li key={i.productId} className="flex items-center gap-3">
              <div className="relative size-12 shrink-0 overflow-hidden border border-line bg-sunken">
                {i.image && <Image src={i.image} alt="" fill sizes="48px" className="object-cover" />}
              </div>
              <span className="line-clamp-2 flex-1 text-sm">
                <span className="font-mono text-ink-subtle">{i.qty}×</span> {i.name}
              </span>
              <span className="font-mono text-sm tabular-nums">{formatBRL(i.priceCents * i.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="flex flex-col gap-1.5 border-t border-line pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-muted">Subtotal</dt>
            <dd className="font-mono tabular-nums">{formatBRL(subtotalCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Frete</dt>
            <dd className="font-mono tabular-nums">
              {shippingCents === null ? "informe o CEP" : shippingCents === 0 ? "grátis" : formatBRL(shippingCents)}
            </dd>
          </div>
          <div className="mt-2 flex items-baseline justify-between border-t border-line pt-3">
            <dt className="font-medium">Total</dt>
            <dd className="font-display text-2xl font-bold tabular-nums" style={{ fontVariationSettings: '"wdth" 112' }}>
              {formatBRL(subtotalCents + (shippingCents ?? 0))}
            </dd>
          </div>
        </dl>
        {formError && (
          <p role="alert" className="border-l-2 border-danger pl-3 text-sm text-ink">
            {formError}
          </p>
        )}
        <Button type="submit" size="lg" disabled={pending || (delivery === "envio" && shippingCents === null)}>
          {pending ? <Loader2 className="animate-spin motion-reduce:animate-none" /> : <Lock />}
          {pending ? "Abrindo pagamento…" : "Pagar com Pix ou cartão"}
        </Button>
        <p className="meta normal-case">
          Você vai pro Mercado Pago pra pagar. O estoque é baixado assim que o pagamento é confirmado.
        </p>
      </aside>
    </form>
  );
}
