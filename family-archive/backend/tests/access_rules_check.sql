-- Access-rule check for the Family Archive.
-- Run the whole file in the Supabase SQL editor (as postgres). It creates five
-- throwaway users (@test.local), acts as each one, records what they can and
-- cannot do, deletes everything it created, and returns one PASS/FAIL row per
-- check. Every row should read PASS.

create temp table t_results (n serial, check_name text, expected text, actual text);
create temp table t_ids (k text primary key, v uuid);
create temp table t_codes (invitee_name text, code text);
grant all on t_results, t_ids, t_codes to authenticated, anon;
grant usage on sequence t_results_n_seq to authenticated, anon;

insert into auth.users (id, email, raw_user_meta_data, aud, role)
values
 ('00000000-0000-0000-0000-00000000000a','k@test.local','{"display_name":"Test Keeper"}','authenticated','authenticated'),
 ('00000000-0000-0000-0000-00000000000b','c@test.local','{"display_name":"Test Contributor"}','authenticated','authenticated'),
 ('00000000-0000-0000-0000-00000000000c','v@test.local','{"display_name":"Test Viewer"}','authenticated','authenticated'),
 ('00000000-0000-0000-0000-00000000000d','p@test.local','{"display_name":"Test Pending"}','authenticated','authenticated'),
 ('00000000-0000-0000-0000-00000000000e','x@test.local','{"display_name":"Test Outsider"}','authenticated','authenticated');

-- Keeper creates the family, a person and two invitations
set role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}',false);
insert into t_ids values ('fam', public.create_family('TEST Secka Family','test'));
insert into public.people (family_id, given_name, family_name, birth_year, created_by)
  select v, 'Aminata','Secka',1948, '00000000-0000-0000-0000-00000000000a' from t_ids where k='fam';
insert into t_ids select 'aminata', id from public.people where given_name='Aminata' and family_id=(select v from t_ids where k='fam');
insert into public.invitations (family_id, role, created_by, invitee_name) select v,'contributor','00000000-0000-0000-0000-00000000000a','C' from t_ids where k='fam';
insert into public.invitations (family_id, role, created_by, invitee_name) select v,'viewer','00000000-0000-0000-0000-00000000000a','V' from t_ids where k='fam';
insert into t_codes select invitee_name, code from public.invitations where family_id=(select v from t_ids where k='fam');
insert into t_results(check_name,expected,actual) select 'invite code is 8 readable characters','true', (select bool_and(code ~ '^[2-9A-HJKMNP-Z]{8}$') from t_codes)::text;

-- Invitees accept (a Keeper's invitation means they are active at once)
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}',false);
insert into t_results(check_name,expected,actual) select 'contributor joins via keeper invite','active', (select status from public.accept_invitation((select code from t_codes where invitee_name='C')));
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000c","role":"authenticated"}',false);
insert into t_results(check_name,expected,actual) select 'viewer joins via keeper invite','active', (select status from public.accept_invitation((select code from t_codes where invitee_name='V')));
do $$ begin
  perform public.accept_invitation((select code from t_codes where invitee_name='V'));
  insert into t_results(check_name,expected,actual) values ('invite code works only once','blocked','ALLOWED');
exception when others then insert into t_results(check_name,expected,actual) values ('invite code works only once','blocked','blocked'); end $$;

-- Contributor: items at three visibility levels, invitations, editing limits
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}',false);
insert into public.items (family_id, kind, title, visibility, created_by, storage_path)
  select v,'photo','family photo','family','00000000-0000-0000-0000-00000000000b', v::text||'/items/fam.jpg' from t_ids where k='fam';
insert into public.items (family_id, kind, title, visibility, created_by)
  select v,'document','keepers doc','keepers','00000000-0000-0000-0000-00000000000b' from t_ids where k='fam';
insert into public.items (family_id, kind, title, visibility, created_by, storage_path)
  select v,'note','private note','private','00000000-0000-0000-0000-00000000000b', v::text||'/items/priv.jpg' from t_ids where k='fam';
do $$ begin
  insert into public.invitations (family_id, role, created_by) select v,'keeper','00000000-0000-0000-0000-00000000000b' from t_ids where k='fam';
  insert into t_results(check_name,expected,actual) values ('contributor cannot invite a keeper','blocked','ALLOWED');
exception when others then insert into t_results(check_name,expected,actual) values ('contributor cannot invite a keeper','blocked','blocked'); end $$;
insert into public.invitations (family_id, role, created_by, invitee_name) select v,'contributor','00000000-0000-0000-0000-00000000000b','P' from t_ids where k='fam';
update public.people set bio='edited by contributor' where given_name='Aminata';
insert into t_results(check_name,expected,actual) select 'contributor cannot edit a keeper''s person','unchanged', (select case when bio is null then 'unchanged' else 'EDITED' end from public.people where given_name='Aminata');
insert into t_results(check_name,expected,actual) select 'contributor sees all 3 of own items','3', count(*)::text from public.items;
insert into t_codes select invitee_name, code from public.invitations where invitee_name='P';

-- A contributor's invitation leaves the new member pending
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000d","role":"authenticated"}',false);
insert into t_results(check_name,expected,actual) select 'contributor-sent invite needs approval','pending', (select status from public.accept_invitation((select code from t_codes where invitee_name='P')));
insert into t_results(check_name,expected,actual) select 'pending member sees family name','1', count(*)::text from public.families;
insert into t_results(check_name,expected,actual) select 'pending member sees no people','0', count(*)::text from public.people;
insert into t_results(check_name,expected,actual) select 'pending member sees no items','0', count(*)::text from public.items;

-- Viewer
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000c","role":"authenticated"}',false);
insert into t_results(check_name,expected,actual) select 'viewer sees only family-visible items','1', count(*)::text from public.items;
insert into t_results(check_name,expected,actual) select 'viewer sees people','1', count(*)::text from public.people;
insert into t_results(check_name,expected,actual) select 'viewer can read family photo file','true', public.can_read_media((select v::text from t_ids where k='fam')||'/items/fam.jpg')::text;
insert into t_results(check_name,expected,actual) select 'viewer cannot read private file','false', public.can_read_media((select v::text from t_ids where k='fam')||'/items/priv.jpg')::text;
do $$ begin
  insert into public.items (family_id, kind, title, created_by) select v,'photo','x','00000000-0000-0000-0000-00000000000c' from t_ids where k='fam';
  insert into t_results(check_name,expected,actual) values ('viewer cannot add items','blocked','ALLOWED');
exception when others then insert into t_results(check_name,expected,actual) values ('viewer cannot add items','blocked','blocked'); end $$;
do $$ begin
  insert into public.questions (family_id, for_person_id, question, asked_by) select (select v from t_ids where k='fam'),(select v from t_ids where k='aminata'),'How did you meet Grandpa?','00000000-0000-0000-0000-00000000000c';
  insert into t_results(check_name,expected,actual) values ('viewer can ask a question','allowed','allowed');
exception when others then insert into t_results(check_name,expected,actual) values ('viewer can ask a question','allowed','BLOCKED: '||sqlerrm); end $$;
do $$ begin
  insert into public.people_private (person_id, family_id, birth_date) select (select v from t_ids where k='aminata'),(select v from t_ids where k='fam'),'1948-03-02';
  insert into t_results(check_name,expected,actual) values ('viewer cannot write private details','blocked','ALLOWED');
exception when others then insert into t_results(check_name,expected,actual) values ('viewer cannot write private details','blocked','blocked'); end $$;

-- Outsider
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000e","role":"authenticated"}',false);
insert into t_results(check_name,expected,actual) select 'outsider sees no family','0', count(*)::text from public.families;
insert into t_results(check_name,expected,actual) select 'outsider sees no people','0', count(*)::text from public.people;
insert into t_results(check_name,expected,actual) select 'outsider sees only own profile','1', count(*)::text from public.profiles;
insert into t_results(check_name,expected,actual) select 'outsider cannot read family photo file','false', public.can_read_media((select v::text from t_ids where k='fam')||'/items/fam.jpg')::text;
do $$ begin
  insert into public.people (family_id, given_name, created_by) select v,'Intruder','00000000-0000-0000-0000-00000000000e' from t_ids where k='fam';
  insert into t_results(check_name,expected,actual) values ('outsider cannot add people','blocked','ALLOWED');
exception when others then insert into t_results(check_name,expected,actual) values ('outsider cannot add people','blocked','blocked'); end $$;

-- Keeper
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}',false);
insert into t_results(check_name,expected,actual) select 'keeper sees family + keeper items, not private','2', count(*)::text from public.items;
insert into t_results(check_name,expected,actual) select 'keeper sees the pending member','1', count(*)::text from public.family_members where status='pending';
select public.approve_member((select v from t_ids where k='fam'),'00000000-0000-0000-0000-00000000000d', 'viewer');
insert into public.people_private (person_id, family_id, birth_date) select (select v from t_ids where k='aminata'),(select v from t_ids where k='fam'),'1948-03-02';
insert into t_results(check_name,expected,actual) select 'keeper writes private details','1', count(*)::text from public.people_private;
do $$ begin
  perform public.set_member_role((select v from t_ids where k='fam'),'00000000-0000-0000-0000-00000000000a','viewer');
  insert into t_results(check_name,expected,actual) values ('last keeper cannot step down','blocked','ALLOWED');
exception when others then insert into t_results(check_name,expected,actual) values ('last keeper cannot step down','blocked','blocked'); end $$;
update public.items set title='keeper edit' where title='private note';
insert into t_results(check_name,expected,actual) select 'keeper cannot edit someone''s private item','unchanged', case when exists(select 1 from public.items where title='keeper edit') then 'EDITED' else 'unchanged' end;
insert into t_results(check_name,expected,actual) select 'timeline shows the birth','1', count(*)::text from public.family_timeline where source='birth';

-- The approved member
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000d","role":"authenticated"}',false);
insert into t_results(check_name,expected,actual) select 'approved member now sees people','1', count(*)::text from public.people;
insert into t_results(check_name,expected,actual) select 'viewer-role member sees no private details','0', count(*)::text from public.people_private;

-- Not signed in
set role anon;
select set_config('request.jwt.claims','{"role":"anon"}',false);
insert into t_results(check_name,expected,actual) select 'anon preview of a used invite (lowercase code)','used', (select status from public.invitation_preview((select lower(code) from t_codes where invitee_name='C')));
insert into t_results(check_name,expected,actual) select 'anon sees no families','0', count(*)::text from public.families;
do $$ begin
  perform public.create_family('anon family');
  insert into t_results(check_name,expected,actual) values ('anon cannot create a family','blocked','ALLOWED');
exception when others then insert into t_results(check_name,expected,actual) values ('anon cannot create a family','blocked','blocked'); end $$;

-- Clean up
reset role;
select set_config('request.jwt.claims','',false);
delete from public.families where name = 'TEST Secka Family';
delete from auth.users where email like '%@test.local';
select n, check_name, expected, actual, case when expected = actual then 'PASS' else 'FAIL' end as result from t_results order by n;
