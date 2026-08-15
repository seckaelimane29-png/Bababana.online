import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Yesal Sa Khel" },
      { name: "description", content: "The terms that govern your use of Yesal Sa Khel." },
    ],
  }),
  component: TermsOfService,
});

const UPDATED = "August 15, 2026";

function TermsOfService() {
  return (
    <div className="min-h-screen text-white" style={{ background: "var(--navy)" }}>
      <div className="mx-auto max-w-2xl px-5 pb-20 pt-6">
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-white/60">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <h1 className="mt-6 font-display text-3xl font-bold">Terms of Service</h1>
        <p className="mt-2 text-sm text-white/50">Last updated: {UPDATED}</p>

        <div className="prose prose-invert mt-8 max-w-none space-y-6 text-sm leading-relaxed text-white/80">
          <p>
            By creating an account or using Yesal Sa Khel ("the app"), you agree to these terms.
            If you don't agree, please don't use the app.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-white">The service</h2>
            <p>
              Yesal Sa Khel provides book summaries, African proverbs, immigrant success stories, and
              related reading tools. A Free plan is available; Premium and Founding Member plans unlock
              additional content and features for a subscription or one-time fee, as described on the
              Pricing page at the time of purchase.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Your account</h2>
            <p>
              You're responsible for keeping your login credentials secure and for all activity under
              your account. You must be at least 13 years old to create an account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Subscriptions and payments</h2>
            <p>
              Paid plans renew automatically until cancelled, and are billed through Stripe (card,
              Apple Pay) or, where offered, via manual Wave transfer subject to review. Prices are shown
              in your local currency where available. You can cancel a subscription at any time from
              Settings; access continues until the end of the current billing period. Refunds are
              handled case by case — contact yesalsakhel@gmail.com.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Content</h2>
            <p>
              Book summaries, proverbs, and stories are provided for personal, non-commercial use.
              Don't copy, redistribute, or resell app content. Diaspora stories you generate are yours
              to keep and share.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Acceptable use</h2>
            <p>
              Don't misuse the app: no attempts to break authentication, scrape content at scale, upload
              unlawful or fraudulent payment proof, or interfere with other users' access.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Termination</h2>
            <p>
              You may delete your account at any time from Settings. We may suspend or terminate
              accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Disclaimer</h2>
            <p>
              The app is provided "as is." Content is for informational and motivational purposes and
              isn't professional financial, legal, or medical advice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Changes</h2>
            <p>We may update these terms from time to time; continued use after an update means you accept the revised terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Contact</h2>
            <p>Questions: <a className="underline" href="mailto:yesalsakhel@gmail.com">yesalsakhel@gmail.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
