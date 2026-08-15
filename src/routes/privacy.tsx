import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Yesal Sa Khel" },
      { name: "description", content: "How Yesal Sa Khel collects, uses, and protects your data." },
    ],
  }),
  component: PrivacyPolicy,
});

const UPDATED = "August 15, 2026";

function PrivacyPolicy() {
  return (
    <div className="min-h-screen text-white" style={{ background: "var(--navy)" }}>
      <div className="mx-auto max-w-2xl px-5 pb-20 pt-6">
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-white/60">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <h1 className="mt-6 font-display text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-white/50">Last updated: {UPDATED}</p>

        <div className="prose prose-invert mt-8 max-w-none space-y-6 text-sm leading-relaxed text-white/80">
          <p>
            Yesal Sa Khel ("we," "us") provides a mobile and web app for reading African wisdom, book
            summaries, and diaspora stories. This policy explains what data we collect, why, and the
            choices you have.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-white">Information we collect</h2>
            <ul className="ml-5 list-disc space-y-1">
              <li><strong>Account information:</strong> email address and password (via Supabase Auth), display name, avatar, chosen language, and reading goal.</li>
              <li><strong>Usage data:</strong> reading streaks, bookmarks, quiz results, and which books/proverbs/stories you've read.</li>
              <li><strong>Payment information:</strong> subscription purchases are processed by Stripe; we never see or store your full card number. For manual Wave transfers, we store the sender name/phone you provide and a screenshot you upload as payment proof.</li>
              <li><strong>Content you create:</strong> answers you submit to the AI diaspora story generator, used only to generate your personal story.</li>
              <li><strong>Technical data:</strong> basic error logs and crash reports used to keep the app reliable.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">How we use your information</h2>
            <ul className="ml-5 list-disc space-y-1">
              <li>To provide and personalize the app (save your streak, bookmarks, and language preference).</li>
              <li>To process subscription payments and manage your plan.</li>
              <li>To respond to support requests sent to yesalsakhel@gmail.com.</li>
              <li>To detect, prevent, and fix bugs and abuse.</li>
            </ul>
            <p className="mt-2">We do not sell your personal data.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Who we share it with</h2>
            <ul className="ml-5 list-disc space-y-1">
              <li><strong>Supabase</strong> — our database, authentication, and file storage provider.</li>
              <li><strong>Stripe</strong> — payment processing for card and Apple Pay subscriptions.</li>
              <li>We do not share your data with advertisers or data brokers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Your rights</h2>
            <p>
              You can update your profile at any time in Settings. You can permanently delete your
              account and all associated data from <strong>Settings → Account → Delete account</strong>{" "}
              in the app. If you're in the EU/UK, you also have rights under GDPR to access, correct,
              or export your data — email yesalsakhel@gmail.com to request this.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Data retention</h2>
            <p>
              We keep your account data for as long as your account is active. When you delete your
              account, your profile, reading history, and uploaded payment proofs are permanently
              removed within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Children's privacy</h2>
            <p>Yesal Sa Khel is not directed to children under 13, and we do not knowingly collect data from them.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Changes to this policy</h2>
            <p>We'll update the date at the top of this page if this policy changes, and notify active subscribers of material changes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Contact us</h2>
            <p>Questions about this policy: <a className="underline" href="mailto:yesalsakhel@gmail.com">yesalsakhel@gmail.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
