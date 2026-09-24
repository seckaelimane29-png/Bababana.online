-- Private media storage for photos, videos, voice recordings and documents.
-- Applied to Supabase project egbtmfmpkbckzgkksqjg as migration "storage".
--
-- Object paths are "<family_id>/<anything>", e.g.
--   8f2c…/items/5b1e….m4a
-- A file can be read by its uploader, or by anyone who can see a row in the
-- same family that points at it (an item, a person's portrait, a place or
-- family cover). Item visibility therefore also governs the file.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'family-media', 'family-media', false,
  52428800, -- 50 MB, the project's upload limit
  array['image/*','video/*','audio/*','application/pdf']
);

create or replace function public.safe_uuid(p_text text)
returns uuid
language sql
immutable
set search_path = ''
as $$
  select case
    when p_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then p_text::uuid
  end;
$$;

-- Runs with the caller's privileges, so every lookup obeys RLS. The family in
-- the path must match the row's family, so a row in one family can never be
-- pointed at another family's file.
create or replace function public.can_read_media(p_name text)
returns boolean
language sql
stable
set search_path = ''
as $$
  with target as (select public.safe_uuid(split_part(p_name, '/', 1)) as family_id)
  select exists (select 1 from public.items i, target t
                 where i.storage_path = p_name and i.family_id = t.family_id)
      or exists (select 1 from public.people p, target t
                 where p.portrait_path = p_name and p.family_id = t.family_id)
      or exists (select 1 from public.places pl, target t
                 where pl.cover_path = p_name and pl.family_id = t.family_id)
      or exists (select 1 from public.families f, target t
                 where f.cover_path = p_name and f.id = t.family_id
                   and public.is_family_member(f.id));
$$;

create policy "family media: read what you may see"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'family-media'
    and (owner_id = (select auth.uid())::text or public.can_read_media(name))
  );

create policy "family media: contributors upload into their family"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'family-media'
    and public.can_contribute(public.safe_uuid((storage.foldername(name))[1]))
  );

create policy "family media: uploaders replace their own files"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'family-media'
    and owner_id = (select auth.uid())::text
    and public.can_contribute(public.safe_uuid((storage.foldername(name))[1]))
  )
  with check (
    bucket_id = 'family-media'
    and public.can_contribute(public.safe_uuid((storage.foldername(name))[1]))
  );

create policy "family media: uploaders, or keepers who can see it, delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'family-media'
    and (
      owner_id = (select auth.uid())::text
      or (public.is_keeper(public.safe_uuid((storage.foldername(name))[1]))
          and public.can_read_media(name))
    )
  );
