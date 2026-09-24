// Family Archive backend client: Supabase project "family-archive" (eu-west-3).
// Usage (ES module):
//   import { api } from './js/family-api.js';
//   await api.auth.signIn(email, password);
//   const [family] = await api.families.mine();
//   const tree = await api.tree(family.id);
//
// The publishable key is safe to ship to browsers: every table and every file
// is protected by row-level security, so the key only grants what the
// policies allow. See backend/README.md for the rules.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const SUPABASE_URL = 'https://egbtmfmpkbckzgkksqjg.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_gg0l38EGA8ilgMBi8Gnk0g_6BxmTfl3';
export const MEDIA_BUCKET = 'family-media';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Story themes, in the order the "What is it about?" screen shows them.
export const STORY_CATEGORIES = [
  { id: 'childhood', label: 'Childhood' },
  { id: 'parents', label: 'Parents' },
  { id: 'marriage', label: 'Marriage' },
  { id: 'work', label: 'Work' },
  { id: 'migration', label: 'Migration' },
  { id: 'traditions', label: 'Family traditions' },
  { id: 'events', label: 'Important events' },
  { id: 'life_lessons', label: 'Life lessons' },
  { id: 'other', label: 'Other' },
];

function must(result) {
  if (result.error) throw result.error;
  return result.data;
}

async function uid() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw error ?? new Error('Not signed in');
  return data.user.id;
}

function extensionOf(file) {
  const fromName = file.name?.includes('.') ? file.name.split('.').pop() : '';
  return (fromName || file.type?.split('/')[1] || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Upload a file into the family's folder and return its storage path.
async function upload(familyId, folder, file) {
  const path = `${familyId}/${folder}/${crypto.randomUUID()}.${extensionOf(file)}`;
  must(await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  }));
  return path;
}

// Edge functions return { error } bodies with a readable message.
async function invoke(name, body) {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    let message = error.message;
    try {
      message = (await error.context.json()).error ?? message;
    } catch { /* keep the generic message */ }
    throw new Error(message);
  }
  return data;
}

export const api = {
  auth: {
    signUp: (email, password, displayName) =>
      must(supabase.auth.signUp({ email, password, options: { data: { display_name: displayName } } })),
    signIn: (email, password) => must(supabase.auth.signInWithPassword({ email, password })),
    // Passwordless sign-in by email link: easier for older relatives.
    sendMagicLink: (email, redirectTo) =>
      must(supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } })),
    signOut: () => supabase.auth.signOut(),
    onChange: (cb) => supabase.auth.onAuthStateChange(cb),
    user: () => supabase.auth.getUser().then((r) => r.data.user),
  },

  profile: {
    me: async () => must(await supabase.from('profiles').select('*').eq('id', await uid()).single()),
    // settings: { large_text, autoplay_stories, ... }
    update: async (fields) =>
      must(await supabase.from('profiles').update(fields).eq('id', await uid()).select().single()),
  },

  families: {
    // Families you belong to, with your role and status ('pending' until approved).
    mine: async () => {
      const rows = must(await supabase.from('family_members')
        .select('role, status, person_id, family:families(*)')
        .eq('user_id', await uid()));
      return rows.map((r) => ({ ...r.family, my_role: r.role, my_status: r.status, my_person_id: r.person_id }));
    },
    create: async (name, tagline) => must(await supabase.rpc('create_family', { p_name: name, p_tagline: tagline ?? null })),
    update: async (familyId, fields) =>
      must(await supabase.from('families').update(fields).eq('id', familyId).select().single()),
    setCover: async (familyId, file) => {
      const cover_path = await upload(familyId, 'covers', file);
      return api.families.update(familyId, { cover_path });
    },
  },

  members: {
    list: async (familyId) =>
      must(await supabase.from('family_members')
        .select('user_id, role, status, person_id, joined_at, created_at, invited_by, profile:profiles!family_members_user_id_fkey(display_name)')
        .eq('family_id', familyId).order('created_at')),
    approve: async (familyId, userId, role) =>
      must(await supabase.rpc('approve_member', { p_family: familyId, p_user: userId, p_role: role ?? null })),
    decline: async (familyId, userId) =>
      must(await supabase.from('family_members').delete().eq('family_id', familyId).eq('user_id', userId).eq('status', 'pending')),
    setRole: async (familyId, userId, role) =>
      must(await supabase.rpc('set_member_role', { p_family: familyId, p_user: userId, p_role: role })),
    remove: async (familyId, userId) =>
      must(await supabase.from('family_members').delete().eq('family_id', familyId).eq('user_id', userId)),
    leave: async (familyId) =>
      must(await supabase.from('family_members').delete().eq('family_id', familyId).eq('user_id', await uid())),
    // "This is me" in the tree
    setMyPerson: async (familyId, personId) =>
      must(await supabase.rpc('set_my_person', { p_family: familyId, p_person: personId })),
  },

  invitations: {
    // role: 'viewer' | 'contributor' | 'keeper' (keeper invitations: Keepers only)
    create: async (familyId, { inviteeName, relation, role = 'contributor', personId } = {}) =>
      must(await supabase.from('invitations').insert({
        family_id: familyId,
        invitee_name: inviteeName ?? null,
        relation: relation ?? null,
        role,
        person_id: personId ?? null,
        created_by: await uid(),
      }).select().single()),
    list: async (familyId) =>
      must(await supabase.from('invitations').select('*').eq('family_id', familyId).order('created_at', { ascending: false })),
    // Works before sign-in: family name, who invited you, and whether the code is still valid.
    preview: async (code) => must(await supabase.rpc('invitation_preview', { p_code: code }))[0] ?? null,
    // Returns { family_id, status } — status is 'active' or 'pending' (waiting for a Keeper).
    accept: async (code) => must(await supabase.rpc('accept_invitation', { p_code: code }))[0],
    revoke: async (invitationId) => must(await supabase.rpc('revoke_invitation', { p_invitation: invitationId })),
    // "7Q4M2XKD" → "7Q4M 2XKD" for the invite card
    format: (code) => code.replace(/(.{4})(?=.)/g, '$1 '),
  },

  people: {
    list: async (familyId) =>
      must(await supabase.from('people').select('*').eq('family_id', familyId).order('birth_year', { nullsFirst: false })),
    get: async (personId) => must(await supabase.from('people').select('*').eq('id', personId).single()),
    add: async (familyId, fields) =>
      must(await supabase.from('people').insert({ ...fields, family_id: familyId, created_by: await uid() }).select().single()),
    update: async (personId, fields) =>
      must(await supabase.from('people').update(fields).eq('id', personId).select().single()),
    remove: async (personId) => must(await supabase.from('people').delete().eq('id', personId)),
    setPortrait: async (familyId, personId, file) => {
      const portrait_path = await upload(familyId, 'portraits', file);
      return api.people.update(personId, { portrait_path });
    },
    // Keepers only: exact dates and contact details of living relatives.
    getPrivate: async (personId) =>
      must(await supabase.from('people_private').select('*').eq('person_id', personId).maybeSingle()),
    setPrivate: async (familyId, personId, fields) =>
      must(await supabase.from('people_private')
        .upsert({ ...fields, person_id: personId, family_id: familyId }).select().single()),
  },

  relationships: {
    list: async (familyId) => must(await supabase.from('relationships').select('*').eq('family_id', familyId)),
    addParent: async (familyId, parentId, childId) =>
      must(await supabase.from('relationships').insert({
        family_id: familyId, kind: 'parent', person_a: parentId, person_b: childId, created_by: await uid(),
      }).select().single()),
    // Partners are stored in a fixed order so each couple exists once.
    addSpouse: async (familyId, personA, personB, { startYear, endYear } = {}) => {
      const [a, b] = [personA, personB].sort();
      return must(await supabase.from('relationships').insert({
        family_id: familyId, kind: 'spouse', person_a: a, person_b: b,
        start_year: startYear ?? null, end_year: endYear ?? null, created_by: await uid(),
      }).select().single());
    },
    remove: async (relationshipId) => must(await supabase.from('relationships').delete().eq('id', relationshipId)),
  },

  // The whole tree, grouped into generations for the Family screen:
  // { people, relationships, generations: [[couple, ...], ...] }
  // where couple = [personId] or [personId, partnerId], oldest generation first.
  tree: async (familyId) => {
    const [people, relationships] = await Promise.all([api.people.list(familyId), api.relationships.list(familyId)]);
    const parentsOf = new Map();
    const partnersOf = new Map();
    for (const r of relationships) {
      if (r.kind === 'parent') {
        parentsOf.set(r.person_b, [...(parentsOf.get(r.person_b) ?? []), r.person_a]);
      } else {
        partnersOf.set(r.person_a, [...(partnersOf.get(r.person_a) ?? []), r.person_b]);
        partnersOf.set(r.person_b, [...(partnersOf.get(r.person_b) ?? []), r.person_a]);
      }
    }
    // Generation = longest chain of known ancestors; partners share the deeper one.
    const depth = new Map();
    const depthOf = (id, seen = new Set()) => {
      if (depth.has(id)) return depth.get(id);
      if (seen.has(id)) return 0;
      seen.add(id);
      const parents = parentsOf.get(id) ?? [];
      const d = parents.length ? 1 + Math.max(...parents.map((p) => depthOf(p, seen))) : 0;
      depth.set(id, d);
      return d;
    };
    people.forEach((p) => depthOf(p.id));
    for (let pass = 0; pass < 3; pass++) {
      for (const [id, partners] of partnersOf) {
        const d = Math.max(depth.get(id) ?? 0, ...partners.map((p) => depth.get(p) ?? 0));
        depth.set(id, d);
      }
    }
    const generations = [];
    const placed = new Set();
    for (const p of people) {
      if (placed.has(p.id)) continue;
      const d = depth.get(p.id) ?? 0;
      const partner = (partnersOf.get(p.id) ?? []).find((q) => !placed.has(q) && (depth.get(q) ?? 0) === d);
      const couple = partner ? [p.id, partner] : [p.id];
      couple.forEach((id) => placed.add(id));
      (generations[d] ??= []).push(couple);
    }
    return { people, relationships, generations: generations.filter(Boolean) };
  },

  places: {
    list: async (familyId) => must(await supabase.from('places').select('*').eq('family_id', familyId).order('created_at')),
    add: async (familyId, fields) =>
      must(await supabase.from('places').insert({ ...fields, family_id: familyId, created_by: await uid() }).select().single()),
    update: async (placeId, fields) => must(await supabase.from('places').update(fields).eq('id', placeId).select().single()),
    remove: async (placeId) => must(await supabase.from('places').delete().eq('id', placeId)),
    // relation: born | grew_up | lived | married | worked | migrated_to | died | buried | other
    linkPerson: async (familyId, personId, placeId, { relation = 'lived', fromYear, toYear, note } = {}) =>
      must(await supabase.from('person_places').insert({
        family_id: familyId, person_id: personId, place_id: placeId, relation,
        from_year: fromYear ?? null, to_year: toYear ?? null, note: note ?? null, created_by: await uid(),
      }).select().single()),
    forPerson: async (personId) =>
      must(await supabase.from('person_places').select('*, place:places(*)').eq('person_id', personId)),
    people: async (placeId) =>
      must(await supabase.from('person_places').select('*, person:people(*)').eq('place_id', placeId)),
  },

  items: {
    // The Memories feed. Filter by kind ('photo' | 'video' | 'voice' | 'story' | 'document' | 'note').
    feed: async (familyId, { kinds, personId, limit = 50, before } = {}) => {
      let q = supabase.from('items')
        .select('*, people:item_people(person_id)')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (kinds?.length) q = q.in('kind', kinds);
      if (before) q = q.lt('created_at', before);
      if (personId) {
        const ids = must(await supabase.from('item_people').select('item_id').eq('person_id', personId)).map((r) => r.item_id);
        q = q.in('id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']);
      }
      return must(await q);
    },
    get: async (itemId) =>
      must(await supabase.from('items').select('*, people:item_people(person_id), notes(*)').eq('id', itemId).single()),
    // Add a photo, video, voice recording or document. `file` is a File/Blob.
    // visibility: 'family' (default) | 'keepers' | 'private'
    add: async (familyId, { kind, file, peopleIds = [], ...fields }) => {
      const storage_path = file ? await upload(familyId, 'items', file) : null;
      const item = must(await supabase.from('items').insert({
        ...fields,
        kind,
        family_id: familyId,
        storage_path,
        mime_type: file?.type || null,
        visibility: fields.visibility ?? (kind === 'document' ? 'keepers' : 'family'),
        created_by: await uid(),
      }).select().single());
      if (peopleIds.length) await api.items.tagPeople(familyId, item.id, peopleIds);
      return item;
    },
    update: async (itemId, fields) => must(await supabase.from('items').update(fields).eq('id', itemId).select().single()),
    remove: async (itemId) => {
      const item = must(await supabase.from('items').select('storage_path').eq('id', itemId).single());
      must(await supabase.from('items').delete().eq('id', itemId));
      if (item.storage_path) await supabase.storage.from(MEDIA_BUCKET).remove([item.storage_path]);
    },
    tagPeople: async (familyId, itemId, personIds) =>
      must(await supabase.from('item_people').upsert(
        personIds.map((person_id) => ({ item_id: itemId, person_id, family_id: familyId })),
        { onConflict: 'item_id,person_id', ignoreDuplicates: true },
      )),
    untagPerson: async (itemId, personId) =>
      must(await supabase.from('item_people').delete().eq('item_id', itemId).eq('person_id', personId)),
  },

  stories: {
    // The "Tell a story" flow: who it is about → what it is about → record.
    // Saves the recording, then transcribes and organises it (title, summary,
    // year, place, people). Returns { item, people_ids, suggested_new_place }.
    // If organising fails, the recording is still saved and the error is
    // returned as { item, error } so the app can offer "Try again".
    record: async (familyId, { audio, aboutPersonIds = [], category, tellerPersonId, durationSec, questionId }) => {
      const item = await api.items.add(familyId, {
        kind: 'story',
        file: audio,
        category: category ?? null,
        teller_person_id: tellerPersonId ?? null,
        duration_sec: durationSec ?? null,
        transcript_status: 'pending',
        peopleIds: aboutPersonIds,
      });
      if (questionId) {
        await supabase.from('questions').update({ answered_item_id: item.id }).eq('id', questionId);
      }
      try {
        return await api.stories.organize(item.id);
      } catch (err) {
        return { item, error: err.message };
      }
    },
    // A story typed or pasted instead of spoken.
    write: async (familyId, { text, aboutPersonIds = [], category, tellerPersonId }) => {
      const item = await api.items.add(familyId, {
        kind: 'story', body: text, category: category ?? null,
        teller_person_id: tellerPersonId ?? null, peopleIds: aboutPersonIds,
      });
      try {
        return await api.stories.organize(item.id);
      } catch (err) {
        return { item, error: err.message };
      }
    },
    organize: (itemId, transcript) => invoke('organize-story', { item_id: itemId, transcript }),
    byCategory: async (familyId) => {
      const rows = await api.items.feed(familyId, { kinds: ['story'], limit: 500 });
      return STORY_CATEGORIES.map((c) => ({ ...c, stories: rows.filter((s) => (s.category ?? 'other') === c.id) }))
        .filter((c) => c.stories.length);
    },
  },

  timeline: {
    // Curated events, births, deaths and dated stories, oldest first.
    list: async (familyId) =>
      must(await supabase.from('family_timeline').select('*').eq('family_id', familyId).order('year').order('date', { nullsFirst: true })),
    highlights: async (familyId) =>
      must(await supabase.from('events').select('*').eq('family_id', familyId).eq('is_major', true).order('year')),
    addEvent: async (familyId, { personIds = [], itemIds = [], ...fields }) => {
      const event = must(await supabase.from('events').insert({ ...fields, family_id: familyId, created_by: await uid() }).select().single());
      if (personIds.length) {
        must(await supabase.from('event_people').insert(personIds.map((person_id) => ({ event_id: event.id, person_id, family_id: familyId }))));
      }
      if (itemIds.length) {
        must(await supabase.from('event_items').insert(itemIds.map((item_id) => ({ event_id: event.id, item_id, family_id: familyId }))));
      }
      return event;
    },
    eventDetails: async (eventId) =>
      must(await supabase.from('events')
        .select('*, people:event_people(person_id), items:event_items(item:items(*))')
        .eq('id', eventId).single()),
    updateEvent: async (eventId, fields) => must(await supabase.from('events').update(fields).eq('id', eventId).select().single()),
    removeEvent: async (eventId) => must(await supabase.from('events').delete().eq('id', eventId)),
  },

  notes: {
    // "Remembered by family" on a person, or a family note on a memory.
    forPerson: async (personId) =>
      must(await supabase.from('notes').select('*').eq('person_id', personId).order('created_at')),
    forItem: async (itemId) =>
      must(await supabase.from('notes').select('*').eq('item_id', itemId).order('created_at')),
    add: async (familyId, { personId, itemId, body }) =>
      must(await supabase.from('notes').insert({
        family_id: familyId, person_id: personId ?? null, item_id: itemId ?? null, body, author_id: await uid(),
      }).select().single()),
    update: async (noteId, body) => must(await supabase.from('notes').update({ body }).eq('id', noteId).select().single()),
    remove: async (noteId) => must(await supabase.from('notes').delete().eq('id', noteId)),
  },

  questions: {
    // "Questions to answer" on the Stories screen.
    open: async (familyId) =>
      must(await supabase.from('questions').select('*').eq('family_id', familyId).is('answered_item_id', null).order('created_at')),
    ask: async (familyId, forPersonId, question) =>
      must(await supabase.from('questions').insert({
        family_id: familyId, for_person_id: forPersonId, question, asked_by: await uid(),
      }).select().single()),
    remove: async (questionId) => must(await supabase.from('questions').delete().eq('id', questionId)),
  },

  // "Ask your family history". Returns
  // { found, answer, sources: [{ n, type, id, title, detail }], ask_people: [{ id, name }] }
  // `answer` contains [1], [2] markers matching sources[].n.
  ask: (familyId, question) => invoke('ask-archive', { family_id: familyId, question }),

  media: {
    // Private files are served through short-lived signed links.
    url: async (path, expiresInSec = 3600) =>
      path ? must(await supabase.storage.from(MEDIA_BUCKET).createSignedUrl(path, expiresInSec)).signedUrl : null,
    urls: async (paths, expiresInSec = 3600) => {
      const list = paths.filter(Boolean);
      if (!list.length) return {};
      const rows = must(await supabase.storage.from(MEDIA_BUCKET).createSignedUrls(list, expiresInSec));
      return Object.fromEntries(rows.filter((r) => r.signedUrl).map((r) => [r.path, r.signedUrl]));
    },
  },
};
