import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";

export function Paywall({ title, message }: { title?: string; message?: string }) {
  return (
    <div className="rounded-2xl border p-6 text-center" style={{ borderColor: "var(--gold)", background: "var(--navy)" }}>
      <Lock className="mx-auto h-5 w-5" style={{ color: "var(--gold)" }} />
      <div className="mt-3 font-display text-lg font-bold text-white">{title ?? "You are on the free plan"}</div>
      <p className="mt-1 text-sm text-white/70">{message ?? "Renew your subscription to unlock everything — all 31 books, every insight and all proverbs."}</p>
      <Link
        to="/pricing"
        className="mt-4 inline-flex w-full items-center justify-center rounded-full py-3 text-sm font-bold"
        style={{ background: "var(--gold)", color: "var(--navy)" }}
      >
        Renew now
      </Link>
    </div>
  );
}
