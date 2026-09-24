# Family Archive backend

The backend is a Supabase project (`family-archive`, project ref `egbtmfmpkbckzgkksqjg`,
region `eu-west-3`). It provides sign-in, a Postgres database with row-level
security, private file storage, and two edge functions. The app calls it
straight from the browser via `../js/family-api.js`.

- API URL: `https://egbtmfmpkbckzgkksqjg.supabase.co`
- Publishable key: `sb_publishable_gg0l38EGA8ilgMBi8Gnk0g_6BxmTfl3`
  (safe to ship in client code; row-level security governs all access)
- Dashboard: https://supabase.com/dashboard/project/egbtmfmpkbckzgkksqjg

## Before the AI features work: add two secrets

Story transcription and "Ask your family history" call outside services, so
they need API keys stored as edge function secrets (Dashboard → Edge Functions
→ Secrets, or `supabase secrets set NAME=value`):

| Secret | Used by | What for |
|---|---|---|
| `ANTHROPIC_API_KEY` | `organize-story`, `ask-archive` | Claude organises stories and answers questions from the archive |
| `OPENAI_API_KEY` | `organize-story` | Speech-to-text for voice recordings (Whisper). Optional `TRANSCRIBE_MODEL` overrides the model. |

Until they are set, both functions reply with a plain "not set up yet" message
and everything else in the archive works normally. A story can also be typed
or pasted, which skips transcription and needs only the Anthropic key.

## Data model

| Table | Purpose |
|---|---|
| `profiles` | One row per user (display name, settings such as larger text). Created by a trigger on sign-up. |
| `families` | A family archive: "The Secka Family", tagline, cover photo. |
| `family_members` | Who belongs to which family, their role (`keeper` / `contributor` / `viewer`), status (`pending` / `active`) and their own person in the tree. |
| `invitations` | Personal invitation codes (8 characters, single use, 7 days by default) with the role the invitee will get. |
| `people` | Everyone in the tree: names, birth name, "known as", birth/death years and places, biography, portrait. |
| `people_private` | Exact dates, contact details and notes on living relatives. Keepers only. |
| `relationships` | `parent` (A is a parent of B) and `spouse` links. The tree's generations are computed from these. |
| `places` | Places in the family's history, with optional coordinates. |
| `person_places` | Who was born, grew up, lived, married, worked, migrated to, died or is buried where, and when. |
| `items` | Everything the family keeps: photos, videos, voice recordings, stories, documents and notes. Stories carry a theme, the storyteller, the transcript and a summary. |
| `item_people` | Who appears in, or is spoken about in, each item. |
| `events` / `event_people` / `event_items` | The timeline: dated events linked to people and to the stories, photos and documents behind them. |
| `notes` | "Remembered by family" notes on a person, or family notes on a memory. |
| `questions` | Questions waiting for a relative to answer with a story. |
| `family_timeline` (view) | Events, births, deaths and dated stories in one list, for the Timeline screen. |

Every child row carries `family_id` and points at its parent through a composite
`(id, family_id)` foreign key, so nothing can ever link across two families.

## Access rules (row-level security)

Nothing is public. Visitors who are not signed in can read nothing except an
invitation preview (below).

| | Keeper | Contributor | Viewer | Pending |
|---|---|---|---|---|
| See the family, tree, places, timeline | ✓ | ✓ | ✓ | name only |
| See photos, recordings, stories (`family` visibility) | ✓ | ✓ | ✓ | – |
| See Keeper-only items (documents default to this) | ✓ | own only | – | – |
| See someone else's private item | – | – | – | – |
| Add people, places, stories, photos, notes | ✓ | ✓ | – | – |
| Edit or remove what others added | ✓ | – | – | – |
| Ask a relative a question | ✓ | ✓ | ✓ | – |
| Living relatives' private details | ✓ | – | – | – |
| Invite relatives | ✓ (any role) | ✓ (not Keepers) | – | – |
| Approve members, change roles | ✓ | – | – | – |

- **Joining.** `accept_invitation(code)` adds the member. An invitation from a
  Keeper counts as approval, so the member is active straight away. One from a
  Contributor leaves them `pending` until a Keeper calls `approve_member`.
- **Invitation preview.** `invitation_preview(code)` works before sign-up and
  returns only the family name, the inviter's name, the role and whether the
  code is still valid.
- **Files** live in the private `family-media` bucket under
  `<family_id>/…`. A file can be read by its uploader, or by anyone who can see
  a row in the same family that points at it: an item, a portrait, or a place or
  family cover. Item visibility therefore also covers the file. The app shows
  files through short-lived signed links.
- **At least one Keeper.** The last active Keeper cannot leave or step down.
  Closing the whole archive or deleting their account still works.

## Edge functions

Both run with the caller's own sign-in token, so the database rules above also
decide what the AI can read and change.

- **`organize-story`** `POST { item_id, transcript? }`: transcribes the
  recording, then Claude suggests a title, a one-line summary, a theme, the
  year, the people mentioned and the main place. It only chooses people and
  places that already exist in the family. Anything the storyteller already
  set is kept. Only the story's author or a Keeper can run it.
- **`ask-archive`** `POST { family_id, question }`: builds the archive text
  from what this member may see and gives every source a short reference
  (P1, S4, …). Claude answers with numbered citations to those references. The
  function drops any citation that doesn't exist and returns
  `{ found, answer, sources, ask_people }`. When the archive has no answer it
  says so and suggests living relatives who might know.

Both use `claude-opus-5` with structured JSON output and the server-side
refusal fallback (`fallbacks: "default"`). The archive text in `ask-archive`
is sent as a cached prompt block, so follow-up questions cost less.

## Migrations

The SQL in `migrations/` mirrors the migration history applied to the project,
in order:

1. `001_core_schema.sql`: tables, triggers, composite family keys
2. `002_rls_policies.sql`: role helpers, row-level security, the timeline view
3. `003_membership_functions.sql`: create, invite, accept, approve, roles, "this is me"
4. `004_storage.sql`: the private media bucket and its rules
5. `005_lock_down_functions.sql`: who may call which function

To recreate the backend on a fresh Supabase project, run them in order in the
SQL editor, then deploy `functions/organize-story` and `functions/ask-archive`
with JWT verification on and set the secrets above.

## Checking the access rules

`tests/access_rules_check.sql` creates five throwaway users (Keeper,
Contributor, Viewer, a pending member and an outsider), acts as each one,
checks 34 things they should and shouldn't be able to do, deletes everything
it created, and returns one PASS/FAIL row per check. Run the whole file in the
SQL editor. All 34 pass on the live project.

## Known accepted warnings

- Supabase's security linter flags the membership functions (`create_family`,
  `accept_invitation`, `approve_member`, `set_member_role`, `revoke_invitation`,
  `set_my_person`) and the role helpers (`family_role`, `has_membership`,
  `shares_family_with`) as SECURITY DEFINER functions that signed-in users can
  call. This is required. The functions check the caller's role themselves,
  and the helpers only answer questions about the caller's own membership.
- `invitation_preview` is flagged as callable without signing in. This is
  intentional, so an invitation link can show who invited you. It reveals
  nothing without a valid code.
- The performance linter lists composite foreign keys without an exact
  covering index. At family-archive scale (hundreds to low thousands of rows)
  this has no measurable effect; add indexes if a family grows much larger.
