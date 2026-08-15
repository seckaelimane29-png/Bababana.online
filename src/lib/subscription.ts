import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { planById, type PlanId } from "@/lib/plans";

export type SubRow = {
  subscription_status: string;
  subscription_plan: string | null;
  trial_ends_at: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  grace_ends_at: string | null;
};

export type SubState = {
  loading: boolean;
  signedIn: boolean;
  row: SubRow | null;
  /** trial | active | expired | cancelled | guest */
  status: string;
  planId: PlanId | null;
  planName: string | null;
  isLifetime: boolean;
  startDate: Date | null;
  /** the date the current access period ends (trial end or subscription end) */
  endDate: Date | null;
  graceEndDate: Date | null;
  /** full access right now */
  isPremium: boolean;
  inGrace: boolean;
  daysLeft: number | null;
  refresh: () => void;
};

const DAY = 86400000;

export function useSubscription(): SubState {
  const { session, ready } = useSession();
  const [row, setRow] = useState<SubRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const userId = session?.user.id ?? null;

  useEffect(() => {
    if (!ready) return;
    if (!userId) {
      setRow(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase
      .from("profiles")
      .select("subscription_status, subscription_plan, trial_ends_at, subscription_start_date, subscription_end_date, grace_ends_at")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setRow((data as SubRow) ?? null);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, ready, tick]);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  const now = Date.now();
  const planId = (row?.subscription_plan as PlanId | null) ?? null;
  const isLifetime =
    planId === "lifetime" && (row?.subscription_status === "active" || row?.subscription_status === "lifetime");
  const rawStatus = !userId ? "guest" : (row?.subscription_status ?? "free");

  const endIso = rawStatus === "trial" ? row?.trial_ends_at : row?.subscription_end_date;
  const endDate = endIso ? new Date(endIso) : null;
  const graceEndDate = endDate;

  let isPremium = false;
  if (isLifetime) isPremium = true;
  else if (["trial", "active", "cancelled"].includes(rawStatus)) {
    isPremium = endDate ? now < endDate.getTime() : false;
  }

  const inGrace = false;
  const daysLeft = !isLifetime && endDate ? Math.ceil((endDate.getTime() - now) / DAY) : null;

  return {
    loading: loading && !!userId,
    signedIn: !!userId,
    row,
    status: rawStatus,
    planId,
    planName: planById(planId ?? undefined)?.name ?? null,
    isLifetime,
    startDate: row?.subscription_start_date ? new Date(row.subscription_start_date) : null,
    endDate,
    graceEndDate,
    isPremium,
    inGrace,
    daysLeft,
    refresh,
  };
}

export function formatDate(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

export function countdown(target: Date | null, now: number): string {
  if (!target) return "00:00:00";
  const ms = Math.max(0, target.getTime() - now);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

/* ---------- free tier daily limits ---------- */

const LIMITS = { book: 2, proverb: 3 };
type Kind = keyof typeof LIMITS;

function key(kind: Kind) {
  return `ysk:limit:${kind}:${new Date().toISOString().slice(0, 10)}`;
}

function readIds(kind: Kind): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(key(kind)) ?? "[]") as string[];
  } catch {
    return [];
  }
}

/** Records access to a free-tier item and reports whether it is allowed. */
export function useDailyLimit(kind: Kind, isPremium: boolean) {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => setIds(readIds(kind)), [kind]);

  const allow = useCallback(
    (id: string) => {
      if (isPremium) return true;
      const cur = readIds(kind);
      if (cur.includes(id)) return true;
      if (cur.length >= LIMITS[kind]) return false;
      const next = [...cur, id];
      window.localStorage.setItem(key(kind), JSON.stringify(next));
      setIds(next);
      return true;
    },
    [kind, isPremium],
  );

  return { used: ids.length, limit: LIMITS[kind], ids, allow };
}
