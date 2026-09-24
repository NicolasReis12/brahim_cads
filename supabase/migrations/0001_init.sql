-- Brahim Cards — schema inicial
-- Rode no SQL Editor do Supabase (ou `supabase db push`).

create extension if not exists pgcrypto;

-- Tipos -----------------------------------------------------------------------

create type game as enum ('pokemon', 'lorcana', 'one-piece');
create type product_type as enum (
  'booster', 'blister-unitario', 'blister-triplo', 'blister-quadruplo', 'booster-box',
  'etb', 'box-colecao', 'combo', 'deck', 'colecionavel', 'acessorio'
);
create type card_language as enum ('BR', 'ING', 'JAP', 'CHN');
create type availability as enum ('pronta-entrega', 'pre-venda', 'esgotado');
create type order_status as enum ('pendente', 'pago', 'enviado', 'entregue', 'cancelado');
create type order_channel as enum ('online', 'whatsapp', 'balcao');
create type delivery_method as enum ('envio', 'retirada');
create type event_kind as enum ('liga', 'campeonato', 'pre-release', 'encontro');

-- Admins ----------------------------------------------------------------------
-- Crie o usuário em Authentication > Users e depois:
--   insert into admins (user_id) select id from auth.users where email = 'guilherme@...';

create table admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- Produtos --------------------------------------------------------------------

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  game game,
  type product_type not null,
  language card_language,
  collection text,
  price_cents integer not null check (price_cents >= 0),
  unit_label text,
  package_contents text,
  description text not null default '',
  images text[] not null default '{}',
  stock integer not null default 0 check (stock >= 0),
  availability availability not null default 'pronta-entrega',
  preorder_eta date,
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_game_idx on products (game) where published;
create index products_created_idx on products (created_at desc);

create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger products_touch before update on products
for each row execute function touch_updated_at();

-- Movimentações de estoque (histórico de ajustes e vendas)
create table stock_movements (
  id bigint generated always as identity primary key,
  product_id uuid not null references products (id) on delete cascade,
  delta integer not null,
  reason text not null,
  order_id uuid,
  created_at timestamptz not null default now()
);

-- Pedidos ---------------------------------------------------------------------

create sequence order_number_seq start 1001;

create table orders (
  id uuid primary key default gen_random_uuid(),
  number integer not null unique default nextval('order_number_seq'),
  status order_status not null default 'pendente',
  channel order_channel not null,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  cep text,
  address text,
  delivery_method delivery_method not null,
  shipping_cents integer not null default 0,
  subtotal_cents integer not null,
  total_cents integer not null,
  notes text,
  payment_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index orders_created_idx on orders (created_at desc);

create table order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid references products (id) on delete set null,
  name text not null,
  unit_price_cents integer not null,
  quantity integer not null check (quantity > 0)
);

create index order_items_order_idx on order_items (order_id);

-- Eventos ---------------------------------------------------------------------

create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind event_kind not null,
  game game,
  starts_at timestamptz not null,
  description text not null default '',
  entry_fee_cents integer,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index events_starts_idx on events (starts_at);

-- Funções de estoque ----------------------------------------------------------

-- Ajuste manual (+/-) com piso zero. Retorna o novo estoque.
create or replace function adjust_stock(p_product_id uuid, p_delta integer, p_reason text)
returns integer language plpgsql security definer set search_path = public as $$
declare new_stock integer;
begin
  if not (is_admin() or auth.role() = 'service_role') then
    raise exception 'forbidden';
  end if;
  update products set stock = greatest(0, stock + p_delta)
    where id = p_product_id returning stock into new_stock;
  insert into stock_movements (product_id, delta, reason) values (p_product_id, p_delta, p_reason);
  return new_stock;
end $$;

-- Confirma pagamento e baixa estoque uma única vez (idempotente: webhooks repetem).
create or replace function mark_order_paid(p_order_id uuid, p_payment_id text)
returns boolean language plpgsql security definer set search_path = public as $$
declare changed boolean;
begin
  if auth.role() <> 'service_role' then
    raise exception 'forbidden';
  end if;
  update orders set status = 'pago', paid_at = now(), payment_id = p_payment_id
    where id = p_order_id and paid_at is null
    returning true into changed;
  if changed is null then
    return false;
  end if;
  update products p set stock = greatest(0, p.stock - i.quantity)
    from order_items i where i.order_id = p_order_id and i.product_id = p.id;
  insert into stock_movements (product_id, delta, reason, order_id)
    select product_id, -quantity, 'venda_online', p_order_id
    from order_items where order_id = p_order_id and product_id is not null;
  return true;
end $$;

-- Venda do WhatsApp/balcão: cria pedido pago e baixa estoque numa transação.
-- p_lines: [{ "product_id": uuid, "quantity": int, "unit_price_cents": int|null }]
create or replace function record_sale(p_channel order_channel, p_customer text, p_notes text, p_lines jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_order uuid;
  v_line jsonb;
  v_product products%rowtype;
  v_qty integer;
  v_price integer;
  v_subtotal integer := 0;
begin
  if not (is_admin() or auth.role() = 'service_role') then
    raise exception 'forbidden';
  end if;

  insert into orders (status, channel, customer_name, delivery_method, subtotal_cents, total_cents, notes, paid_at)
    values ('entregue', p_channel, coalesce(nullif(p_customer, ''), initcap(p_channel::text)), 'retirada', 0, 0, p_notes, now())
    returning id into v_order;

  for v_line in select * from jsonb_array_elements(p_lines) loop
    v_qty := (v_line ->> 'quantity')::integer;
    select * into v_product from products where id = (v_line ->> 'product_id')::uuid for update;
    if not found then raise exception 'produto não encontrado'; end if;
    if v_product.stock < v_qty then
      raise exception 'Estoque insuficiente de "%" (disponível: %)', v_product.name, v_product.stock;
    end if;
    v_price := coalesce((v_line ->> 'unit_price_cents')::integer, v_product.price_cents);
    insert into order_items (order_id, product_id, name, unit_price_cents, quantity)
      values (v_order, v_product.id, v_product.name, v_price, v_qty);
    update products set stock = stock - v_qty where id = v_product.id;
    insert into stock_movements (product_id, delta, reason, order_id)
      values (v_product.id, -v_qty, 'venda_' || p_channel::text, v_order);
    v_subtotal := v_subtotal + v_price * v_qty;
  end loop;

  update orders set subtotal_cents = v_subtotal, total_cents = v_subtotal where id = v_order;
  return v_order;
end $$;

revoke execute on function mark_order_paid(uuid, text) from public, anon, authenticated;

-- RLS -------------------------------------------------------------------------

alter table admins enable row level security;
alter table products enable row level security;
alter table stock_movements enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table events enable row level security;

create policy "admins leem a si mesmos" on admins for select using (user_id = auth.uid());

create policy "produtos publicados são públicos" on products for select using (published or is_admin());
create policy "admin gerencia produtos" on products for all using (is_admin()) with check (is_admin());

create policy "eventos publicados são públicos" on events for select using (published or is_admin());
create policy "admin gerencia eventos" on events for all using (is_admin()) with check (is_admin());

-- Pedidos: só admin lê pelo cliente; criação/confirmação acontece no servidor com a secret key.
create policy "admin gerencia pedidos" on orders for all using (is_admin()) with check (is_admin());
create policy "admin gerencia itens" on order_items for all using (is_admin()) with check (is_admin());
create policy "admin lê movimentações" on stock_movements for select using (is_admin());

-- Storage ---------------------------------------------------------------------

insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "fotos públicas" on storage.objects for select using (bucket_id = 'product-images');
create policy "admin envia fotos" on storage.objects for insert with check (bucket_id = 'product-images' and is_admin());
create policy "admin apaga fotos" on storage.objects for delete using (bucket_id = 'product-images' and is_admin());
