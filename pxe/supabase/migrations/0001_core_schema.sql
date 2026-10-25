-- PXE core schema (DRAFT — not yet applied to any database).
-- Money: bigint minor units + currency code, never floats.
-- Tables marked "server-written" are only modified with the service role
-- from trusted server code; see 0002_rls.sql.

create extension if not exists citext;

-- ---------------------------------------------------------------------------
-- Reference data
-- ---------------------------------------------------------------------------

create table currencies (
  code      char(3) primary key,
  exponent  smallint not null check (exponent between 0 and 3),
  name      text not null
);
insert into currencies (code, exponent, name) values
  ('GMD', 2, 'Gambian dalasi'),
  ('XOF', 0, 'West African CFA franc'),
  ('EUR', 2, 'Euro');

create type app_role       as enum ('student', 'creator', 'admin');
create type course_level   as enum ('beginner', 'intermediate', 'advanced');
create type course_status  as enum ('draft', 'in_review', 'published', 'unpublished', 'rejected');
create type order_status   as enum ('pending', 'paid', 'failed', 'cancelled', 'refunded', 'partially_refunded');
create type payment_status as enum ('initiated', 'pending', 'succeeded', 'failed', 'cancelled', 'refunded');
create type video_status   as enum ('awaiting_upload', 'uploading', 'processing', 'ready', 'failed');
create type ledger_kind    as enum ('sale_gross', 'platform_fee', 'provider_fee', 'refund',
                                    'platform_fee_reversal', 'payout', 'adjustment');
create type payout_status  as enum ('requested', 'approved', 'paid', 'rejected', 'cancelled');
create type report_status  as enum ('open', 'reviewing', 'resolved', 'dismissed');

create table languages (
  code  text primary key,          -- 'en', 'fr', 'wo'
  name  text not null
);
insert into languages (code, name) values ('en', 'English'), ('fr', 'Français'), ('wo', 'Wolof');

create table categories (
  id          bigint generated always as identity primary key,
  slug        citext not null unique,
  name_en     text not null,
  name_fr     text,
  name_wo     text,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Singleton row of platform-wide settings (admin-editable).
create table platform_settings (
  id                    boolean primary key default true check (id),
  platform_fee_bps      int not null default 1000 check (platform_fee_bps between 0 and 10000),
  require_course_review boolean not null default true,
  updated_at            timestamptz not null default now(),
  updated_by            uuid references auth.users(id)
);
insert into platform_settings default values;

-- ---------------------------------------------------------------------------
-- People
-- ---------------------------------------------------------------------------

create table profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  display_name       text not null default '' check (char_length(display_name) <= 80),
  avatar_path        text,
  preferred_language text not null default 'en' references languages(code),
  country            char(2) check (country ~ '^[A-Z]{2}$'),
  suspended_at       timestamptz,
  suspended_reason   text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table user_roles (
  user_id     uuid not null references profiles(id) on delete cascade,
  role        app_role not null,
  granted_at  timestamptz not null default now(),
  granted_by  uuid references profiles(id),
  primary key (user_id, role)
);

create table creator_profiles (
  user_id            uuid primary key references profiles(id) on delete cascade,
  username           citext not null unique
                     check (username ~ '^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$'),
  headline           text check (char_length(headline) <= 120),
  bio                text check (char_length(bio) <= 4000),
  expertise          text[] not null default '{}',
  languages          text[] not null default '{}',
  social_links       jsonb not null default '{}'::jsonb,  -- {instagram, tiktok, facebook, whatsapp, website}
  verified_at        timestamptz,
  payout_details     jsonb,              -- sensitive: never exposed publicly (see RLS / view)
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table creator_verification_requests (
  id           bigint generated always as identity primary key,
  creator_id   uuid not null references creator_profiles(user_id) on delete cascade,
  status       report_status not null default 'open',
  note         text,
  reviewed_by  uuid references profiles(id),
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Courses & content
-- ---------------------------------------------------------------------------

create table courses (
  id              uuid primary key default gen_random_uuid(),
  creator_id      uuid not null references creator_profiles(user_id) on delete restrict,
  slug            citext not null,
  title           text not null check (char_length(title) between 3 and 140),
  subtitle        text check (char_length(subtitle) <= 200),
  description     text check (char_length(description) <= 20000),
  outcomes        text[] not null default '{}',
  requirements    text[] not null default '{}',
  category_id     bigint references categories(id) on delete set null,
  language        text not null references languages(code),
  level           course_level not null default 'beginner',
  cover_path      text,
  status          course_status not null default 'draft',
  is_free         boolean not null default false,
  is_demo         boolean not null default false,  -- seeded demo content; hidden when demo mode is off
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (creator_id, slug)
);
create index courses_published_idx on courses (status, published_at desc) where status = 'published';
create index courses_category_idx  on courses (category_id);
create index courses_search_idx    on courses using gin (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(subtitle,'')));

-- One price per (course, currency). No automatic FX conversion.
create table course_prices (
  course_id     uuid not null references courses(id) on delete cascade,
  currency      char(3) not null references currencies(code),
  amount_minor  bigint not null check (amount_minor > 0),
  primary key (course_id, currency)
);

create table course_sections (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references courses(id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 140),
  position    int not null,
  created_at  timestamptz not null default now(),
  unique (course_id, position) deferrable initially deferred
);

create table video_assets (
  id                 uuid primary key default gen_random_uuid(),
  owner_id           uuid not null references profiles(id) on delete restrict,
  provider           text not null,             -- 'bunny' | 'cloudflare' | ...
  provider_asset_id  text,
  status             video_status not null default 'awaiting_upload',
  duration_seconds   int check (duration_seconds >= 0),
  original_filename  text,
  size_bytes         bigint,
  error_message      text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (provider, provider_asset_id)
);

create table lessons (
  id               uuid primary key default gen_random_uuid(),
  section_id       uuid not null references course_sections(id) on delete cascade,
  course_id        uuid not null references courses(id) on delete cascade,  -- denormalized for RLS
  title            text not null check (char_length(title) between 1 and 140),
  summary          text check (char_length(summary) <= 4000),
  position         int not null,
  video_asset_id   uuid references video_assets(id) on delete set null,
  is_preview       boolean not null default false,
  is_published     boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (section_id, position) deferrable initially deferred
);
create index lessons_course_idx on lessons (course_id);

create table lesson_resources (
  id            uuid primary key default gen_random_uuid(),
  lesson_id     uuid not null references lessons(id) on delete cascade,
  title         text not null,
  storage_path  text not null,          -- private bucket; served via signed URL only
  size_bytes    bigint,
  downloadable  boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Commerce (server-written)
-- ---------------------------------------------------------------------------

create table orders (
  id             uuid primary key default gen_random_uuid(),
  buyer_id       uuid not null references profiles(id) on delete restrict,
  status         order_status not null default 'pending',
  currency       char(3) not null references currencies(code),
  total_minor    bigint not null check (total_minor >= 0),
  created_at     timestamptz not null default now(),
  paid_at        timestamptz,
  updated_at     timestamptz not null default now()
);
create index orders_buyer_idx on orders (buyer_id, created_at desc);

create table order_items (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references orders(id) on delete cascade,
  course_id         uuid not null references courses(id) on delete restrict,
  creator_id        uuid not null references creator_profiles(user_id) on delete restrict,
  currency          char(3) not null references currencies(code),
  unit_price_minor  bigint not null check (unit_price_minor >= 0),  -- snapshot at order time
  platform_fee_bps  int not null check (platform_fee_bps between 0 and 10000),  -- snapshot
  unique (order_id, course_id)
);
create index order_items_creator_idx on order_items (creator_id);

create table payments (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references orders(id) on delete restrict,
  provider            text not null,
  provider_reference  text not null,
  status              payment_status not null default 'initiated',
  currency            char(3) not null references currencies(code),
  amount_minor        bigint not null check (amount_minor >= 0),
  provider_fee_minor  bigint check (provider_fee_minor >= 0),
  is_sandbox          boolean not null default false,
  verified_at         timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (provider, provider_reference)
);
create index payments_order_idx on payments (order_id);

-- Raw provider callbacks. Unique key gives webhook idempotency.
create table payment_events (
  id                 bigint generated always as identity primary key,
  provider           text not null,
  provider_event_id  text not null,
  event_type         text not null,
  payload            jsonb not null,
  signature_valid    boolean not null,
  processed_at       timestamptz,
  processing_error   text,
  received_at        timestamptz not null default now(),
  unique (provider, provider_event_id)
);

create table enrollments (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references profiles(id) on delete cascade,
  course_id      uuid not null references courses(id) on delete restrict,
  order_item_id  uuid references order_items(id) on delete restrict,
  source         text not null check (source in ('purchase', 'free', 'admin_grant')),
  revoked_at     timestamptz,             -- set on refund / admin action
  created_at     timestamptz not null default now(),
  unique (user_id, course_id)
);
create index enrollments_course_idx on enrollments (course_id);

-- Append-only creator ledger. Balance = sum(amount_minor) per (creator, currency).
create table ledger_entries (
  id             bigint generated always as identity primary key,
  creator_id     uuid not null references creator_profiles(user_id) on delete restrict,
  currency       char(3) not null references currencies(code),
  kind           ledger_kind not null,
  amount_minor   bigint not null,          -- signed: credits > 0, debits < 0
  order_item_id  uuid references order_items(id) on delete restrict,
  payout_id      uuid,
  memo           text,
  created_by     uuid references profiles(id),
  created_at     timestamptz not null default now(),
  check (
    (kind in ('sale_gross','platform_fee_reversal') and amount_minor > 0) or
    (kind in ('platform_fee','provider_fee','refund','payout') and amount_minor < 0) or
    (kind = 'adjustment' and amount_minor <> 0)
  )
);
create index ledger_creator_idx on ledger_entries (creator_id, currency);
-- Each sale-side entry kind may be posted at most once per order item.
create unique index ledger_once_per_item_idx on ledger_entries (order_item_id, kind)
  where kind in ('sale_gross', 'platform_fee', 'provider_fee');

create or replace function ledger_entries_immutable() returns trigger
language plpgsql as $$
begin
  raise exception 'ledger_entries is append-only';
end $$;
create trigger ledger_no_update before update or delete on ledger_entries
  for each row execute function ledger_entries_immutable();

create table payouts (
  id            uuid primary key default gen_random_uuid(),
  creator_id    uuid not null references creator_profiles(user_id) on delete restrict,
  currency      char(3) not null references currencies(code),
  amount_minor  bigint not null check (amount_minor > 0),
  status        payout_status not null default 'requested',
  method        text,                       -- 'wave', 'bank', ... (manual in Phase 1)
  external_ref  text,
  note          text,
  approved_by   uuid references profiles(id),
  paid_at       timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table ledger_entries
  add constraint ledger_payout_fk foreign key (payout_id) references payouts(id) on delete restrict;

-- security_invoker so ledger_entries RLS applies (creators see only their own).
create view creator_balances with (security_invoker = true) as
  select creator_id, currency, sum(amount_minor)::bigint as balance_minor
  from ledger_entries group by creator_id, currency;

-- ---------------------------------------------------------------------------
-- Learning
-- ---------------------------------------------------------------------------

create table lesson_progress (
  user_id           uuid not null references profiles(id) on delete cascade,
  lesson_id         uuid not null references lessons(id) on delete cascade,
  course_id         uuid not null references courses(id) on delete cascade,
  position_seconds  int not null default 0 check (position_seconds >= 0),
  completed_at      timestamptz,
  updated_at        timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
create index lesson_progress_course_idx on lesson_progress (user_id, course_id, updated_at desc);

-- ---------------------------------------------------------------------------
-- Trust & safety, notifications, audit
-- ---------------------------------------------------------------------------

create table reports (
  id           bigint generated always as identity primary key,
  reporter_id  uuid references profiles(id) on delete set null,
  target_type  text not null check (target_type in ('course', 'lesson', 'creator', 'user')),
  target_id    text not null,
  reason       text not null check (char_length(reason) between 3 and 2000),
  status       report_status not null default 'open',
  created_at   timestamptz not null default now()
);

create table moderation_actions (
  id           bigint generated always as identity primary key,
  admin_id     uuid not null references profiles(id),
  target_type  text not null,
  target_id    text not null,
  action       text not null,   -- 'approve_course', 'reject_course', 'suspend_user', ...
  reason       text,
  report_id    bigint references reports(id),
  created_at   timestamptz not null default now()
);

create table notifications (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references profiles(id) on delete cascade,
  kind        text not null,
  data        jsonb not null default '{}'::jsonb,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index notifications_user_idx on notifications (user_id, created_at desc);

-- Sensitive financial/admin actions. Append-only.
create table audit_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid references profiles(id),
  action      text not null,
  entity      text not null,
  entity_id   text,
  details     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create trigger audit_no_update before update or delete on audit_log
  for each row execute function ledger_entries_immutable();

-- ---------------------------------------------------------------------------
-- Housekeeping triggers
-- ---------------------------------------------------------------------------

create or replace function set_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

do $$
declare t text;
begin
  foreach t in array array['profiles','creator_profiles','courses','video_assets','lessons',
                           'orders','payments','payouts']
  loop
    execute format('create trigger %I_updated_at before update on %I
                    for each row execute function set_updated_at()', t, t);
  end loop;
end $$;

-- Create a profile + student role for every new auth user.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, display_name)
    values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''));
  insert into user_roles (user_id, role) values (new.id, 'student');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();
