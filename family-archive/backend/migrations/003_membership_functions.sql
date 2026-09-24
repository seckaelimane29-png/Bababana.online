-- Membership workflow: create a family, invite, preview, accept, approve,
-- change roles, and link a member to their own place in the tree.
-- Applied to Supabase project egbtmfmpkbckzgkksqjg as migration "membership_functions".

-- A person in the tree can be claimed by at most one member.
create unique index family_members_person_uniq
  on public.family_members (family_id, person_id) where person_id is not null;

-- Profile photos are not stored separately: a member's portrait is the
-- portrait of the person they are linked to, which is governed by the
-- family's own media rules.
alter table public.profiles drop column avatar_path;

-- Normalise what people type: "secka-7q4m 2x" -> "SECKA7Q4M2X"
create or replace function public.normalize_invite_code(p_code text)
returns text
language sql
immutable
set search_path = ''
as $$
  select upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
$$;

-- Create a family archive; the caller becomes its first Keeper.
create or replace function public.create_family(p_name text, p_tagline text default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_family uuid;
begin
  if v_uid is null then
    raise exception 'Sign in to create a family archive' using errcode = '42501';
  end if;
  insert into public.families (name, tagline, created_by)
  values (trim(p_name), nullif(trim(p_tagline), ''), v_uid)
  returning id into v_family;
  insert into public.family_members (family_id, user_id, role, status, joined_at)
  values (v_family, v_uid, 'keeper', 'active', now());
  return v_family;
end;
$$;

-- What an invitee sees before joining: the family name and who invited them.
-- Callable before sign-up, so it reveals nothing beyond that.
create or replace function public.invitation_preview(p_code text)
returns table (
  family_name text,
  invited_by text,
  invitee_name text,
  relation text,
  role text,
  expires_at timestamptz,
  status text
)
language sql
stable
security definer
set search_path = ''
as $$
  select f.name,
         pr.display_name,
         i.invitee_name,
         i.relation,
         i.role,
         i.expires_at,
         case
           when i.revoked_at is not null then 'revoked'
           when i.used_at is not null then 'used'
           when i.expires_at < now() then 'expired'
           else 'valid'
         end
  from public.invitations i
  join public.families f on f.id = i.family_id
  left join public.profiles pr on pr.id = i.created_by
  where i.code = public.normalize_invite_code(p_code);
$$;

-- Join with an invitation code. The new member starts as 'pending' and a
-- Keeper approves them; an invitation sent by a Keeper counts as that
-- approval, so the member is active straight away.
create or replace function public.accept_invitation(p_code text)
returns table (family_id uuid, status text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_inv public.invitations%rowtype;
  v_status text;
  v_person uuid;
begin
  if v_uid is null then
    raise exception 'Sign in to accept the invitation' using errcode = '42501';
  end if;

  select * into v_inv
  from public.invitations i
  where i.code = public.normalize_invite_code(p_code)
  for update;

  if not found then
    raise exception 'This invitation code does not exist. Check it and try again.' using errcode = 'P0002';
  elsif v_inv.revoked_at is not null then
    raise exception 'This invitation was cancelled. Ask for a new one.' using errcode = '22023';
  elsif v_inv.used_at is not null then
    raise exception 'This invitation has already been used. Ask for a new one.' using errcode = '22023';
  elsif v_inv.expires_at < now() then
    raise exception 'This invitation has expired. Ask for a new one.' using errcode = '22023';
  end if;

  if exists (select 1 from public.family_members m
             where m.family_id = v_inv.family_id and m.user_id = v_uid) then
    raise exception 'You are already part of this family.' using errcode = '23505';
  end if;

  v_status := case
    when exists (select 1 from public.family_members m
                 where m.family_id = v_inv.family_id and m.user_id = v_inv.created_by
                   and m.role = 'keeper' and m.status = 'active')
      then 'active' else 'pending' end;

  -- Only link the tree node if nobody has claimed it yet.
  v_person := case
    when v_inv.person_id is not null and not exists (
      select 1 from public.family_members m
      where m.family_id = v_inv.family_id and m.person_id = v_inv.person_id)
    then v_inv.person_id end;

  insert into public.family_members
    (family_id, user_id, role, status, person_id, invited_by, invitation_id, joined_at)
  values
    (v_inv.family_id, v_uid, v_inv.role, v_status, v_person, v_inv.created_by, v_inv.id,
     case when v_status = 'active' then now() end);

  update public.invitations set used_by = v_uid, used_at = now() where id = v_inv.id;

  return query select v_inv.family_id, v_status;
end;
$$;

-- Keepers approve a pending member, optionally changing the role.
create or replace function public.approve_member(p_family uuid, p_user uuid, p_role text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_keeper(p_family) then
    raise exception 'Only a Keeper can approve new members' using errcode = '42501';
  end if;
  if p_role is not null and p_role not in ('keeper','contributor','viewer') then
    raise exception 'Unknown role %', p_role using errcode = '22023';
  end if;
  update public.family_members
  set status = 'active',
      role = coalesce(p_role, role),
      joined_at = coalesce(joined_at, now())
  where family_id = p_family and user_id = p_user and status = 'pending';
  if not found then
    raise exception 'No pending request from this person' using errcode = 'P0002';
  end if;
end;
$$;

create or replace function public.set_member_role(p_family uuid, p_user uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_keeper(p_family) then
    raise exception 'Only a Keeper can change roles' using errcode = '42501';
  end if;
  if p_role not in ('keeper','contributor','viewer') then
    raise exception 'Unknown role %', p_role using errcode = '22023';
  end if;
  update public.family_members set role = p_role
  where family_id = p_family and user_id = p_user;
  if not found then
    raise exception 'This person is not a member of the family' using errcode = 'P0002';
  end if;
end;
$$;

-- Keepers, or whoever sent it, can cancel an unused invitation.
create or replace function public.revoke_invitation(p_invitation uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_family uuid;
  v_creator uuid;
begin
  select family_id, created_by into v_family, v_creator
  from public.invitations where id = p_invitation;
  if not found or not (public.is_keeper(v_family) or v_creator = (select auth.uid())) then
    raise exception 'Invitation not found' using errcode = 'P0002';
  end if;
  update public.invitations set revoked_at = now()
  where id = p_invitation and used_at is null and revoked_at is null;
end;
$$;

-- "This is me": link the caller's membership to a person in the tree.
create or replace function public.set_my_person(p_family uuid, p_person uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_family_member(p_family) then
    raise exception 'You are not a member of this family' using errcode = '42501';
  end if;
  update public.family_members set person_id = p_person
  where family_id = p_family and user_id = (select auth.uid());
end;
$$;

-- Every family keeps at least one active Keeper. Deleting the family itself,
-- or a user deleting their account, is still allowed.
create or replace function public.protect_last_keeper()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role = 'keeper' and old.status = 'active'
     and (tg_op = 'DELETE' or new.role <> 'keeper' or new.status <> 'active')
     and exists (select 1 from public.families where id = old.family_id)
     and exists (select 1 from public.profiles where id = old.user_id)
     and not exists (
       select 1 from public.family_members m
       where m.family_id = old.family_id and m.user_id <> old.user_id
         and m.role = 'keeper' and m.status = 'active')
  then
    raise exception 'The family needs at least one Keeper. Make someone else a Keeper first.'
      using errcode = '23514';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger family_members_protect_last_keeper
  before update or delete on public.family_members
  for each row execute function public.protect_last_keeper();
