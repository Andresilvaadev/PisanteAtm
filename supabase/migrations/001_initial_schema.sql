-- ═══════════════════════════════════════════════════════════════════════════════
-- Pisante ATM — Schema inicial no Supabase (Fase 1)
-- Execute este arquivo no SQL Editor do painel do Supabase:
--   supabase.com → seu projeto → SQL Editor → New query → cole e execute
-- ═══════════════════════════════════════════════════════════════════════════════


-- ─── CATEGORIES ──────────────────────────────────────────────────────────────

create table public.categories (
  id            uuid          primary key default gen_random_uuid(),
  name          text          not null,
  slug          text          not null unique,
  description   text,
  image_url     text,
  is_active     boolean       not null default true,
  display_order int           not null default 0,
  created_at    timestamptz   not null default now(),
  updated_at    timestamptz
);

create index idx_categories_slug    on public.categories (slug);
create index idx_categories_active  on public.categories (is_active);
create index idx_categories_order   on public.categories (display_order);


-- ─── PRODUCTS ────────────────────────────────────────────────────────────────

create table public.products (
  id             uuid          primary key default gen_random_uuid(),
  category_id    uuid          not null references public.categories (id),
  name           text          not null,
  slug           text          not null unique,
  description    text,
  price          numeric(10,2) not null check (price >= 0),
  discount_price numeric(10,2)          check (discount_price >= 0),
  brand          text,
  is_active      boolean       not null default true,
  is_featured    boolean       not null default false,
  sales_count    int           not null default 0,
  created_at     timestamptz   not null default now(),
  updated_at     timestamptz
);

create index idx_products_category  on public.products (category_id);
create index idx_products_slug      on public.products (slug);
create index idx_products_active    on public.products (is_active);
create index idx_products_featured  on public.products (is_featured);


-- ─── PRODUCT IMAGES ──────────────────────────────────────────────────────────

create table public.product_images (
  id            uuid        primary key default gen_random_uuid(),
  product_id    uuid        not null references public.products (id) on delete cascade,
  url           text        not null,
  alt_text      text,
  is_primary    boolean     not null default false,
  display_order int         not null default 0,
  created_at    timestamptz not null default now()
);

create index idx_product_images_product on public.product_images (product_id);


-- ─── PRODUCT VARIANTS ────────────────────────────────────────────────────────

create table public.product_variants (
  id             uuid        primary key default gen_random_uuid(),
  product_id     uuid        not null references public.products (id) on delete cascade,
  size           text        not null,
  color          text,
  sku            text        not null,
  stock_quantity int         not null default 0 check (stock_quantity >= 0),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz
);

create index idx_product_variants_product on public.product_variants (product_id);

-- Evita combinação duplicada de tamanho+cor por produto (color nullable tratado via coalesce)
create unique index idx_variants_unique_size_color
  on public.product_variants (product_id, size, coalesce(color, ''));


-- ─── ORDERS (pedidos via WhatsApp, anônimos) ─────────────────────────────────
--
-- items é um snapshot JSONB do carrinho no momento do checkout:
-- [{
--   "product_id":   "uuid",
--   "product_name": "text",
--   "variant_id":   "uuid | null",
--   "size":         "text | null",
--   "color":        "text | null",
--   "unit_price":   number,
--   "quantity":     number
-- }]

create table public.orders (
  id               uuid          primary key default gen_random_uuid(),
  order_number     text          not null unique,
  items            jsonb         not null default '[]',
  subtotal         numeric(10,2) not null,
  total            numeric(10,2) not null,
  whatsapp_message text,
  status           text          not null default 'pending',
  created_at       timestamptz   not null default now()
);

create index idx_orders_created_at   on public.orders (created_at desc);
create index idx_orders_order_number on public.orders (order_number);


-- ═══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Categories ──────────────────────────────────────────────────────────────

alter table public.categories enable row level security;

-- Público: lê apenas categorias ativas
create policy "categories_public_select"
  on public.categories for select
  using (is_active = true);

-- Admin (qualquer usuário autenticado): lê todas (inclusive inativas)
create policy "categories_admin_select"
  on public.categories for select
  to authenticated
  using (true);

-- Admin: escrita completa
create policy "categories_admin_insert"
  on public.categories for insert
  to authenticated
  with check (true);

create policy "categories_admin_update"
  on public.categories for update
  to authenticated
  using (true) with check (true);

create policy "categories_admin_delete"
  on public.categories for delete
  to authenticated
  using (true);


-- ─── Products ────────────────────────────────────────────────────────────────

alter table public.products enable row level security;

-- Público: lê apenas produtos ativos
create policy "products_public_select"
  on public.products for select
  using (is_active = true);

-- Admin: lê todos (inclusive inativos)
create policy "products_admin_select"
  on public.products for select
  to authenticated
  using (true);

-- Admin: escrita completa
create policy "products_admin_insert"
  on public.products for insert
  to authenticated
  with check (true);

create policy "products_admin_update"
  on public.products for update
  to authenticated
  using (true) with check (true);

create policy "products_admin_delete"
  on public.products for delete
  to authenticated
  using (true);


-- ─── Product Images ───────────────────────────────────────────────────────────

alter table public.product_images enable row level security;

-- Público: lê todas as imagens
create policy "product_images_public_select"
  on public.product_images for select
  using (true);

-- Admin: escrita completa
create policy "product_images_admin_all"
  on public.product_images for all
  to authenticated
  using (true) with check (true);


-- ─── Product Variants ─────────────────────────────────────────────────────────

alter table public.product_variants enable row level security;

-- Público: lê todas as variantes
create policy "product_variants_public_select"
  on public.product_variants for select
  using (true);

-- Admin: escrita completa
create policy "product_variants_admin_all"
  on public.product_variants for all
  to authenticated
  using (true) with check (true);


-- ─── Orders ───────────────────────────────────────────────────────────────────

alter table public.orders enable row level security;

-- Qualquer visitante pode registrar um pedido (checkout anônimo via WhatsApp)
create policy "orders_public_insert"
  on public.orders for insert
  with check (true);

-- Apenas admin lê e gerencia pedidos
create policy "orders_admin_select"
  on public.orders for select
  to authenticated
  using (true);

create policy "orders_admin_update"
  on public.orders for update
  to authenticated
  using (true) with check (true);

create policy "orders_admin_delete"
  on public.orders for delete
  to authenticated
  using (true);


-- ═══════════════════════════════════════════════════════════════════════════════
-- STORAGE — Buckets e políticas de acesso
-- Execute após o bloco acima (pode ser na mesma query ou separado)
-- ═══════════════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public)
values
  ('product-images',  'product-images',  true),
  ('category-images', 'category-images', true)
on conflict (id) do nothing;


-- Produto images: leitura pública, escrita só para admin
create policy "product_images_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "product_images_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

create policy "product_images_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images');

create policy "product_images_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');


-- Category images: leitura pública, escrita só para admin
create policy "category_images_public_read"
  on storage.objects for select
  using (bucket_id = 'category-images');

create policy "category_images_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'category-images');

create policy "category_images_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'category-images');

create policy "category_images_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'category-images');
