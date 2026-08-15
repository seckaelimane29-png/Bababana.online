# Yesal Sa Khel — App Store submission guide

Status as of this branch: the app is imported, builds cleanly, has an icon set,
a Capacitor iOS wrapper, account deletion, and real Privacy/Terms pages. This
doc covers what's left, and — most importantly — two decisions only you can
make before Apple will accept this app.

## Read this first: two real rejection risks

These aren't nitpicks — they're the most likely reasons Apple bounces the
first submission. Decide on them before spending time on the rest.

### 1. In-App Purchase (Guideline 3.1.1)

Premium/Founding Member unlock currently goes through **Stripe** (`src/lib/billing.functions.ts` → `createCheckout`), with an alternate manual **Wave** transfer flow for Gambia/Senegal. Apple requires digital subscriptions purchased *from within an iOS app* to go through Apple's own In-App Purchase (StoreKit), not a third-party processor — with narrow exceptions ("reader" apps, physical goods, etc.) that don't apply to a subscription-content app like this.

Your options, roughly in order of effort:
- **Implement StoreKit/IAP for the iOS build** alongside Stripe for web — the compliant path, but real work: App Store Connect subscription group + products, `react-native-iap`/StoreKit bridge or a Capacitor IAP plugin, server-side receipt validation wired into `activatePlan` in `subscription.server.ts`.
- **Ship iOS as browse/read-only for free-tier content, no in-app purchase UI at all**, and let Premium be purchased only via the website outside the app. This is commonly accepted, but you'd need to hide the Pricing/checkout flow specifically on the iOS build (e.g. `Capacitor.getPlatform() === 'ios'`).
- Submit as-is and expect a 3.1.1 rejection on first review, then adjust based on the reviewer's actual note.

I didn't pick one for you — it's a business call (revenue share, engineering time) more than a coding one.

### 2. Minimum functionality (Guideline 4.2)

The iOS app is a Capacitor **WebView wrapper** pointed at the live site (see `capacitor.config.ts`) rather than a bundled native UI — necessary here since the app is server-rendered (Supabase, Stripe, admin routes, webhooks) and can't ship as a static bundle. Apple does approve WebView-wrapped apps, but reviewers scrutinize them for feeling like "a website in a box." Mitigating factors already in place: native splash screen, native status bar, app icon, offline-friendly shell. Consider before submitting: push notifications (the spec calls for daily reading reminders — implementing these natively would meaningfully help here), and making sure the app never feels like it's missing basic native affordances (pull-to-refresh, native back gesture, etc. — Capacitor/WKWebView handles most of this by default).

## What's done on this branch

- App imported from Lovable, builds and runs (`npm install && npm run build`)
- Icon set: `public/favicon.ico`, `apple-touch-icon.png`, `pwa-192/512.png`, `public/app-store-icon-1024.png` (App Store Connect master, no alpha)
- `ios/` Xcode project scaffolded (`capacitor.config.ts`: appId `com.yesalsakhel.app`, appName "Yesal Sa Khel"), icon + splash wired in
- `Info.plist`: photo library / camera usage strings for the Wave payment-proof upload
- Account deletion (Settings → Account → Delete account) — required by Guideline 5.1.1(v)
- Real `/privacy` and `/terms` pages, footer links fixed (were dead `href="#"`) — **draft legal copy, have a lawyer review before shipping**, especially given EU users (GDPR) across French/Italian/Spanish/Portuguese locales
- Screenshots captured at the 6.9" spec (1320×2868) in `docs/app-store/screenshots/` — landing, pricing, privacy, terms, onboarding. These are real renders of the actual app, not mockups.

## What's still needed, and why I couldn't do it here

- **More screenshots with real data.** This sandbox's network policy blocks both `lovable.app` and your Supabase project (`txxyxdbzmnevgjohaius.supabase.co`) — confirmed via 403s from the egress proxy, not a bug. So I could only capture the static marketing/legal pages; the actual reading screens (book library, a proverb card, streak/profile, quiz) need to be captured from a real device/simulator or a session with broader network access. App Store Connect wants 3–10 screenshots per required size; plan for at least book library, a book detail/insight screen, proverbs, and profile/streak.
- **Xcode build, signing, and archive.** All Xcode tooling is macOS-only. From your Mac:
  ```
  npm install
  npx cap sync ios
  npx cap open ios
  ```
  Then in Xcode: set your Team under Signing & Capabilities, pick a real device or "Any iOS Device," Product → Archive, then distribute via the Organizer to App Store Connect.
- **Apple Developer Program enrollment** ($99/yr) if not already active — needed before App Store Connect will accept a build.
- **Swap the Capacitor server URL** once you have production hosting: `CAPACITOR_SERVER_URL=https://yesalsakhel.com npx cap sync ios` (falls back to the Lovable-hosted URL otherwise — fine for testing, not for final release, since you don't want your shipped app pointed at someone else's subdomain long-term).
- **Decide on the two risks above** and implement accordingly.

## App Store Connect listing (draft)

| Field | Value |
|---|---|
| App name | Yesal Sa Khel |
| Subtitle | Elevate Your Mind |
| Category | Education (primary) or Lifestyle |
| Bundle ID | com.yesalsakhel.app |
| Support URL | mailto:yesalsakhel@gmail.com (or a real support page once hosted) |
| Privacy Policy URL | `https://<your-production-domain>/privacy` once deployed — App Store Connect requires a live, reachable URL, not just an in-app page |
| Marketing URL | `https://yesalsakhel.com` (once live) |
| Age rating | Likely 4+ — no objectionable content; confirm via the standard questionnaire in App Store Connect |

**Description draft:**
> African wisdom. Your language. Every day.
>
> Yesal Sa Khel brings you 31+ book summaries, daily African proverbs, and real immigrant success stories — in English, French, Wolof, Arabic, and Portuguese. Build a daily reading streak, test what you learned with quizzes, and generate your own diaspora story with AI.
>
> • 31+ book summaries with key insights and action steps
> • A new African proverb every day, in your language
> • Real stories from immigrants who built something from nothing
> • Daily streak tracking and quizzes
> • 5 languages: English, French, Wolof, Arabic, Portuguese

**Keywords draft:** african wisdom, proverbs, book summaries, diaspora, immigrant stories, reading habit, self improvement, wolof, africa

## App Review notes (for the App Store Connect "Notes" field)

> This app uses Supabase for authentication and Stripe for subscription billing (Apple Pay supported). A reviewer test account with lifetime premium access is available:
> - Email: reviewer@yesalsakhel.com
> - Password: Review2026!
>
> An alternate manual payment method ("Wave transfer") is offered only to users in Gambia and Senegal, where Stripe/card coverage is limited; it requires manual admin approval and is not the primary purchase path.

Confirm the reviewer account above is actually seeded with lifetime premium in your Supabase project before submitting — I couldn't verify this from the sandbox (network-blocked, see above).

## Known inconsistency worth fixing separately

`PricingCards.tsx` shows different prices than the "Unlock full access" copy in `app.profile.tsx` (€9.99/mo vs €6.99/mo mentioned elsewhere). Not an App Store blocker, but worth reconciling before launch so pricing is consistent everywhere.
