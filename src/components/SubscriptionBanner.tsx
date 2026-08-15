import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { useSubscription } from "@/lib/subscription";

type Tone = "warn" | "alert" | "danger";

const TONE: Record<Tone, { bg: string; text: string }> = {
  warn: { bg: "color-mix(in oklch, var(--bill-warn) 20%, transparent)", text: "var(--bill-warn)" },
  alert: { bg: "color-mix(in oklch, var(--bill-alert) 20%, transparent)", text: "var(--bill-alert)" },
  danger: { bg: "color-mix(in oklch, var(--bill-danger) 22%, transparent)", text: "var(--bill-danger)" },
};

export function SubscriptionBanner() {
  const sub = useSubscription();
  if (sub.loading || !sub.signedIn || sub.isLifetime) return null;

  const trial = sub.status === "trial";
  const d = sub.daysLeft;
  let tone: Tone | null = null;
  let message = "";
  let cta = "Manage plan";

  if (trial && sub.isPremium && d !== null && d <= 1) {
    tone = "warn";
    message = "Your free trial ends tomorrow. You will be charged €49.99 unless you cancel.";
  } else if (sub.status === "expired" || (!sub.isPremium && sub.status !== "free" && sub.status !== "guest")) {
    tone = "danger";
    message = "Your subscription ended. You are back on the free tier — insight 1 of every book.";
    cta = "Renew now";
  } else if (!sub.isPremium && d !== null && d <= 3 && d > 0) {
    tone = "alert";
    message = `${d} days left on your plan.`;
  }

  if (!tone) return null;
  const style = TONE[tone];

  return (
    <div className="px-5 pt-4">
      <div className="rounded-2xl border p-4" style={{ background: style.bg, borderColor: style.text }}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: style.text }} />
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: style.text }}>{message}</p>
            <Link
              to="/pricing"
              className="mt-3 flex w-full items-center justify-center rounded-full py-2.5 text-sm font-bold"
              style={{ background: style.text, color: "var(--navy)" }}
            >
              {cta}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
