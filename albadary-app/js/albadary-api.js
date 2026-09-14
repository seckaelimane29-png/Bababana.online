// Albadary backend client — Supabase project "albadary" (eu-west-3).
// Usage (ES module):
//   import { api } from './js/albadary-api.js';
//   await api.auth.signIn(email, password);
//   const surahs = await api.surahs.list();
//
// The publishable key is safe to ship to browsers: every table is protected
// by row-level security, so the key only grants what the policies allow.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const SUPABASE_URL = 'https://tiwetfxfubjdrgtbwimm.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_pHZPYHcS6mdM5_LWbZlB0A_VHSvSoFp';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

function must(result) {
  if (result.error) throw result.error;
  return result.data;
}

async function uid() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw error ?? new Error('Not signed in');
  return data.user.id;
}

export const api = {
  auth: {
    // role: 'student' | 'teacher' | 'parent'
    signUp: (email, password, displayName, role = 'student') =>
      must(supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName, role } },
      })),
    signIn: (email, password) =>
      must(supabase.auth.signInWithPassword({ email, password })),
    signOut: () => supabase.auth.signOut(),
    onChange: (cb) => supabase.auth.onAuthStateChange(cb),
    user: () => supabase.auth.getUser().then((r) => r.data.user),
  },

  profile: {
    me: async () =>
      must(await supabase.from('profiles').select('*').eq('id', await uid()).single()),
    update: async (fields) =>
      must(await supabase.from('profiles').update(fields).eq('id', await uid())
        .select().single()),
  },

  surahs: {
    list: async () =>
      must(await supabase.from('surahs').select('*').order('number')),
  },

  reading: {
    position: async () =>
      must(await supabase.from('reading_positions').select('*')
        .eq('user_id', await uid()).maybeSingle()),
    save: async (surah, ayah) =>
      must(await supabase.from('reading_positions')
        .upsert({ user_id: await uid(), surah, ayah }).select().single()),
  },

  progress: {
    forSurah: async (surah, userId) =>
      must(await supabase.from('ayah_progress').select('*')
        .eq('user_id', userId ?? await uid()).eq('surah', surah).order('ayah')),
    setStatus: async (surah, ayah, status) =>
      must(await supabase.from('ayah_progress')
        .upsert({ user_id: await uid(), surah, ayah, status }).select().single()),
    due: async (limit = 20) =>
      must(await supabase.from('ayah_progress').select('*')
        .eq('user_id', await uid())
        .lte('next_review_at', new Date().toISOString())
        .order('next_review_at').limit(limit)),
    // Spaced repetition (SM-2 style). grade: 0-5, where >= 3 means recalled.
    gradeReview: async (row, grade) => {
      const ease = Math.min(3.0, Math.max(1.3,
        row.ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))));
      const interval =
        grade < 3 ? 1 :
        row.interval_days === 0 ? 1 :
        row.interval_days === 1 ? 6 :
        Math.round(row.interval_days * ease);
      const next = new Date(Date.now() + interval * 86400e3).toISOString();
      return must(await supabase.from('ayah_progress').update({
        ease,
        interval_days: interval,
        next_review_at: next,
        last_reviewed_at: new Date().toISOString(),
        status: grade >= 3 ? 'memorized' : 'learning',
      }).eq('user_id', row.user_id).eq('surah', row.surah).eq('ayah', row.ayah)
        .select().single());
    },
  },

  sessions: {
    // kind: 'read' | 'recite' | 'review' | 'quiz'
    record: async ({ kind, surah, ayahFrom, ayahTo, score, durationSeconds, details }) =>
      must(await supabase.from('sessions').insert({
        user_id: await uid(),
        kind,
        surah,
        ayah_from: ayahFrom,
        ayah_to: ayahTo,
        score,
        duration_seconds: durationSeconds,
        details: details ?? {},
      }).select().single()),
    recent: async (limit = 30, userId) =>
      must(await supabase.from('sessions').select('*')
        .eq('user_id', userId ?? await uid())
        .order('created_at', { ascending: false }).limit(limit)),
  },

  plans: {
    list: async (userId) =>
      must(await supabase.from('memorization_plans').select('*')
        .eq('user_id', userId ?? await uid())
        .order('created_at', { ascending: false })),
    create: async (plan) =>
      must(await supabase.from('memorization_plans')
        .insert({ ...plan, user_id: await uid() }).select().single()),
    update: async (id, fields) =>
      must(await supabase.from('memorization_plans').update(fields)
        .eq('id', id).select().single()),
    remove: async (id) =>
      must(await supabase.from('memorization_plans').delete().eq('id', id)),
  },

  teachers: {
    directory: async () =>
      must(await supabase.from('profiles').select('id, display_name, avatar_url, bio')
        .eq('role', 'teacher').order('display_name')),
    // Student asks a teacher (or a teacher invites a student).
    request: async (teacherId, studentId) => {
      const me = await uid();
      return must(await supabase.from('teacher_links').insert({
        teacher_id: teacherId,
        student_id: studentId ?? me,
        requested_by: me,
      }).select().single());
    },
    respond: (linkId, accept) =>
      supabase.from('teacher_links')
        .update({ status: accept ? 'active' : 'declined' })
        .eq('id', linkId).select().single().then(must),
    myLinks: async () => {
      const me = await uid();
      return must(await supabase.from('teacher_links').select('*')
        .or(`teacher_id.eq.${me},student_id.eq.${me}`));
    },
  },

  parents: {
    request: async (parentId, childId) => {
      const me = await uid();
      return must(await supabase.from('parent_links').insert({
        parent_id: parentId ?? me,
        child_id: childId,
        requested_by: me,
      }).select().single());
    },
    respond: (linkId, accept) =>
      supabase.from('parent_links')
        .update({ status: accept ? 'active' : 'declined' })
        .eq('id', linkId).select().single().then(must),
    myLinks: async () => {
      const me = await uid();
      return must(await supabase.from('parent_links').select('*')
        .or(`parent_id.eq.${me},child_id.eq.${me}`));
    },
  },

  // Aggregated stats for home/progress screens; teachers and parents can
  // pass a linked student's id (RLS enforces the link).
  overview: async (userId) =>
    must(await supabase.from('student_overview').select('*')
      .eq('user_id', userId ?? await uid()).single()),
};
