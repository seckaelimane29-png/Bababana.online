# PXE — Architecture & MVP Plan

> Status: **proposal, stage 0**. Nothing here has been deployed. The SQL in
> `../supabase/migrations/` is a reviewed draft and has not been applied to any
> database. No payment or video provider has been integrated.

PXE is a knowledge marketplace where creators in The Gambia and Senegal (and the
diaspora) sell online courses: a public marketplace, plus a shareable storefront
for each creator at `/creator/[username]`.

Positioning: **"Turn What You Know Into Income."** We make no claims about how
much anyone will earn.

---

## 1. What the repository has today

`Bababana.online` is a monorepo of independent sub-projects that share no code:

| Folder | What it is | Stack |
|---|---|---|
| `/` (root `index.html`) | Coaching landing page template | Static HTML/CSS |
| `almakhtoum/`, `ets-mm-samb/` | Storefronts + admin pages | Vanilla JS, Supabase (anon key + RLS), Vercel/Netlify |
| `albadary-app/` | Quran learning app | Static + Supabase, SQL migrations in `backend/migrations` |
| `family-archive/`, `lamb-arena/` | Small apps | Static |
| `waxal/` | Captions video editor | Expo / React Native + Node ffmpeg server on Render |

What this means for PXE:
- Nothing course-related exists, so PXE is a **new sub-project** in `pxe/`. No
  existing project gets touched.
- The repo already uses **Supabase** (Postgres, Auth, RLS, numbered SQL
  migrations) and **Vercel**. PXE reuses both.
- The other sites rely only on browser-side Supabase calls. **PXE can't.** Its
  payment webhooks, signed video URLs, and money ledger have to run on a trusted
  server, which is why PXE needs a server framework where the other sites don't.

## 2. Proposed stack

| Concern | Choice | Why |
|---|---|---|
| App | **Next.js (App Router) + TypeScript** | Server Components and Route Handlers give a trusted server for webhooks and authorization. Deploys to Vercel like the rest of the repo. |
| Styling | **Tailwind CSS** with design tokens (CSS variables) | Tokens defined once; small CSS bundle for low-bandwidth users. |
| Database / Auth | **Supabase** (Postgres + Auth + RLS) | Already used in the repo. RLS adds a second layer of defense behind the server checks. |
| Validation | **Zod** | One schema shared by forms and server actions. |
| i18n | `next-intl` with message files `en.json`, `fr.json`, and `wo.json` (placeholder) | The Wolof file stays empty until a fluent speaker writes and reviews it. We never machine-translate. |
| Video | A `VideoProvider` interface, with the first adapter chosen in §6 | Keeps the codebase independent of any one vendor. |
| Payments | A `PaymentProvider` interface, with the first adapter chosen in §5 | Lets us add or swap providers per market. |
| Tests | Vitest (money, ledger, webhook idempotency, access rules) + Playwright (key user journeys) | Covers the critical business logic. |
| Delivery | PWA-capable mobile web. No native app in Phase 1. | Matches the brief's mobile-first, no-native-app-yet scope. |

## 3. MVP (Phase 1) scope

This is the brief's definition of done, cut to the smallest version that real
creators can use:

1. **Auth.** Email + password, plus phone OTP if Supabase SMS works for +220 and
   +221 (still unknown, see §8). One account can be a student, a creator, or both.
2. **Creator onboarding.** Profile, username, bio, languages, socials, and a
   storefront at `/creator/[username]`.
3. **Course wizard.** Seven steps: basics → cover/language/level → sections and
   lessons → video upload → price → preview → publish. Drafts autosave and every
   step is validated.
4. **Marketplace.** Search, category, language, price, and level filters, with
   loading, empty, and error states.
5. **Course detail page.** Curriculum, free preview lessons, price, and the
   refund and access policy. No fake ratings or student counts.
6. **Checkout with one verified provider** (§5), using the server-verified flow
   in §5.2.
7. **Course player.** Signed playback, lesson list, previous/next, mark as
   complete, and resume where you left off.
8. **Dashboards.** Student: my courses and purchases. Creator: courses, sales,
   and enrollments, showing gross, platform fee, provider fee, refunds, and net
   separately.
9. **Admin.** Users and roles, a course moderation queue, categories, fee
   settings, transactions, reports, and a **manual payout workflow**.
10. **Demo mode.** Seeded demo courses, clearly labeled "Demo". Controlled by an
    env flag that is off in production, so demo data never appears on the live
    site.

Phase 1 leaves out coupons, reviews, certificates, comments, affiliates,
subscriptions, and automated payouts. The schema leaves room for these
(Phase 2/3).

## 4. Data model & permissions

See `supabase/migrations/0001_core_schema.sql` (tables) and `0002_rls.sql`
(access rules). Key decisions:

### Money
- Every amount is a `bigint` in the currency's **minor units**, stored next to a
  `currency` column. Floats are never used.
- Supported currencies: `GMD` (2 decimals), `XOF` (0 decimals, per ISO 4217),
  `EUR` (2 decimals). A lookup table `currencies` holds the exponent for each.
- **No automatic FX.** A course has one price row per currency the creator
  chooses to sell in (`course_prices`, unique on `(course_id, currency)`). If a
  course isn't priced in XOF, it simply can't be bought in XOF, so GMD and XOF
  never get mixed.
- Totals on an order are a snapshot taken when the order is created. Later price
  changes don't affect existing orders.
- Fees are stored in basis points (`platform_fee_bps`). Rounding uses one
  documented function, so the result is the same every time.

### Ledger
`ledger_entries` is append-only: rows are never updated or deleted. Each paid
order writes:
- `sale_gross` (+)
- `platform_fee` (−)
- `provider_fee` (−)

Refunds write `refund` (−) plus `platform_fee_reversal` (+). Payouts write
`payout` (−).

A creator's balance per currency is the sum of their entries. Ledger rows are
written only by the server, inside the same transaction that marks the order
paid.

### Idempotency
- `payment_events` stores every webhook raw, unique on `(provider,
  provider_event_id)`.
- `payments` is unique on `(provider, provider_reference)`.
- `enrollments` is unique on `(user_id, course_id)`.

So a webhook that arrives twice can never grant access twice or double-credit a
creator.

### Roles
`user_roles(user_id, role)` with roles `student`, `creator`, `admin`. A user can
hold several. Every server action checks the role and ownership (`course.creator_id
= auth.uid()`) itself. RLS repeats those checks, so a bug in one layer doesn't
expose data.

Tables that only the server writes (`orders`, `payments`, `payment_events`,
`enrollments`, `ledger_entries`, `payouts`, `audit_log`) have **no** insert or
update policies for normal users. Only the service role, used server-side,
writes to them.

### Content access
A lesson's video can be played only if one of these holds:
- the lesson is marked `is_preview`, or
- the viewer has an active enrollment, or
- the viewer is the course's creator or an admin.

This check runs on the server just before it issues a short-lived signed
playback token. The storage keys for videos and resources are never sent to the
browser.

## 5. Payments

### 5.1 Provider research (preliminary, **unverified**)
I did a quick web search. I haven't seen any official documentation or merchant
contract, so treat everything below as leads to confirm.

| Option | Market | What I found | Needs confirming |
|---|---|---|---|
| **Wave Business Checkout API** | SN (XOF), GM (GMD) | Checkout sessions plus signed webhooks. A WooCommerce plugin uses it in The Gambia and says **Wave accepts whole Dalasi only**. | Official docs, whether a Gambian merchant account can get API access, fees, settlement, refunds |
| **Modem Pay** | GM | Gambian aggregator that says it covers Wave, Afrimoney and QMoney through one API, and does bulk payouts | API docs, pricing, KYC, refunds, webhook signing |
| **PayDunya / CinetPay / PayTech** | SN / UEMOA | Aggregators for Orange Money, Wave and Free Money. PayDunya has official docs, including a disbursement API. | Fees (blog figures disagree), settlement, merchant eligibility |
| **Cards for diaspora (EUR)** | Intl | Stripe doesn't onboard merchants in GM or SN. Options: an aggregator's card rail, or a merchant entity elsewhere. | Legal entity question, see §8 |

**Recommendation:** launch with **one** provider in **one** market, wherever you
can open a merchant account fastest. That's probably Wave Business in whichever
country your business is registered. Add aggregators in Phase 2.

### 5.2 Flow (applies to every provider)
1. The student clicks Buy. The server checks that the course is published and
   priced in the chosen currency, then creates a `pending` order with the price
   snapshot.
2. The server calls `provider.createCheckout(order)` and stores the provider
   reference on a `payments` row, then redirects the student to the provider.
3. The provider sends a webhook. The server verifies the signature, stores the
   raw event idempotently, and then **re-fetches the payment from the provider's
   API** before trusting it.
4. In one DB transaction, the server checks that the amount and currency match
   the order, then: order → `paid`, payment → `succeeded`, enrollment created,
   ledger entries written.
5. The student is sent a confirmation, and the sale appears in the creator
   dashboard.

The browser's success page only displays the order's status. It never grants
access by itself.

```ts
interface PaymentProvider {
  id: 'wave' | 'modempay' | 'paydunya' | string;
  supports(currency: Currency, country: Country): boolean;
  createCheckout(input: CheckoutInput): Promise<{ reference: string; redirectUrl: string }>;
  verifyWebhook(req: Request): Promise<VerifiedEvent>;   // throws on a bad signature
  fetchPayment(reference: string): Promise<ProviderPaymentStatus>;
  refund?(reference: string, amountMinor: bigint): Promise<RefundResult>;
}
```

### 5.3 Payouts
Phase 1 payouts are **manual**, and the creator dashboard says so. An admin:
1. sees creator balances per currency,
2. creates a payout record,
3. pays the creator outside the app (Wave or bank),
4. marks the payout `paid` with a reference.

The ledger and `audit_log` record each step. Automated payouts, via Modem Pay
bulk or PayDunya disbursement, come in Phase 2 once they've been verified.

## 6. Video

The leading candidates are **Bunny Stream** and **Cloudflare Stream**. Both
offer adaptive HLS, token-authenticated playback, and free encoding, and both
are cheap at small scale. Rough public figures:
- Bunny: about $0.01/GB delivered and $0.01/GB/month stored.
- Cloudflare: about $5 per 1,000 minutes stored and $1 per 1,000 minutes
  delivered.

Mux is more polished but costs more. These figures come from third-party pages;
check them on the vendors' own pricing pages before choosing.

**Provisional pick: Bunny Stream.** Its per-GB delivery pricing suits a library
of long, rarely-watched courses. It has Africa PoPs on its standard network, and
direct-to-provider TUS uploads, which means creators on flaky mobile connections
can resume an upload instead of restarting it.

- `video_assets` stores `provider`, `provider_asset_id`, `status`, `duration`,
  and the error, so switching vendors means writing a new adapter, not changing
  the schema.
- Creators upload **straight to the provider** using a one-time upload URL from
  our server. Large files never pass through our app.
- Playback uses a short-lived signed URL, issued only after the access check in
  §4.
- We'll state honestly in the UI and the terms that no browser-based system can
  stop screen recording. Signed URLs stop casual link-sharing, not a determined
  copier.

## 7. Design direction

- **Palette tokens:**
  - forest `#1F4D3A` (primary, trust)
  - ivory `#FAF7F0` (page background)
  - charcoal `#1E1E1C` (text)
  - terracotta `#C2643B` (accent, used sparingly)
  - gold `#C9A54A` (highlights only)
  - a dark-mode set
- **Type:** a modern serif for display headings and Inter for UI text. Fonts are
  self-hosted through `next/font`, so there's no extra font download from a
  third party.
- **Components:** course cards, creator header, price tag (currency-aware),
  stepper, progress bar, empty, error and skeleton states, and dashboard stat
  tiles. Stat tiles show "—" when there's no data rather than invented numbers.
- **Low bandwidth:** images in AVIF/WebP with responsive sizes, no hero video,
  motion only on interaction, and respect for `prefers-reduced-motion`.
- **Imagery:** real photos of creators where we have them. Until then, neutral
  placeholders labeled as such, with no stock-photo stereotypes.

## 8. Unknowns & risky assumptions

1. **Legal entity and merchant accounts.** Which country is the business
   registered in? This decides which payment providers you can sign up with and
   whether the platform may collect money on creators' behalf. Being a
   marketplace collecting for others may need a licence or a specific contract
   with the provider.
2. **First payment provider.** Nothing can go live until a merchant account and
   API keys exist. Until then, checkout runs against the provider's sandbox or a
   clearly labeled demo adapter that cannot mark real orders as paid.
3. **Whole-Dalasi rounding** (Wave GM). Prices in GMD may need to be whole
   Dalasi. We'll enforce this per provider.
4. **Phone OTP delivery** to +220 and +221 (via Supabase's SMS provider). Cost
   and how reliably the messages arrive are both unknown.
5. **Tax and VAT** on digital services in GM and SN, plus EU VAT for diaspora
   buyers paying in EUR. This needs an accountant's review.
6. **Data protection.** Senegal's Law 2008-12 and Gambian rules. Privacy and
   terms pages will be drafts until a lawyer reviews them.
7. **Crypto courses.** These need a content policy: no promises of guaranteed
   returns, and admin review before publishing.
8. **Wolof copy** needs a fluent writer.
9. **Demand.** The real test is getting 3–5 creators published with paying
   students. That depends more on payments working than on features.

## 9. Build stages

| Stage | Deliverable |
|---|---|
| 0 (this) | Inspection, architecture, draft schema + RLS |
| 1 | Next.js scaffold, design tokens and components, i18n (EN/FR), homepage, marketplace, course detail, and storefront pages using labeled demo data |
| 2 | Supabase project, migrations applied, auth, roles, creator onboarding, course wizard (without video) |
| 3 | Video adapter: direct upload, processing status, signed playback, course player, progress tracking |
| 4 | Payment abstraction, sandbox adapter for the chosen provider, webhook, ledger, enrollment, plus tests for idempotency and access |
| 5 | Dashboards, admin moderation and manual payouts, policies, deployment docs, Playwright E2E |
| 6 | Go live with real provider keys, then onboard 3–5 pilot creators |
