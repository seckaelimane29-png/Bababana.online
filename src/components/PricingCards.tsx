import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, Lock } from "lucide-react";
import { AFRICA, PLANS, localAmount, type CountryCode, type Plan } from "@/lib/plans";
import { createCheckout } from "@/lib/billing.functions";
import { useSession } from "@/lib/auth";

const ACCENT: Record<Plan["accent"], string> = {
  gray: "rgba(255,255,255,0.18)",
  blue: "var(--bill-blue)",
  gold: "var(--gold)",
  green: "var(--primary)",
  dark: "var(--gold)",
};

export const PAYWALL_BULLETS = [
  "African wisdom in 5 languages",
  "31+ book summaries",
  "Daily proverbs from 12 cultures",
  "Immigrant success stories",
  "Read in 15 minutes",
];

export function PaywallHeader({ compact = false }: { compact?: boolean }) {
  return (
    <div>
      <h1 className={`font-display font-black leading-[1.05] text-white ${compact ? "text-2xl" : "text-[34px]"}`}>
        {compact ? (
          <>Unlock Full Access 🔒</>
        ) : (
          <>
            Your Growth Journey
            <br />
            Starts Here 🌍
          </>
        )}
      </h1>

      <ul className="mt-5 space-y-2.5">
        {PAYWALL_BULLETS.map((b) => (
          <li key={b} className="flex items-start gap-2.5 text-[15px] text-white/85">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full" style={{ background: "color-mix(in oklch, var(--gold) 22%, transparent)" }}>
              <Check className="h-3 w-3" style={{ color: "var(--gold)" }} />
            </span>
            {b}
          </li>
        ))}
      </ul>

      <p className="mt-5 font-display text-[17px] font-bold leading-snug" style={{ color: "var(--gold)" }}>
        The knowledge that built great Africans — packaged for the ones still becoming great.
      </p>
    </div>
  );
}

export function PricingCards({ compact = false }: { compact?: boolean }) {
  const nav = useNavigate();
  const { session } = useSession();
  const checkout = useServerFn(createCheckout);
  const [africa, setAfrica] = useState(false);
  const [country, setCountry] = useState<CountryCode>("gm");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function choose(plan: Plan) {
    setError(null);
    if (!session) {
      nav({ to: "/auth" });
      return;
    }
    if (africa) {
      if (plan.id !== "yearly" && plan.id !== "monthly") {
        setError("Only the yearly and monthly plans are available with Wave right now.");
        return;
      }
      nav({ to: "/pay/wave", search: { plan: plan.id, country } });
      return;
    }
    try {
      setBusy(plan.id);
      const res = await checkout({ data: { plan: plan.id as "yearly" | "monthly" | "lifetime", origin: window.location.origin } });
      window.location.href = res.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start checkout.");
      setBusy(null);
    }
  }

  return (
    <div>
      <button
        onClick={() => setAfrica((a) => !a)}
        className="mt-5 w-full rounded-2xl border p-3.5 text-left text-sm"
        style={{
          borderColor: africa ? "var(--gold)" : "rgba(255,255,255,0.15)",
          background: africa ? "color-mix(in oklch, var(--gold) 12%, transparent)" : "rgba(255,255,255,0.04)",
        }}
      >
        <span className="flex items-center gap-2 font-semibold text-white">
          <span className="text-lg leading-none">🇬🇲 🇸🇳</span>
          Paying from Gambia or Senegal? {africa ? "Local pricing on" : "Switch to local pricing"}
        </span>
        <span className="mt-1 block text-xs text-white/60">Pay via Wave — send to {AFRICA[country].wave} and upload your screenshot.</span>
      </button>

      {africa && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(Object.keys(AFRICA) as CountryCode[]).map((c) => (
            <button
              key={c}
              onClick={() => setCountry(c)}
              className="flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold text-white"
              style={{
                borderColor: country === c ? "var(--gold)" : "rgba(255,255,255,0.15)",
                background: country === c ? "color-mix(in oklch, var(--gold) 14%, transparent)" : "transparent",
              }}
            >
              <span className="text-xl leading-none">{c === "gm" ? "🇬🇲" : "🇸🇳"}</span>
              {AFRICA[c].label.replace(/\s*[🇬🇲🇸🇳]+\s*$/u, "")}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border p-3 text-sm" style={{ borderColor: "var(--bill-danger)", color: "var(--bill-danger)" }}>
          {error}
        </div>
      )}

      <div className={`mt-5 space-y-4 ${compact ? "" : ""}`}>
        {PLANS.map((plan) => {
          const accent = ACCENT[plan.accent];
          const local = africa ? localAmount(plan, country) : null;
          const unavailable = africa && local === null;
          const isDark = plan.accent === "dark";
          return (
            <div
              key={plan.id}
              className="relative rounded-3xl border p-5"
              style={{
                borderColor: accent,
                background: isDark ? "linear-gradient(160deg, rgba(0,0,0,0.6), rgba(255,255,255,0.03))" : "rgba(255,255,255,0.05)",
                opacity: unavailable ? 0.45 : 1,
                boxShadow: plan.accent === "gold" ? "0 12px 40px -18px var(--gold)" : "none",
              }}
            >
              {plan.badge && (
                <span
                  className="absolute -top-3 left-5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                  style={{ background: "var(--gold)", color: "var(--navy)" }}
                >
                  {plan.badge}
                </span>
              )}

              <div className="font-display text-base font-black uppercase tracking-[0.12em] text-white sm:text-lg">{plan.name}</div>

              <div className="mt-2 flex items-end gap-2">
                {plan.strikePrice && !local && (
                  <span className="pb-1.5 text-lg font-semibold text-white/40 line-through">{plan.strikePrice}</span>
                )}
                <span className="font-display text-5xl font-black leading-none" style={{ color: accent }}>
                  {local !== null ? `${local.toLocaleString()} ${AFRICA[country].currency}` : plan.price}
                </span>
                <span className="pb-1.5 text-sm text-white/60">{plan.cadence}</span>
              </div>

              {plan.weekly && !local && <div className="mt-1.5 text-base font-bold" style={{ color: "var(--gold)" }}>{plan.weekly}</div>}
              <div className="mt-1 text-xs text-white/55">{plan.renews}</div>

              {!compact && (
                <ul className="mt-4 space-y-2">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm text-white/80">
                      <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accent }} /> {perk}
                    </li>
                  ))}
                </ul>
              )}

              <button
                disabled={unavailable || busy === plan.id}
                onClick={() => choose(plan)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold disabled:opacity-60"
                style={
                  plan.accent === "gold"
                    ? { background: "var(--gold)", color: "var(--navy)" }
                    : plan.accent === "blue"
                      ? { background: "transparent", color: "var(--bill-blue)", border: "1.5px solid var(--bill-blue)" }
                      : { background: "rgba(0,0,0,0.55)", color: "var(--gold)", border: "1.5px solid var(--gold)" }
                }
              >
                {busy === plan.id && <Loader2 className="h-4 w-4 animate-spin" />}
                {unavailable ? "Not available with Wave" : africa ? "Pay with Wave" : (plan.cta ?? `Choose ${plan.name}`)}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-white/45">Cancel anytime. No questions asked.</p>
      <p className="mt-1 flex items-center justify-center gap-1.5 text-center text-xs text-white/45">
        <Lock className="h-3 w-3" /> Secure payment via Stripe
      </p>
    </div>
  );
}
