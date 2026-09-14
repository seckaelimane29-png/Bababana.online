-- Albadary core schema: profiles, surah reference, memorization tracking,
-- sessions, plans, and teacher/parent links.
-- Applied to Supabase project tiwetfxfubjdrgtbwimm as migration "core_schema".

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- User profiles (one row per auth user, created by trigger on signup)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'New user',
  role text not null default 'student' check (role in ('student','teacher','parent')),
  avatar_url text,
  bio text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'display_name', ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'New user'
    ),
    case
      when new.raw_user_meta_data->>'role' in ('student','teacher','parent')
        then new.raw_user_meta_data->>'role'
      else 'student'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Surah reference data (seeded separately; Quran text itself is fetched
-- client-side from a Quran API, only references are stored here)
create table public.surahs (
  number smallint primary key check (number between 1 and 114),
  name_arabic text not null,
  name_transliteration text not null,
  name_english text not null,
  ayah_count smallint not null check (ayah_count > 0),
  revelation_place text not null check (revelation_place in ('makkah','madinah'))
);

-- Teacher <-> student relationships
create table public.teacher_links (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  requested_by uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','active','declined')),
  created_at timestamptz not null default now(),
  unique (teacher_id, student_id),
  check (teacher_id <> student_id),
  check (requested_by in (teacher_id, student_id))
);
create index teacher_links_student_idx on public.teacher_links (student_id);

-- Parent <-> child relationships
create table public.parent_links (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles(id) on delete cascade,
  child_id uuid not null references public.profiles(id) on delete cascade,
  requested_by uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','active','declined')),
  created_at timestamptz not null default now(),
  unique (parent_id, child_id),
  check (parent_id <> child_id),
  check (requested_by in (parent_id, child_id))
);
create index parent_links_child_idx on public.parent_links (child_id);

-- Memorization plans (e.g. "Juz Amma by Ramadan, 5 ayahs/day")
create table public.memorization_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'My plan',
  start_surah smallint not null references public.surahs(number),
  start_ayah smallint not null default 1 check (start_ayah >= 1),
  end_surah smallint not null references public.surahs(number),
  end_ayah smallint not null check (end_ayah >= 1),
  daily_ayah_target smallint not null default 5 check (daily_ayah_target between 1 and 200),
  target_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index memorization_plans_user_idx on public.memorization_plans (user_id);

create trigger memorization_plans_set_updated_at
  before update on public.memorization_plans
  for each row execute function public.set_updated_at();

-- Per-ayah memorization state with spaced-repetition scheduling (SM-2 style)
create table public.ayah_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  surah smallint not null references public.surahs(number),
  ayah smallint not null check (ayah >= 1),
  status text not null default 'learning' check (status in ('learning','memorized')),
  ease real not null default 2.5 check (ease between 1.3 and 3.0),
  interval_days integer not null default 0 check (interval_days >= 0),
  next_review_at timestamptz,
  last_reviewed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, surah, ayah)
);
create index ayah_progress_due_idx on public.ayah_progress (user_id, next_review_at);

create trigger ayah_progress_set_updated_at
  before update on public.ayah_progress
  for each row execute function public.set_updated_at();

-- Validate ayah numbers against the surah's ayah count
create or replace function public.check_ayah_bounds()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  cnt smallint;
begin
  select ayah_count into cnt from public.surahs where number = new.surah;
  if cnt is null then
    raise exception 'unknown surah %', new.surah;
  end if;
  if new.ayah < 1 or new.ayah > cnt then
    raise exception 'ayah % out of range for surah % (1..%)', new.ayah, new.surah, cnt;
  end if;
  return new;
end;
$$;

create trigger ayah_progress_bounds
  before insert or update on public.ayah_progress
  for each row execute function public.check_ayah_bounds();

-- Activity log: reading, recitation, review, and quiz sessions
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('read','recite','review','quiz')),
  surah smallint references public.surahs(number),
  ayah_from smallint check (ayah_from >= 1),
  ayah_to smallint check (ayah_to >= 1),
  score numeric check (score between 0 and 100),
  duration_seconds integer check (duration_seconds >= 0),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (ayah_from is null or ayah_to is null or ayah_from <= ayah_to)
);
create index sessions_user_created_idx on public.sessions (user_id, created_at desc);

-- Last reading position (mushaf resume point)
create table public.reading_positions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  surah smallint not null references public.surahs(number),
  ayah smallint not null check (ayah >= 1),
  updated_at timestamptz not null default now()
);

create trigger reading_positions_set_updated_at
  before update on public.reading_positions
  for each row execute function public.set_updated_at();

create trigger reading_positions_bounds
  before insert or update on public.reading_positions
  for each row execute function public.check_ayah_bounds();
