# Brahim Cards — loja online

Loja da Brahim Cards (Juiz de Fora - MG): catálogo com estoque visível, carrinho, finalização pelo WhatsApp
ou pagamento online (Mercado Pago), e painel pro dono gerenciar produtos, estoque, vendas e eventos pelo celular.

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Supabase · Motion · Radix (só acessibilidade).

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # dá pra deixar o Supabase em branco
npm run dev
```

Sem as variáveis do Supabase o site roda em **modo local**: os dados iniciais vêm de
`src/lib/data/seed.ts` e as alterações feitas no painel ficam em `.data/demo-db.json`
(apague o arquivo pra voltar ao estado inicial). O painel fica em `/admin` e entra com a senha
de `ADMIN_DEMO_PASSWORD`. O modo local é só pra desenvolvimento.

## Colocar no ar (Supabase + Vercel)

1. Crie um projeto no Supabase.
2. No SQL Editor, rode `supabase/migrations/0001_init.sql` e depois `supabase/seed.sql`.
3. Em Authentication > Users, crie o usuário do Guilherme (e-mail e senha) e libere o acesso ao painel:
   ```sql
   insert into admins (user_id) select id from auth.users where email = 'email-do-guilherme@...';
   ```
4. Na Vercel, configure `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `SUPABASE_SECRET_KEY`. Não defina `ADMIN_DEMO_PASSWORD` em produção.

Fotos enviadas pelo painel vão pro bucket público `product-images` (criado pela migração).
O navegador reduz as fotos pra no máximo 1600 px em WebP antes de enviar.

### Checkout online (Mercado Pago Checkout Pro)

Fica desligado até você configurar:

```
ONLINE_CHECKOUT_ENABLED=true
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
MERCADOPAGO_WEBHOOK_SECRET=...     # Suas integrações > Webhooks > assinatura secreta
```

No painel do Mercado Pago, cadastre o webhook `https://SEU-DOMINIO/api/webhooks/mercadopago` com o
evento **Pagamentos**. O fluxo:

1. O cliente preenche os dados em `/checkout`. O servidor confere preço e estoque no banco (o carrinho
   do navegador não vale como fonte), cria o pedido `pendente` e abre o Checkout Pro (Pix e cartão).
2. O webhook reconsulta o pagamento na API do Mercado Pago. Se ele foi aprovado, marca o pedido como `pago` e
   baixa o estoque, uma vez só (`mark_order_paid` é idempotente).
3. A página `/pedido/[id]` também confere o `payment_id` na volta do Mercado Pago, caso o webhook atrase.

O estoque só é baixado quando o pagamento é aprovado. Se o último item for vendido no balcão enquanto
alguém paga online, o estoque fica em zero e o pedido aparece como pago no painel, pra vocês resolverem com
o cliente.

**Frete:** a tabela fixa por região fica em `src/config/shipping.ts`. **Os valores atuais são só de
exemplo: ajuste antes de ligar o checkout.** Pra usar o Melhor Envio, crie outro `ShippingProvider` e troque
em `getShippingProvider()`.

As variáveis de ambiente são lidas no build: depois de mudar alguma, faça um novo deploy.

## O que ajustar antes de publicar

- **Horário do balcão:** em `src/config/store.ts` (`hours`). Enquanto estiver vazio, o site pede pra
  confirmar o horário pelo WhatsApp.
- **Eventos:** os três do seed são exemplos. Troque pela agenda real no painel.
- **Frete:** veja acima.
- **Texto do "Sobre":** está em primeira pessoa, com base na história do site antigo. Vale o Guilherme revisar.
- **Produtos de One Piece:** os 3 são rascunhos de exemplo. Edite e publique pelo painel.
- **Toploader e playmat:** estão sem foto e aparecem com um placeholder até alguém enviar a foto.

## Estrutura

```
src/app/(site)/        páginas da loja (home, /loja, /pokemon, /lorcana, /one-piece, /produto/[slug], ...)
src/app/admin/         painel: login, produtos, registrar venda, pedidos, eventos + server actions
src/app/api/webhooks/  webhook do Mercado Pago
src/components/        ui (design system), catalog, cart, site, admin
src/lib/data/          Repository com duas implementações: supabase.ts e local.ts
src/lib/catalog*.ts    regras de estoque/status e filtros sincronizados com a URL
src/config/            dados da loja, FAQ, frete
supabase/              migração SQL (schema, RLS, funções de estoque) e seed
```

## Design system

Os tokens ficam em `src/app/globals.css`, com cores em OKLCH. O fundo é grafite quente. A cor de ação
é o dourado do logo, e o roxo aparece só na pré-venda. Cada jogo tem seu acento (`--game-pokemon`,
`--game-lorcana`, `--game-one-piece`), que só é usado em etiquetas, filtros ativos e detalhes.

- **Display:** Archivo expandida (`.display`). **Texto:** Instrument Sans. **Metadados:** IBM Plex Mono (`.meta`).
- **Único efeito:** o reflexo holográfico (`.holo`) na foto do produto. Só aparece no hover com mouse e
  respeita `prefers-reduced-motion`.

### Fontes

`src/fonts/archivo-display.woff2` é a Archivo (OFL) recortada nos eixos usados. Isso faz o título carregar
rápido e segura o LCP. Pra regenerar:

```bash
pip install fonttools brotli
fonttools varLib.instancer "Archivo[wdth,wght].ttf" wdth=112:125 wght=700:800 -o archivo-part.ttf
pyftsubset archivo-part.ttf --unicodes="U+0020-007E,U+00A0-00FF,U+2013-2014,U+2018-201D,U+2022,U+2026,U+2192,U+20AC" \
  --layout-features='kern,liga,calt,tnum,lnum' --flavor=woff2 --output-file=src/fonts/archivo-display.woff2
```

## Scripts

- `npm run dev` / `npm run build` / `npm start`
- `npm run lint` / `npm run typecheck`
- `npm run db:seed-sql` regenera `supabase/seed.sql` a partir de `src/lib/data/seed.ts`
