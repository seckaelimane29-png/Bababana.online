-- Row-level security for all Albadary tables.
-- Applied to Supabase project tiwetfxfubjdrgtbwimm as migration "rls_policies".

-- Link helper functions run as definer so policies can consult the link
-- tables without recursive RLS evaluation.
create or replace function public.is_teacher_of(p_student uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.teacher_links
    where teacher_id = (select auth.uid())
      and student_id = p_student
      and status = 'active'
  );
$$;

create or replace function public.is_parent_of(p_child uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.parent_links
    where parent_id = (select auth.uid())
      and child_id = p_child
      and status = 'active'
  );
$$;

-- Owner, or a teacher/parent with an active link, may view a student's data
create or replace function public.can_view_student(p_user uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
  select p_user = (select auth.uid())
      or public.is_teacher_of(p_user)
      or public.is_parent_of(p_user);
$$;

-- Any active link (either direction, either kind) between me and p_other
create or replace function public.is_linked_with(p_other uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.teacher_links
    where status = 'active'
      and ((teacher_id = (select auth.uid()) and student_id = p_other)
        or (student_id = (select auth.uid()) and teacher_id = p_other))
  ) or exists (
    select 1 from public.parent_links
    where status = 'active'
      and ((parent_id = (select auth.uid()) and child_id = p_other)
        or (child_id = (select auth.uid()) and parent_id = p_other))
  );
$$;

-- surahs: public reference data, read-only for everyone
alter table public.surahs enable row level security;
create policy "surahs are readable by everyone"
  on public.surahs for select
  to anon, authenticated
  using (true);

-- profiles
alter table public.profiles enable row level security;
create policy "own profile, teacher directory, and linked profiles are visible"
  on public.profiles for select
  to authenticated
  using (
    id = (select auth.uid())
    or role = 'teacher'
    or public.is_linked_with(id)
  );
create policy "users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (id = (select auth.uid()));
create policy "users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- teacher_links
alter table public.teacher_links enable row level security;
create policy "participants can view their teacher links"
  on public.teacher_links for select
  to authenticated
  using ((select auth.uid()) in (teacher_id, student_id));
create policy "either party can request a teacher link"
  on public.teacher_links for insert
  to authenticated
  with check (
    requested_by = (select auth.uid())
    and (select auth.uid()) in (teacher_id, student_id)
    and status = 'pending'
  );
create policy "the invited party can respond to a teacher link"
  on public.teacher_links for update
  to authenticated
  using ((select auth.uid()) in (teacher_id, student_id) and (select auth.uid()) <> requested_by)
  with check ((select auth.uid()) in (teacher_id, student_id));
create policy "participants can remove a teacher link"
  on public.teacher_links for delete
  to authenticated
  using ((select auth.uid()) in (teacher_id, student_id));

-- parent_links
alter table public.parent_links enable row level security;
create policy "participants can view their parent links"
  on public.parent_links for select
  to authenticated
  using ((select auth.uid()) in (parent_id, child_id));
create policy "either party can request a parent link"
  on public.parent_links for insert
  to authenticated
  with check (
    requested_by = (select auth.uid())
    and (select auth.uid()) in (parent_id, child_id)
    and status = 'pending'
  );
create policy "the invited party can respond to a parent link"
  on public.parent_links for update
  to authenticated
  using ((select auth.uid()) in (parent_id, child_id) and (select auth.uid()) <> requested_by)
  with check ((select auth.uid()) in (parent_id, child_id));
create policy "participants can remove a parent link"
  on public.parent_links for delete
  to authenticated
  using ((select auth.uid()) in (parent_id, child_id));

-- memorization_plans
alter table public.memorization_plans enable row level security;
create policy "owner and linked adults can view plans"
  on public.memorization_plans for select
  to authenticated
  using (public.can_view_student(user_id));
create policy "owners manage their plans (insert)"
  on public.memorization_plans for insert
  to authenticated
  with check (user_id = (select auth.uid()));
create policy "owners manage their plans (update)"
  on public.memorization_plans for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "owners manage their plans (delete)"
  on public.memorization_plans for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- ayah_progress
alter table public.ayah_progress enable row level security;
create policy "owner and linked adults can view progress"
  on public.ayah_progress for select
  to authenticated
  using (public.can_view_student(user_id));
create policy "owners manage their progress (insert)"
  on public.ayah_progress for insert
  to authenticated
  with check (user_id = (select auth.uid()));
create policy "owners manage their progress (update)"
  on public.ayah_progress for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "owners manage their progress (delete)"
  on public.ayah_progress for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- sessions
alter table public.sessions enable row level security;
create policy "owner and linked adults can view sessions"
  on public.sessions for select
  to authenticated
  using (public.can_view_student(user_id));
create policy "owners record their sessions"
  on public.sessions for insert
  to authenticated
  with check (user_id = (select auth.uid()));
create policy "owners delete their sessions"
  on public.sessions for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- reading_positions
alter table public.reading_positions enable row level security;
create policy "owner and linked adults can view reading position"
  on public.reading_positions for select
  to authenticated
  using (public.can_view_student(user_id));
create policy "owners manage their reading position (insert)"
  on public.reading_positions for insert
  to authenticated
  with check (user_id = (select auth.uid()));
create policy "owners manage their reading position (update)"
  on public.reading_positions for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Aggregated per-student stats for home, progress, teacher, and parent
-- screens. security_invoker means the underlying RLS decides visibility.
create view public.student_overview
with (security_invoker = true) as
select
  p.id as user_id,
  p.display_name,
  p.role,
  (select count(*) from public.ayah_progress ap
    where ap.user_id = p.id and ap.status = 'memorized') as ayahs_memorized,
  (select count(*) from public.ayah_progress ap
    where ap.user_id = p.id and ap.status = 'learning') as ayahs_learning,
  (select count(*) from public.ayah_progress ap
    where ap.user_id = p.id
      and ap.next_review_at is not null
      and ap.next_review_at <= now()) as reviews_due,
  (select max(s.created_at) from public.sessions s
    where s.user_id = p.id) as last_session_at
from public.profiles p;
