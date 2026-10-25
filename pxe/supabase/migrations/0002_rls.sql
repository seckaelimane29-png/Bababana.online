-- PXE row-level security (DRAFT — not yet applied).
-- RLS is defense in depth: server code also checks roles and ownership.
-- Server-written tables (orders, order_items, payments, payment_events,
-- enrollments, ledger_entries, payouts, audit_log, moderation_actions) get
-- SELECT policies only; writes happen with the service role on the server.

create or replace function has_role(r app_role) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from user_roles where user_id = auth.uid() and role = r)
     and not exists (select 1 from profiles where id = auth.uid() and suspended_at is not null);
$$;

create or replace function owns_course(c uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from courses where id = c and creator_id = auth.uid());
$$;

create or replace function is_enrolled(c uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from enrollments
                 where course_id = c and user_id = auth.uid() and revoked_at is null);
$$;

-- anon needs these too (public course reads evaluate them); with no auth.uid()
-- they simply return false.
revoke execute on function has_role(app_role), owns_course(uuid), is_enrolled(uuid) from public;
grant  execute on function has_role(app_role), owns_course(uuid), is_enrolled(uuid) to anon, authenticated;

alter table currencies                    enable row level security;
alter table languages                     enable row level security;
alter table categories                    enable row level security;
alter table platform_settings             enable row level security;
alter table profiles                      enable row level security;
alter table user_roles                    enable row level security;
alter table creator_profiles              enable row level security;
alter table creator_verification_requests enable row level security;
alter table courses                       enable row level security;
alter table course_prices                 enable row level security;
alter table course_sections               enable row level security;
alter table video_assets                  enable row level security;
alter table lessons                       enable row level security;
alter table lesson_resources              enable row level security;
alter table orders                        enable row level security;
alter table order_items                   enable row level security;
alter table payments                      enable row level security;
alter table payment_events                enable row level security;
alter table enrollments                   enable row level security;
alter table ledger_entries                enable row level security;
alter table payouts                       enable row level security;
alter table lesson_progress               enable row level security;
alter table reports                       enable row level security;
alter table moderation_actions            enable row level security;
alter table notifications                 enable row level security;
alter table audit_log                     enable row level security;

-- Reference data: public read; admin write.
create policy "read currencies" on currencies for select using (true);
create policy "read languages"  on languages  for select using (true);
create policy "read categories" on categories for select using (is_active or has_role('admin'));
create policy "admin categories" on categories for all using (has_role('admin')) with check (has_role('admin'));
create policy "read settings"  on platform_settings for select using (true);
create policy "admin settings" on platform_settings for update using (has_role('admin')) with check (has_role('admin'));

-- Profiles: owner read/write own; admins read all. Public creator info goes
-- through creator_profiles / the public view below.
create policy "own profile" on profiles for select using (id = auth.uid() or has_role('admin'));
create policy "update own profile" on profiles for update using (id = auth.uid())
  with check (id = auth.uid());
-- Suspension columns are admin-only: block self-edits of them.
revoke update (suspended_at, suspended_reason) on profiles from authenticated;

create policy "own roles" on user_roles for select using (user_id = auth.uid() or has_role('admin'));
-- Role changes go through server actions (service role) with audit_log entries.

-- Creator profiles: public read via view (no payout_details); owner manages own.
create policy "owner reads creator profile" on creator_profiles for select
  using (user_id = auth.uid() or has_role('admin'));
create policy "owner creates creator profile" on creator_profiles for insert
  with check (user_id = auth.uid());
create policy "owner updates creator profile" on creator_profiles for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
revoke update (verified_at) on creator_profiles from authenticated;

create view public_creators with (security_invoker = false) as
  select cp.user_id, cp.username, p.display_name, p.avatar_path, cp.headline, cp.bio,
         cp.expertise, cp.languages, cp.social_links, cp.verified_at is not null as is_verified
  from creator_profiles cp join profiles p on p.id = cp.user_id
  where p.suspended_at is null;
grant select on public_creators to anon, authenticated;

create policy "own verification requests" on creator_verification_requests for select
  using (creator_id = auth.uid() or has_role('admin'));
create policy "request verification" on creator_verification_requests for insert
  with check (creator_id = auth.uid() and status = 'open');

-- Courses: published visible to all; drafts to owner & admins.
create policy "read courses" on courses for select
  using (status = 'published' or creator_id = auth.uid() or has_role('admin'));
create policy "creator inserts course" on courses for insert
  with check (creator_id = auth.uid() and has_role('creator') and status = 'draft');
create policy "creator updates own course" on courses for update
  using (creator_id = auth.uid() and has_role('creator'))
  with check (creator_id = auth.uid() and status in ('draft', 'in_review', 'unpublished'));
-- Publishing (status -> 'published') happens in a server action that applies
-- the review rule from platform_settings.

create policy "read prices" on course_prices for select
  using (exists (select 1 from courses c where c.id = course_id
                 and (c.status = 'published' or c.creator_id = auth.uid() or has_role('admin'))));
create policy "owner manages prices" on course_prices for all
  using (owns_course(course_id)) with check (owns_course(course_id));

create policy "read sections" on course_sections for select
  using (exists (select 1 from courses c where c.id = course_id
                 and (c.status = 'published' or c.creator_id = auth.uid() or has_role('admin'))));
create policy "owner manages sections" on course_sections for all
  using (owns_course(course_id)) with check (owns_course(course_id));

-- Lesson rows (titles, order, preview flag) are public for published courses so
-- the curriculum can be shown. Playback is NOT governed here: the server
-- issues signed playback tokens only after checking preview/enrollment/owner.
create policy "read lessons" on lessons for select
  using (exists (select 1 from courses c where c.id = course_id
                 and ((c.status = 'published' and is_published)
                      or c.creator_id = auth.uid() or has_role('admin'))));
create policy "owner manages lessons" on lessons for all
  using (owns_course(course_id)) with check (owns_course(course_id));

create policy "owner reads video assets" on video_assets for select
  using (owner_id = auth.uid() or has_role('admin'));
-- video_assets are created/updated by the server (upload URL + provider webhooks).

create policy "read resources" on lesson_resources for select
  using (exists (select 1 from lessons l where l.id = lesson_id
                 and (owns_course(l.course_id) or is_enrolled(l.course_id) or has_role('admin'))));
create policy "owner manages resources" on lesson_resources for all
  using (exists (select 1 from lessons l where l.id = lesson_id and owns_course(l.course_id)))
  with check (exists (select 1 from lessons l where l.id = lesson_id and owns_course(l.course_id)));

-- Commerce: read-only to the parties involved.
create policy "buyer reads orders" on orders for select
  using (buyer_id = auth.uid() or has_role('admin'));
create policy "parties read order items" on order_items for select
  using (creator_id = auth.uid() or has_role('admin')
         or exists (select 1 from orders o where o.id = order_id and o.buyer_id = auth.uid()));
create policy "buyer reads payments" on payments for select
  using (has_role('admin') or exists (select 1 from orders o where o.id = order_id and o.buyer_id = auth.uid()));
create policy "admin reads payment events" on payment_events for select using (has_role('admin'));

create policy "read enrollments" on enrollments for select
  using (user_id = auth.uid() or owns_course(course_id) or has_role('admin'));

create policy "creator reads ledger" on ledger_entries for select
  using (creator_id = auth.uid() or has_role('admin'));
create policy "creator reads payouts" on payouts for select
  using (creator_id = auth.uid() or has_role('admin'));

-- Learning progress: students manage their own, only for courses they can access.
create policy "own progress read" on lesson_progress for select
  using (user_id = auth.uid() or owns_course(course_id) or has_role('admin'));
create policy "own progress write" on lesson_progress for insert
  with check (user_id = auth.uid() and (is_enrolled(course_id) or owns_course(course_id)));
create policy "own progress update" on lesson_progress for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Trust & safety.
create policy "file report" on reports for insert
  with check (reporter_id = auth.uid() and status = 'open');
create policy "read reports" on reports for select
  using (reporter_id = auth.uid() or has_role('admin'));
create policy "admin reads moderation" on moderation_actions for select using (has_role('admin'));

create policy "own notifications" on notifications for select using (user_id = auth.uid());
create policy "mark notification read" on notifications for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "admin reads audit" on audit_log for select using (has_role('admin'));
