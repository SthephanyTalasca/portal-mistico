-- =====================================================================
-- PORTAL MÍSTICO — ESQUEMA DO BANCO, SEGURANÇA (RLS) E STORAGE
-- Execute no SQL Editor do Supabase (ou via `supabase db push`).
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------
do $$ begin
  create type public.content_status as enum ('published', 'draft', 'unavailable');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.badge_type as enum ('none', 'novo', 'popular', 'em_breve');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- Administradores autorizados
-- Só usuários listados aqui podem alterar conteúdo.
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Atualiza updated_at automaticamente
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Baralhos
-- ---------------------------------------------------------------------
create table if not exists public.decks (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(name) between 1 and 120),
  slug         text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description  text not null default '',
  cover_url    text,
  badge        public.badge_type not null default 'none',
  is_published boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Categorias
-- ---------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 80),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  is_visible  boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Tiragens
-- on delete restrict: não é possível apagar baralho/categoria com tiragens
-- ---------------------------------------------------------------------
create table if not exists public.spreads (
  id                uuid primary key default gen_random_uuid(),
  name              text not null check (char_length(name) between 1 and 140),
  slug              text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  deck_id           uuid not null references public.decks (id) on delete restrict,
  category_id       uuid not null references public.categories (id) on delete restrict,
  price_cents       integer not null default 0 check (price_cents >= 0),
  short_description text not null default '',
  full_description  text not null default '',
  questions         text[] not null default '{}',
  service_format    text not null default '',
  delivery_time     text not null default '',
  cover_url         text,
  gallery           text[] not null default '{}',
  status            public.content_status not null default 'draft',
  featured          boolean not null default false,
  badge             public.badge_type not null default 'none',
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists spreads_deck_idx on public.spreads (deck_id);
create index if not exists spreads_category_idx on public.spreads (category_id);
create index if not exists spreads_status_sort_idx on public.spreads (status, sort_order);

-- ---------------------------------------------------------------------
-- Serviços (Rituais & Trabalhos Espirituais) — ocultos até publicar
-- ---------------------------------------------------------------------
create table if not exists public.services (
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (char_length(name) between 1 and 140),
  slug            text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description     text not null default '',
  image_url       text,
  price_cents     integer check (price_cents is null or price_cents >= 0),
  guidelines      text not null default '',
  contact_message text not null default '',
  status          public.content_status not null default 'draft',
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Perguntas frequentes
-- ---------------------------------------------------------------------
create table if not exists public.faqs (
  id           uuid primary key default gen_random_uuid(),
  question     text not null check (char_length(question) between 1 and 240),
  answer       text not null default '',
  is_published boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Configurações gerais (linha única, id = 1)
-- ---------------------------------------------------------------------
create table if not exists public.site_settings (
  id               integer primary key default 1 check (id = 1),
  oracle_name      text not null default 'Oráculo Lunar',
  logo_url         text,
  footer_phrase    text not null default '',
  whatsapp_number  text not null default '5547991678074',
  instagram_url    text not null default '',
  tiktok_url       text not null default '',
  facebook_url     text not null default '',
  youtube_url      text not null default '',
  service_info     text not null default '',
  seo_title        text not null default '',
  seo_description  text not null default '',
  og_image_url     text,
  privacy_text     text not null default '',
  terms_text       text not null default '',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Conteúdo da homepage e "Sobre mim" (linha única, id = 1)
-- ---------------------------------------------------------------------
create table if not exists public.homepage_content (
  id                  integer primary key default 1 check (id = 1),
  hero_eyebrow        text not null default '✦ BEM-VINDA AO ORÁCULO ✦',
  hero_title          text not null default 'Entre cartas, mistérios e caminhos.',
  hero_subtitle       text not null default '',
  hero_image_url      text,
  decks_title         text not null default 'Os Oráculos',
  decks_subtitle      text not null default '',
  featured_title      text not null default 'Tiragens em destaque',
  featured_subtitle   text not null default '',
  rituals_title       text not null default 'Rituais & Trabalhos Espirituais',
  rituals_soon_title  text not null default 'Em breve',
  rituals_soon_text   text not null default 'Novos caminhos e serviços estão sendo preparados.',
  about_title         text not null default 'Por trás das cartas',
  about_name          text not null default '',
  about_phrase        text not null default '',
  about_bio           text not null default '',
  about_photo_url     text,
  contact_title       text not null default 'Vamos conversar?',
  contact_text        text not null default '',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Registro de imagens enviadas
-- ---------------------------------------------------------------------
create table if not exists public.media (
  id          uuid primary key default gen_random_uuid(),
  bucket      text not null default 'media',
  path        text not null unique,
  url         text not null,
  mime_type   text,
  size_bytes  integer,
  alt         text not null default '',
  uploaded_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Gatilhos de updated_at
do $$
declare t text;
begin
  foreach t in array array['decks','categories','spreads','services','faqs','site_settings','homepage_content','media']
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Função: excluir categoria transferindo as tiragens
-- ---------------------------------------------------------------------
create or replace function public.delete_category_transfer(p_category uuid, p_target uuid default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if not public.is_admin() then
    raise exception 'Não autorizado' using errcode = '42501';
  end if;

  select count(*) into v_count from public.spreads where category_id = p_category;

  if v_count > 0 then
    if p_target is null or p_target = p_category then
      raise exception 'Escolha outra categoria para receber as % tiragem(ns).', v_count;
    end if;
    if not exists (select 1 from public.categories where id = p_target) then
      raise exception 'Categoria de destino não encontrada.';
    end if;
    update public.spreads set category_id = p_target where category_id = p_category;
  end if;

  delete from public.categories where id = p_category;
end;
$$;

revoke all on function public.delete_category_transfer(uuid, uuid) from public, anon;
grant execute on function public.delete_category_transfer(uuid, uuid) to authenticated;

-- =====================================================================
-- ROW LEVEL SECURITY
-- Visitantes: só leem conteúdo publicado. Escrita: só administradores.
-- =====================================================================
alter table public.admins           enable row level security;
alter table public.decks            enable row level security;
alter table public.categories       enable row level security;
alter table public.spreads          enable row level security;
alter table public.services         enable row level security;
alter table public.faqs             enable row level security;
alter table public.site_settings    enable row level security;
alter table public.homepage_content enable row level security;
alter table public.media            enable row level security;

-- Permissões base (o RLS restringe as linhas)
grant select on public.decks, public.categories, public.spreads, public.services,
                public.faqs, public.site_settings, public.homepage_content
  to anon, authenticated;
grant insert, update, delete on public.decks, public.categories, public.spreads,
                public.services, public.faqs, public.site_settings,
                public.homepage_content, public.media
  to authenticated;
grant select on public.media, public.admins to authenticated;

-- admins: cada usuário só enxerga a própria linha (para checar o acesso).
drop policy if exists "admins_select_own" on public.admins;
create policy "admins_select_own" on public.admins
  for select to authenticated using (user_id = auth.uid());
-- Sem políticas de insert/update/delete: admins são criados apenas via SQL Editor.

-- decks
drop policy if exists "decks_public_read" on public.decks;
create policy "decks_public_read" on public.decks
  for select to anon, authenticated using (is_published or public.is_admin());
drop policy if exists "decks_admin_insert" on public.decks;
create policy "decks_admin_insert" on public.decks
  for insert to authenticated with check (public.is_admin());
drop policy if exists "decks_admin_update" on public.decks;
create policy "decks_admin_update" on public.decks
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "decks_admin_delete" on public.decks;
create policy "decks_admin_delete" on public.decks
  for delete to authenticated using (public.is_admin());

-- categories
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
  for select to anon, authenticated using (is_visible or public.is_admin());
drop policy if exists "categories_admin_insert" on public.categories;
create policy "categories_admin_insert" on public.categories
  for insert to authenticated with check (public.is_admin());
drop policy if exists "categories_admin_update" on public.categories;
create policy "categories_admin_update" on public.categories
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "categories_admin_delete" on public.categories;
create policy "categories_admin_delete" on public.categories
  for delete to authenticated using (public.is_admin());

-- spreads: visitante vê publicadas e indisponíveis (nunca rascunhos),
-- e só se o baralho estiver publicado.
drop policy if exists "spreads_public_read" on public.spreads;
create policy "spreads_public_read" on public.spreads
  for select to anon, authenticated using (
    public.is_admin()
    or (
      status in ('published', 'unavailable')
      and exists (select 1 from public.decks d where d.id = deck_id and d.is_published)
    )
  );
drop policy if exists "spreads_admin_insert" on public.spreads;
create policy "spreads_admin_insert" on public.spreads
  for insert to authenticated with check (public.is_admin());
drop policy if exists "spreads_admin_update" on public.spreads;
create policy "spreads_admin_update" on public.spreads
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "spreads_admin_delete" on public.spreads;
create policy "spreads_admin_delete" on public.spreads
  for delete to authenticated using (public.is_admin());

-- services: somente publicados ficam visíveis
drop policy if exists "services_public_read" on public.services;
create policy "services_public_read" on public.services
  for select to anon, authenticated using (status = 'published' or public.is_admin());
drop policy if exists "services_admin_insert" on public.services;
create policy "services_admin_insert" on public.services
  for insert to authenticated with check (public.is_admin());
drop policy if exists "services_admin_update" on public.services;
create policy "services_admin_update" on public.services
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "services_admin_delete" on public.services;
create policy "services_admin_delete" on public.services
  for delete to authenticated using (public.is_admin());

-- faqs
drop policy if exists "faqs_public_read" on public.faqs;
create policy "faqs_public_read" on public.faqs
  for select to anon, authenticated using (is_published or public.is_admin());
drop policy if exists "faqs_admin_insert" on public.faqs;
create policy "faqs_admin_insert" on public.faqs
  for insert to authenticated with check (public.is_admin());
drop policy if exists "faqs_admin_update" on public.faqs;
create policy "faqs_admin_update" on public.faqs
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "faqs_admin_delete" on public.faqs;
create policy "faqs_admin_delete" on public.faqs
  for delete to authenticated using (public.is_admin());

-- site_settings e homepage_content: leitura pública, edição só admin
drop policy if exists "settings_public_read" on public.site_settings;
create policy "settings_public_read" on public.site_settings
  for select to anon, authenticated using (true);
drop policy if exists "settings_admin_update" on public.site_settings;
create policy "settings_admin_update" on public.site_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "home_public_read" on public.homepage_content;
create policy "home_public_read" on public.homepage_content
  for select to anon, authenticated using (true);
drop policy if exists "home_admin_update" on public.homepage_content;
create policy "home_admin_update" on public.homepage_content
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- media: apenas administradores
drop policy if exists "media_admin_all" on public.media;
create policy "media_admin_all" on public.media
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- STORAGE — bucket público para leitura; envio/remoção só admin
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media_admin_insert" on storage.objects;
create policy "media_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- A remoção de arquivos pela API exige também permissão de leitura do objeto
drop policy if exists "media_admin_select" on storage.objects;
create policy "media_admin_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and public.is_admin());
