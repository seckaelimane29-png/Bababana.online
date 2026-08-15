import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PaywallHeader, PricingCards } from "@/components/PricingCards";
import { useSubscription, formatDate } from "@/lib/subscription";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Plans & Pricing — Yesal Sa Khel" },
      { name: "description", content: "Unlock 31+ African book summaries, daily proverbs and immigrant success stories in 5 languages. Yearly €49.99, monthly €6.99 or lifetime €29.99." },
      { property: "og:title", content: "Plans & Pricing — Yesal Sa Khel" },
      { property: "og:description", content: "Yearly €49.99, monthly €6.99 or lifetime €29.99. Local Wave pricing for Gambia and Senegal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  const sub = useSubscription();

  return (
    <div className="min-h-screen text-white" style={{ background: "var(--navy)" }}>
      <div className="mx-auto max-w-md px-5 pb-20 pt-6">
        <Link to="/app" className="inline-flex items-center gap-2 text-xs text-white/60">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="mt-6">
          <PaywallHeader />
        </div>

        {sub.signedIn && sub.isPremium && (
          <div className="mt-5 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm">
            <span className="text-white/70">Current plan: </span>
            <span className="font-semibold">{sub.status === "trial" ? "Free trial" : (sub.planName ?? "Free Plan")}</span>
            {!sub.isLifetime && <div className="text-xs text-white/60">Expires {formatDate(sub.endDate)}</div>}
          </div>
        )}

        <PricingCards />

        <p className="mt-8 text-center text-xs text-white/45">
          Questions? <a className="underline" href="mailto:yesalsakhel@gmail.com">yesalsakhel@gmail.com</a>
        </p>
      </div>
    </div>
  );
}
