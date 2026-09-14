-- Applied to Supabase project tiwetfxfubjdrgtbwimm as migration
-- "lock_down_definer_functions".

-- handle_new_user is only ever fired by the auth.users trigger; nobody may
-- call it over the API. (Trigger firing does not require EXECUTE privilege.)
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- The link-check helpers are evaluated inside RLS policies, which run with
-- the querying user's privileges, so `authenticated` must keep EXECUTE.
-- They only report on the caller's own links (auth.uid()), so that surface
-- is harmless. Anonymous users have no uid and no business calling them.
revoke execute on function public.is_teacher_of(uuid) from public, anon;
revoke execute on function public.is_parent_of(uuid) from public, anon;
revoke execute on function public.is_linked_with(uuid) from public, anon;
revoke execute on function public.can_view_student(uuid) from public, anon;
