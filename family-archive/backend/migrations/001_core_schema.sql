-- Family Archive core schema: families, membership and invitations, the
-- family tree (people, relationships, places), the archive (items: photos,
-- videos, voice recordings, stories, documents, notes), the timeline, and
-- family notes and questions.
-- Applied to Supabase project egbtmfmpkbckzgkksqjg as migration "core_schema".
--
-- Every row carries family_id. Child rows reference their parents through
-- composite (id, family_id) foreign keys, so a row can never point at a
-- person, place, item or event that belongs to a different family.

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

-- Short, readable invitation codes (no 0/O, 1/I/L).
create or replace function public.generate_invite_code()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  alphabet constant text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  bytes bytea := extensions.gen_random_bytes(8);
  code text := '';
begin
  for i in 0..7 loop
    code := code || substr(alphabet, (get_byte(bytes, i) % length(alphabet)) + 1, 1);
  end loop;
  return code;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles (one per auth user, created by trigger on signup)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'New member' check (length(display_name) between 1 and 120),
  avatar_path text,
  -- e.g. {"large_text": true, "autoplay_stories": true}
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
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'New member'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Families and membership
-- ---------------------------------------------------------------------------
create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 120),      -- "The Secka Family"
  tagline text check (length(tagline) <= 200),                      -- "Five generations · Banjul, Dakar & Brussels"
  cover_path text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger families_set_updated_at
  before update on public.families
  for each row execute function public.set_updated_at();

create table public.places (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null check (length(name) between 1 and 160),       -- "Dakar · Médina"
  region text,
  country text,
  latitude numeric(8,5) check (latitude between -90 and 90),
  longitude numeric(8,5) check (longitude between -180 and 180),
  description text,
  cover_path text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, family_id)
);
create index places_family_idx on public.places (family_id);

create trigger places_set_updated_at
  before update on public.places
  for each row execute function public.set_updated_at();

create table public.people (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  given_name text not null check (length(given_name) between 1 and 120),
  family_name text,
  birth_name text,                  -- e.g. maiden name
  known_as text,                    -- e.g. "Grandma Mariama"
  birth_year smallint check (birth_year between 1000 and 2200),
  death_year smallint check (death_year between 1000 and 2200),
  is_deceased boolean not null default false,
  birth_place_id uuid,
  death_place_id uuid,
  bio text,
  portrait_path text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, family_id),
  check (death_year is null or is_deceased),
  check (death_year is null or birth_year is null or death_year >= birth_year),
  foreign key (birth_place_id, family_id) references public.places(id, family_id)
    on delete set null (birth_place_id),
  foreign key (death_place_id, family_id) references public.places(id, family_id)
    on delete set null (death_place_id)
);
create index people_family_idx on public.people (family_id);

create trigger people_set_updated_at
  before update on public.people
  for each row execute function public.set_updated_at();

-- Details of living people that only Keepers may see (exact dates, contact).
create table public.people_private (
  person_id uuid primary key,
  family_id uuid not null,
  birth_date date,
  death_date date,
  contact text,
  notes text,
  updated_at timestamptz not null default now(),
  foreign key (person_id, family_id) references public.people(id, family_id) on delete cascade
);

create trigger people_private_set_updated_at
  before update on public.people_private
  for each row execute function public.set_updated_at();

create table public.family_members (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  -- keeper: edit people, approve members, change privacy
  -- contributor: add stories, photos and memories
  -- viewer: look and listen
  role text not null default 'viewer' check (role in ('keeper','contributor','viewer')),
  status text not null default 'pending' check (status in ('pending','active')),
  person_id uuid,                   -- this member's own node in the tree
  invited_by uuid references public.profiles(id) on delete set null,
  invitation_id uuid,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (family_id, user_id),
  foreign key (person_id, family_id) references public.people(id, family_id)
    on delete set null (person_id)
);
create index family_members_user_idx on public.family_members (user_id);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  code text not null unique default public.generate_invite_code(),
  invitee_name text check (length(invitee_name) <= 120),
  relation text check (length(relation) <= 60),                     -- "Aunt", "Cousin"
  role text not null default 'contributor' check (role in ('keeper','contributor','viewer')),
  person_id uuid,                   -- tree node the invitee will be linked to
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  used_by uuid references public.profiles(id) on delete set null,
  used_at timestamptz,
  revoked_at timestamptz,
  foreign key (person_id, family_id) references public.people(id, family_id)
    on delete set null (person_id)
);
create index invitations_family_idx on public.invitations (family_id);

alter table public.family_members
  add foreign key (invitation_id) references public.invitations(id) on delete set null;

-- ---------------------------------------------------------------------------
-- The tree
-- ---------------------------------------------------------------------------
create table public.relationships (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  -- parent: person_a is a parent of person_b
  -- spouse: person_a and person_b are partners (stored with person_a < person_b)
  kind text not null check (kind in ('parent','spouse')),
  person_a uuid not null,
  person_b uuid not null,
  start_year smallint check (start_year between 1000 and 2200),     -- e.g. wedding year
  end_year smallint check (end_year between 1000 and 2200),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (kind, person_a, person_b),
  check (person_a <> person_b),
  check (kind <> 'spouse' or person_a < person_b),
  foreign key (person_a, family_id) references public.people(id, family_id) on delete cascade,
  foreign key (person_b, family_id) references public.people(id, family_id) on delete cascade
);
create index relationships_family_idx on public.relationships (family_id);
create index relationships_b_idx on public.relationships (person_b);

create table public.person_places (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  person_id uuid not null,
  place_id uuid not null,
  relation text not null default 'lived'
    check (relation in ('born','grew_up','lived','married','worked','migrated_to','died','buried','other')),
  from_year smallint check (from_year between 1000 and 2200),
  to_year smallint check (to_year between 1000 and 2200),
  note text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (person_id, place_id, relation),
  foreign key (person_id, family_id) references public.people(id, family_id) on delete cascade,
  foreign key (place_id, family_id) references public.places(id, family_id) on delete cascade
);
create index person_places_family_idx on public.person_places (family_id);
create index person_places_place_idx on public.person_places (place_id);

-- ---------------------------------------------------------------------------
-- The archive: everything the family keeps
-- ---------------------------------------------------------------------------
create table public.items (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  kind text not null check (kind in ('photo','video','voice','story','document','note')),
  title text check (length(title) <= 200),
  caption text,
  body text,                        -- written text for notes and typed stories
  year smallint check (year between 1000 and 2200),
  date date,
  place_id uuid,
  storage_path text,                -- object in the family-media bucket
  mime_type text,
  duration_sec integer check (duration_sec >= 0),
  -- family: every active member · keepers: keepers and the author · private: only the author
  visibility text not null default 'family' check (visibility in ('family','keepers','private')),
  -- Stories (and any recording) are organised by the organize-story function
  category text check (category in ('childhood','parents','marriage','work','migration',
                                    'traditions','events','life_lessons','other')),
  teller_person_id uuid,            -- who is speaking
  transcript text,
  transcript_status text not null default 'none'
    check (transcript_status in ('none','pending','processing','done','failed')),
  summary text,
  processing_error text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, family_id),
  foreign key (place_id, family_id) references public.places(id, family_id)
    on delete set null (place_id),
  foreign key (teller_person_id, family_id) references public.people(id, family_id)
    on delete set null (teller_person_id)
);
create index items_family_created_idx on public.items (family_id, created_at desc);
create index items_family_year_idx on public.items (family_id, year);
create index items_storage_path_idx on public.items (storage_path) where storage_path is not null;
create index items_created_by_idx on public.items (created_by);

create trigger items_set_updated_at
  before update on public.items
  for each row execute function public.set_updated_at();

-- Who appears in / is spoken about in an item
create table public.item_people (
  item_id uuid not null,
  person_id uuid not null,
  family_id uuid not null,
  primary key (item_id, person_id),
  foreign key (item_id, family_id) references public.items(id, family_id) on delete cascade,
  foreign key (person_id, family_id) references public.people(id, family_id) on delete cascade
);
create index item_people_person_idx on public.item_people (person_id);

-- ---------------------------------------------------------------------------
-- Timeline
-- ---------------------------------------------------------------------------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  year smallint not null check (year between 1000 and 2200),
  date date,
  title text not null check (length(title) between 1 and 200),      -- "The family moves to Dakar"
  description text,
  place_id uuid,
  is_major boolean not null default false,                          -- shown in Home highlights
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, family_id),
  foreign key (place_id, family_id) references public.places(id, family_id)
    on delete set null (place_id)
);
create index events_family_year_idx on public.events (family_id, year);

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

create table public.event_people (
  event_id uuid not null,
  person_id uuid not null,
  family_id uuid not null,
  primary key (event_id, person_id),
  foreign key (event_id, family_id) references public.events(id, family_id) on delete cascade,
  foreign key (person_id, family_id) references public.people(id, family_id) on delete cascade
);
create index event_people_person_idx on public.event_people (person_id);

create table public.event_items (
  event_id uuid not null,
  item_id uuid not null,
  family_id uuid not null,
  primary key (event_id, item_id),
  foreign key (event_id, family_id) references public.events(id, family_id) on delete cascade,
  foreign key (item_id, family_id) references public.items(id, family_id) on delete cascade
);
create index event_items_item_idx on public.event_items (item_id);

-- ---------------------------------------------------------------------------
-- Family notes ("Remembered by family") and questions waiting for a story
-- ---------------------------------------------------------------------------
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  item_id uuid,
  person_id uuid,
  body text not null check (length(body) between 1 and 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (num_nonnulls(item_id, person_id) = 1),
  foreign key (item_id, family_id) references public.items(id, family_id) on delete cascade,
  foreign key (person_id, family_id) references public.people(id, family_id) on delete cascade
);
create index notes_item_idx on public.notes (item_id);
create index notes_person_idx on public.notes (person_id);
create index notes_family_idx on public.notes (family_id);

create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  for_person_id uuid not null,
  question text not null check (length(question) between 1 and 500),
  asked_by uuid references public.profiles(id) on delete set null,
  answered_item_id uuid,
  created_at timestamptz not null default now(),
  foreign key (for_person_id, family_id) references public.people(id, family_id) on delete cascade,
  foreign key (answered_item_id, family_id) references public.items(id, family_id)
    on delete set null (answered_item_id)
);
create index questions_family_idx on public.questions (family_id);
