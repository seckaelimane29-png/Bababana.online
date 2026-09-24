-- Row-level security for the Family Archive.
-- Applied to Supabase project egbtmfmpkbckzgkksqjg as migration "rls_policies".
--
-- Roles (family_members.role, only counted while status = 'active'):
--   keeper      – everything below, plus edit anyone's people/places/events,
--                 approve members, change roles, see Keeper-only items
--   contributor – add people, places, stories, photos, notes; edit their own
--   viewer      – look and listen; may ask questions
-- Nothing is public. Anonymous users can read nothing.

-- Membership helpers run as definer so policies can consult family_members
-- without recursive RLS. They only answer questions about the caller.
create or replace function public.family_role(p_family uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.family_members
  where family_id = p_family
    and user_id = (select auth.uid())
    and status = 'active';
$$;

-- Any membership row, including one still waiting for approval
create or replace function public.has_membership(p_family uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.family_members
    where family_id = p_family and user_id = (select auth.uid())
  );
$$;

-- True when the caller is an active member of a family that p_user belongs to
create or replace function public.shares_family_with(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.family_members me
    join public.family_members them on them.family_id = me.family_id
    where me.user_id = (select auth.uid())
      and me.status = 'active'
      and them.user_id = p_user
  );
$$;

create or replace function public.is_family_member(p_family uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
  select public.family_role(p_family) is not null;
$$;

create or replace function public.can_contribute(p_family uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(public.family_role(p_family) in ('keeper','contributor'), false);
$$;

create or replace function public.is_keeper(p_family uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(public.family_role(p_family) = 'keeper', false);
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "see yourself and your relatives"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.shares_family_with(id));

create policy "edit your own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- families (created through create_family(); pending members see the name)
-- ---------------------------------------------------------------------------
alter table public.families enable row level security;

create policy "members, including pending ones, see their family"
  on public.families for select to authenticated
  using (public.has_membership(id));

create policy "keepers edit the family"
  on public.families for update to authenticated
  using (public.is_keeper(id))
  with check (public.is_keeper(id));

create policy "keepers can close the family archive"
  on public.families for delete to authenticated
  using (public.is_keeper(id));

-- ---------------------------------------------------------------------------
-- family_members (rows are created and changed through functions)
-- ---------------------------------------------------------------------------
alter table public.family_members enable row level security;

create policy "see your own membership and your family's members"
  on public.family_members for select to authenticated
  using (user_id = (select auth.uid()) or public.is_family_member(family_id));

create policy "keepers remove members, anyone can leave"
  on public.family_members for delete to authenticated
  using (user_id = (select auth.uid()) or public.is_keeper(family_id));

-- ---------------------------------------------------------------------------
-- invitations (accepted and revoked through functions)
-- ---------------------------------------------------------------------------
alter table public.invitations enable row level security;

create policy "keepers see all invitations, others see their own"
  on public.invitations for select to authenticated
  using (public.is_keeper(family_id) or created_by = (select auth.uid()));

create policy "contributors invite; only keepers invite keepers"
  on public.invitations for insert to authenticated
  with check (
    public.can_contribute(family_id)
    and created_by = (select auth.uid())
    and (role <> 'keeper' or public.is_keeper(family_id))
    and used_by is null and used_at is null and revoked_at is null
    and expires_at <= now() + interval '30 days'
  );

create policy "keepers and the sender can delete an invitation"
  on public.invitations for delete to authenticated
  using (public.is_keeper(family_id) or created_by = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Tree tables: people, places, relationships, person_places, events
-- Members read; contributors add; keepers or the author edit and delete.
-- ---------------------------------------------------------------------------
alter table public.people enable row level security;

create policy "members see the family's people"
  on public.people for select to authenticated
  using (public.is_family_member(family_id));
create policy "contributors add people"
  on public.people for insert to authenticated
  with check (public.can_contribute(family_id) and created_by = (select auth.uid()));
create policy "keepers or the author edit people"
  on public.people for update to authenticated
  using (public.is_keeper(family_id) or (created_by = (select auth.uid()) and public.can_contribute(family_id)))
  with check (public.is_keeper(family_id) or (created_by = (select auth.uid()) and public.can_contribute(family_id)));
create policy "keepers or the author remove people"
  on public.people for delete to authenticated
  using (public.is_keeper(family_id) or (created_by = (select auth.uid()) and public.can_contribute(family_id)));

alter table public.people_private enable row level security;

create policy "only keepers see and edit living people's private details"
  on public.people_private for all to authenticated
  using (public.is_keeper(family_id))
  with check (public.is_keeper(family_id));

alter table public.places enable row level security;

create policy "members see the family's places"
  on public.places for select to authenticated
  using (public.is_family_member(family_id));
create policy "contributors add places"
  on public.places for insert to authenticated
  with check (public.can_contribute(family_id) and created_by = (select auth.uid()));
create policy "keepers or the author edit places"
  on public.places for update to authenticated
  using (public.is_keeper(family_id) or (created_by = (select auth.uid()) and public.can_contribute(family_id)))
  with check (public.is_keeper(family_id) or (created_by = (select auth.uid()) and public.can_contribute(family_id)));
create policy "keepers or the author remove places"
  on public.places for delete to authenticated
  using (public.is_keeper(family_id) or (created_by = (select auth.uid()) and public.can_contribute(family_id)));

alter table public.relationships enable row level security;

create policy "members see relationships"
  on public.relationships for select to authenticated
  using (public.is_family_member(family_id));
create policy "contributors add relationships"
  on public.relationships for insert to authenticated
  with check (public.can_contribute(family_id) and created_by = (select auth.uid()));
create policy "keepers or the author edit relationships"
  on public.relationships for update to authenticated
  using (public.is_keeper(family_id) or (created_by = (select auth.uid()) and public.can_contribute(family_id)))
  with check (public.is_keeper(family_id) or (created_by = (select auth.uid()) and public.can_contribute(family_id)));
create policy "keepers or the author remove relationships"
  on public.relationships for delete to authenticated
  using (public.is_keeper(family_id) or (created_by = (select auth.uid()) and public.can_contribute(family_id)));

alter table public.person_places enable row level security;

create policy "members see where people lived"
  on public.person_places for select to authenticated
  using (public.is_family_member(family_id));
create policy "contributors link people to places"
  on public.person_places for insert to authenticated
  with check (public.can_contribute(family_id) and created_by = (select auth.uid()));
create policy "keepers or the author edit person places"
  on public.person_places for update to authenticated
  using (public.is_keeper(family_id) or (created_by = (select auth.uid()) and public.can_contribute(family_id)))
  with check (public.is_keeper(family_id) or (created_by = (select auth.uid()) and public.can_contribute(family_id)));
create policy "keepers or the author unlink person places"
  on public.person_places for delete to authenticated
  using (public.is_keeper(family_id) or (created_by = (select auth.uid()) and public.can_contribute(family_id)));

alter table public.events enable row level security;

create policy "members see the timeline"
  on public.events for select to authenticated
  using (public.is_family_member(family_id));
create policy "contributors add events"
  on public.events for insert to authenticated
  with check (public.can_contribute(family_id) and created_by = (select auth.uid()));
create policy "keepers or the author edit events"
  on public.events for update to authenticated
  using (public.is_keeper(family_id) or (created_by = (select auth.uid()) and public.can_contribute(family_id)))
  with check (public.is_keeper(family_id) or (created_by = (select auth.uid()) and public.can_contribute(family_id)));
create policy "keepers or the author remove events"
  on public.events for delete to authenticated
  using (public.is_keeper(family_id) or (created_by = (select auth.uid()) and public.can_contribute(family_id)));

alter table public.event_people enable row level security;

create policy "members see who is in an event"
  on public.event_people for select to authenticated
  using (public.is_family_member(family_id));
create policy "contributors add people to events"
  on public.event_people for insert to authenticated
  with check (public.can_contribute(family_id));
create policy "contributors remove people from events"
  on public.event_people for delete to authenticated
  using (public.can_contribute(family_id));

-- ---------------------------------------------------------------------------
-- items: the archive, with per-item visibility
-- ---------------------------------------------------------------------------
alter table public.items enable row level security;

create policy "members see family items, keepers see keeper items, authors see their own"
  on public.items for select to authenticated
  using (
    public.is_family_member(family_id)
    and (
      visibility = 'family'
      or created_by = (select auth.uid())
      or (visibility = 'keepers' and public.is_keeper(family_id))
    )
  );
create policy "contributors add items"
  on public.items for insert to authenticated
  with check (public.can_contribute(family_id) and created_by = (select auth.uid()));
create policy "the author or a keeper edits an item (never someone else's private item)"
  on public.items for update to authenticated
  using (
    (created_by = (select auth.uid()) and public.can_contribute(family_id))
    or (public.is_keeper(family_id) and visibility <> 'private')
  )
  with check (
    (created_by = (select auth.uid()) and public.can_contribute(family_id))
    or (public.is_keeper(family_id) and visibility <> 'private')
  );
create policy "the author or a keeper removes an item"
  on public.items for delete to authenticated
  using (
    (created_by = (select auth.uid()) and public.can_contribute(family_id))
    or (public.is_keeper(family_id) and visibility <> 'private')
  );

-- Link tables inherit the item's visibility: the exists() below runs under
-- the caller's own RLS on items.
alter table public.item_people enable row level security;

create policy "see who is in the items you can see"
  on public.item_people for select to authenticated
  using (exists (select 1 from public.items i where i.id = item_id));
create policy "contributors tag people in items they can see"
  on public.item_people for insert to authenticated
  with check (public.can_contribute(family_id) and exists (select 1 from public.items i where i.id = item_id));
create policy "contributors untag people in items they can see"
  on public.item_people for delete to authenticated
  using (public.can_contribute(family_id) and exists (select 1 from public.items i where i.id = item_id));

alter table public.event_items enable row level security;

create policy "see event attachments you can see"
  on public.event_items for select to authenticated
  using (exists (select 1 from public.items i where i.id = item_id));
create policy "contributors attach items to events"
  on public.event_items for insert to authenticated
  with check (public.can_contribute(family_id) and exists (select 1 from public.items i where i.id = item_id));
create policy "contributors detach items from events"
  on public.event_items for delete to authenticated
  using (public.can_contribute(family_id) and exists (select 1 from public.items i where i.id = item_id));

-- ---------------------------------------------------------------------------
-- notes and questions
-- ---------------------------------------------------------------------------
alter table public.notes enable row level security;

create policy "members see notes on people and on items they can see"
  on public.notes for select to authenticated
  using (
    public.is_family_member(family_id)
    and (person_id is not null or exists (select 1 from public.items i where i.id = item_id))
  );
create policy "contributors write notes"
  on public.notes for insert to authenticated
  with check (
    public.can_contribute(family_id)
    and author_id = (select auth.uid())
    and (person_id is not null or exists (select 1 from public.items i where i.id = item_id))
  );
create policy "authors edit their notes"
  on public.notes for update to authenticated
  using (author_id = (select auth.uid()) and public.is_family_member(family_id))
  with check (author_id = (select auth.uid()) and public.is_family_member(family_id));
create policy "authors or keepers remove notes"
  on public.notes for delete to authenticated
  using (author_id = (select auth.uid()) or public.is_keeper(family_id));

alter table public.questions enable row level security;

create policy "members see open questions"
  on public.questions for select to authenticated
  using (public.is_family_member(family_id));
create policy "any member can ask a relative a question"
  on public.questions for insert to authenticated
  with check (public.is_family_member(family_id) and asked_by = (select auth.uid()));
create policy "contributors mark questions answered"
  on public.questions for update to authenticated
  using (public.can_contribute(family_id))
  with check (public.can_contribute(family_id));
create policy "the asker or a keeper removes a question"
  on public.questions for delete to authenticated
  using (asked_by = (select auth.uid()) or public.is_keeper(family_id));

-- ---------------------------------------------------------------------------
-- Timeline view: curated events, births, deaths and dated stories.
-- security_invoker makes it respect the caller's RLS on every base table.
-- ---------------------------------------------------------------------------
create view public.family_timeline
with (security_invoker = true) as
  select e.family_id, 'event'::text as source, e.id as source_id, e.year, e.date,
         e.title, e.place_id, e.is_major
  from public.events e
  union all
  select p.family_id, 'birth', p.id, p.birth_year, null::date,
         trim(p.given_name || ' ' || coalesce(p.family_name, '')) || ' is born',
         p.birth_place_id, false
  from public.people p
  where p.birth_year is not null
  union all
  select p.family_id, 'death', p.id, p.death_year, null::date,
         trim(p.given_name || ' ' || coalesce(p.family_name, '')) || ' passes away',
         p.death_place_id, false
  from public.people p
  where p.death_year is not null
  union all
  select i.family_id, 'story', i.id, i.year, i.date,
         coalesce(i.title, 'A family story'), i.place_id, false
  from public.items i
  where i.kind = 'story' and i.year is not null;
