-- API hardening: who may call which function over /rest/v1/rpc.
-- Applied to Supabase project egbtmfmpkbckzgkksqjg as migration "lock_down_functions".

-- Trigger functions: fired by the database only, never called over the API.
-- (Trigger firing does not require EXECUTE privilege.)
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.protect_last_keeper() from public, anon, authenticated;

-- Everything else needs a signed-in user. RLS policies evaluate the helper
-- functions with the caller's privileges, so `authenticated` keeps EXECUTE on
-- them; they only answer questions about the caller's own membership.
do $$
declare
  fn text;
begin
  foreach fn in array array[
    'public.family_role(uuid)',
    'public.has_membership(uuid)',
    'public.shares_family_with(uuid)',
    'public.is_family_member(uuid)',
    'public.can_contribute(uuid)',
    'public.is_keeper(uuid)',
    'public.can_read_media(text)',
    'public.create_family(text, text)',
    'public.accept_invitation(text)',
    'public.approve_member(uuid, uuid, text)',
    'public.set_member_role(uuid, uuid, text)',
    'public.revoke_invitation(uuid)',
    'public.set_my_person(uuid, uuid)',
    'public.generate_invite_code()'
  ] loop
    execute format('revoke execute on function %s from public, anon', fn);
    execute format('grant execute on function %s to authenticated', fn);
  end loop;
end;
$$;

-- Intentionally public: someone opening an invitation link sees which family
-- invited them and who sent it, before creating an account. The code itself
-- is the secret (8 characters from a 31-character alphabet).
grant execute on function public.invitation_preview(text) to anon, authenticated;
