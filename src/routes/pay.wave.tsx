import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, CheckCircle2, Copy, Loader2, Upload } from "lucide-react";
import { AFRICA, PLANS, localAmount, type CountryCode } from "@/lib/plans";
import { submitManualPayment } from "@/lib/billing.functions";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import waveQr from "@/assets/wave-qr.jpg.asset.json";

type Search = { plan: "yearly" | "monthly"; country: CountryCode };

export const Route = createFileRoute("/pay/wave")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    plan: search["plan"] === "monthly" ? "monthly" : "yearly",
    country: search["country"] === "sn" ? "sn" : "gm",
  }),
  head: () => ({
    meta: [
      { title: "Pay with Wave — Yesal Sa Khel" },
      { name: "description", content: "Send your Wave transfer, upload the screenshot and we activate your Yesal Sa Khel plan." },
      { property: "og:title", content: "Pay with Wave — Yesal Sa Khel" },
      { property: "og:description", content: "Wave payment for Gambia and Senegal readers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WavePay,
});

function WavePay() {
  const { plan: planId, country } = Route.useSearch() as Search;
  const nav = useNavigate();
  const { session, ready } = useSession();
  const submit = useServerFn(submitManualPayment);

  const plan = PLANS.find((p) => p.id === planId)!;
  const info = AFRICA[country];
  const amount = localAmount(plan, country) ?? 0;

  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !session) nav({ to: "/auth", replace: true });
  }, [ready, session, nav]);

  async function send() {
    setError(null);
    if (!file) {
      setError("Please upload your Wave payment screenshot.");
      return;
    }
    setBusy(true);
    try {
      const uid = session!.user.id;
      const path = `${uid}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("payment-proofs").upload(path, file, { upsert: false });
      if (upErr) throw new Error(upErr.message);
      await submit({ data: { country, plan: planId, amount, currency: info.currency, senderName: name || undefined, senderPhone: phone || undefined, screenshotPath: path } });
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit your payment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen text-white" style={{ background: "var(--navy)" }}>
      <div className="mx-auto max-w-md px-5 pb-16 pt-6">
        <Link to="/pricing" className="inline-flex items-center gap-2 text-xs text-white/60">
          <ArrowLeft className="h-4 w-4" /> Plans
        </Link>

        {done ? (
          <div className="mt-16 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12" style={{ color: "var(--primary)" }} />
            <h1 className="mt-4 font-display text-2xl font-bold">Payment received — pending confirmation</h1>
            <p className="mt-2 text-sm text-white/65">Our team checks Wave transfers manually. Your account activates as soon as it is confirmed, usually within a few hours.</p>
            <Link to="/app" className="mt-6 inline-flex w-full items-center justify-center rounded-full py-3 font-bold" style={{ background: "var(--gold)", color: "var(--navy)" }}>
              Keep reading
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mt-6 font-display text-2xl font-bold">Pay with Wave — {info.label}</h1>
            <div className="mt-4 rounded-3xl border p-5" style={{ borderColor: "var(--gold)", background: "rgba(255,255,255,0.04)" }}>
              <div className="text-[11px] uppercase tracking-widest text-white/50">Step 1 — Send</div>
              <div className="mt-2 font-display text-3xl font-black" style={{ color: "var(--gold)" }}>
                {amount.toLocaleString()} {info.currency}
              </div>
              <div className="text-xs text-white/60">{plan.name} plan · {plan.renews}</div>
              <button
                onClick={() => navigator.clipboard?.writeText(info.wave)}
                className="mt-4 flex w-full items-center justify-between rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-sm"
              >
                <span className="font-semibold tracking-wide">{info.wave}</span>
                <Copy className="h-4 w-4 text-white/60" />
              </button>
              <p className="mt-2 text-xs text-white/55">Send {amount.toLocaleString()} {info.currency} via Wave to this number, then upload your screenshot below.</p>
              <p className="mt-1 text-[11px] text-white/40">This Wave number works for both Gambia and Senegal.</p>

              <div className="mt-4 rounded-2xl bg-white/5 p-3 text-center">
                <div className="text-[11px] uppercase tracking-widest text-white/50">Or scan with Wave</div>
                <img
                  src={waveQr.url}
                  alt="Wave QR code to pay Yesal Sa Khel"
                  loading="lazy"
                  className="mx-auto mt-2 w-full max-w-[240px] rounded-xl"
                />
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-white/12 p-5" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="text-[11px] uppercase tracking-widest text-white/50">Step 2 — Upload proof</div>
              <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/25 px-4 py-5 text-sm text-white/70">
                <Upload className="h-4 w-4" />
                {file ? file.name : "Choose your payment screenshot"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name on the Wave account (optional)"
                className="mt-3 w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-sm outline-none placeholder:text-white/35"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Wave number you sent from (optional)"
                className="mt-2 w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-sm outline-none placeholder:text-white/35"
              />
            </div>

            {error && <div className="mt-4 rounded-xl border p-3 text-sm" style={{ borderColor: "var(--bill-danger)", color: "var(--bill-danger)" }}>{error}</div>}

            <button
              onClick={send}
              disabled={busy}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-bold disabled:opacity-60"
              style={{ background: "var(--gold)", color: "var(--navy)" }}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Submit payment for confirmation
            </button>
          </>
        )}
      </div>
    </div>
  );
}
