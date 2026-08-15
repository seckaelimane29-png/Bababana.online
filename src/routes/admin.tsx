import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Check, Loader2, X } from "lucide-react";
import { adminOverview, reviewManualPayment } from "@/lib/billing.functions";
import { formatDate } from "@/lib/subscription";
import { useSession } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Yesal Sa Khel" },
      { name: "description", content: "Subscriber, Wave payment and revenue overview for Yesal Sa Khel." },
      { property: "og:title", content: "Admin — Yesal Sa Khel" },
      { property: "og:description", content: "Internal subscription dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const { session, ready } = useSession();
  const overview = useServerFn(adminOverview);
  const review = useServerFn(reviewManualPayment);
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-overview", session?.user.id],
    queryFn: () => overview(),
    enabled: ready && !!session,
  });

  const mut = useMutation({
    mutationFn: (v: { id: string; approve: boolean }) => review({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-overview"] }),
  });

  if (ready && !session) {
    return (
      <Shell>
        <p className="text-sm text-white/70">Sign in with an admin account to view this dashboard.</p>
        <Link to="/auth" className="mt-4 inline-block rounded-full px-5 py-2.5 text-sm font-bold" style={{ background: "var(--gold)", color: "var(--navy)" }}>Sign in</Link>
      </Shell>
    );
  }
  if (isLoading) return <Shell><Loader2 className="h-5 w-5 animate-spin text-white/60" /></Shell>;
  if (error) return <Shell><p className="text-sm" style={{ color: "var(--bill-danger)" }}>You do not have access to this dashboard.</p></Shell>;
  if (!data) return <Shell><p className="text-sm text-white/60">No data.</p></Shell>;

  return (
    <Shell>
      <h1 className="font-display text-2xl font-bold">Subscriptions</h1>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="Active" value={String(data.active.length)} />
        <Stat label="Pending Wave" value={String(data.pending.length)} />
        <Stat label="Expired" value={String(data.expired.length)} />
      </div>

      <div className="mt-3 rounded-2xl border border-white/12 p-4" style={{ background: "rgba(255,255,255,0.04)" }}>
        <div className="text-[11px] uppercase tracking-widest text-white/50">Revenue this month</div>
        <div className="mt-1 font-display text-2xl font-black" style={{ color: "var(--gold)" }}>€{data.revenueEur.toFixed(2)}</div>
        {data.revenueLocal.map((r) => (
          <div key={r.currency} className="text-xs text-white/60">+ {r.amount.toLocaleString()} {r.currency}</div>
        ))}
      </div>

      <Section title={`Pending Wave payments (${data.pending.length})`}>
        {data.pending.length === 0 && <p className="text-sm text-white/50">Nothing waiting for confirmation.</p>}
        {data.pending.map((p) => (
          <div key={p.id} className="rounded-2xl border border-white/12 p-4" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div className="flex items-center justify-between">
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm" style={{ color: "var(--gold)" }}>{p.amount.toLocaleString()} {p.currency}</div>
            </div>
            <div className="mt-1 text-xs text-white/55">
              {p.plan} · {p.country.toUpperCase()} · {formatDate(new Date(p.created_at))}
              {p.sender_name ? ` · ${p.sender_name}` : ""}{p.sender_phone ? ` · ${p.sender_phone}` : ""}
            </div>
            {p.screenshot_url && (
              <a href={p.screenshot_url} target="_blank" rel="noreferrer noopener" className="mt-3 block overflow-hidden rounded-xl border border-white/10">
                <img src={p.screenshot_url} alt={`Wave payment proof from ${p.name}`} className="max-h-64 w-full object-contain bg-black/40" loading="lazy" />
              </a>
            )}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => mut.mutate({ id: p.id, approve: true })}
                disabled={mut.isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold disabled:opacity-60"
                style={{ background: "var(--primary)", color: "var(--navy)" }}
              >
                <Check className="h-4 w-4" /> Confirm payment
              </button>
              <button
                onClick={() => mut.mutate({ id: p.id, approve: false })}
                disabled={mut.isPending}
                className="flex items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm text-white/70 disabled:opacity-60"
              >
                <X className="h-4 w-4" /> Reject
              </button>
            </div>
          </div>
        ))}
      </Section>

      <Section title={`Active subscribers (${data.active.length})`}>
        {data.active.map((a) => (
          <Row key={a.id} left={a.name} right={a.plan ?? "—"} sub={`Expires ${a.end ? formatDate(new Date(a.end)) : "never"}`} />
        ))}
        {data.active.length === 0 && <p className="text-sm text-white/50">No active subscribers yet.</p>}
      </Section>

      <Section title={`Expired accounts (${data.expired.length})`}>
        {data.expired.map((a) => (
          <Row key={a.id} left={a.name} right="expired" sub={a.end ? formatDate(new Date(a.end)) : "—"} />
        ))}
        {data.expired.length === 0 && <p className="text-sm text-white/50">None.</p>}
      </Section>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-white" style={{ background: "var(--navy)" }}>
      <div className="mx-auto max-w-md px-5 pb-16 pt-6">
        <Link to="/app" className="mb-6 inline-flex items-center gap-2 text-xs text-white/60"><ArrowLeft className="h-4 w-4" /> App</Link>
        {children}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/12 p-3 text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
      <div className="font-display text-xl font-black">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-white/50">{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8 space-y-3">
      <h2 className="text-[11px] uppercase tracking-[0.25em] text-white/50">{title}</h2>
      {children}
    </div>
  );
}

function Row({ left, right, sub }: { left: string; right: string; sub: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3" style={{ background: "rgba(255,255,255,0.03)" }}>
      <div>
        <div className="text-sm font-semibold">{left}</div>
        <div className="text-[11px] text-white/50">{sub}</div>
      </div>
      <div className="text-xs" style={{ color: "var(--gold)" }}>{right}</div>
    </div>
  );
}
