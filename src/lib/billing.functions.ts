import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const PlanEnum = z.enum(["yearly", "monthly", "lifetime"]);

export const createCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ plan: PlanEnum, origin: z.string().url() }).parse(d))
  .handler(async ({ data, context }): Promise<{ url: string }> => {
    const { PLANS, TRIAL_DAYS } = await import("./plans");
    const { stripeFetch } = await import("./stripe.server");
    const plan = PLANS.find((p) => p.id === data.plan);
    if (!plan?.stripePriceId) throw new Error("Unknown plan");

    const session = await stripeFetch<{ url: string }>("checkout/sessions", {
      mode: plan.id === "lifetime" ? "payment" : "subscription",
      "line_items[0][price]": plan.stripePriceId,
      "line_items[0][quantity]": "1",
      success_url: `${data.origin}/app/profile?checkout=success`,
      cancel_url: `${data.origin}/pricing?checkout=cancelled`,
      client_reference_id: context.userId,
      "metadata[user_id]": context.userId,
      "metadata[plan]": plan.id,
      ...(plan.id === "lifetime"
        ? {}
        : {
            "subscription_data[metadata][user_id]": context.userId,
            "subscription_data[metadata][plan]": plan.id,
            ...(plan.id === "yearly" ? { "subscription_data[trial_period_days]": String(TRIAL_DAYS) } : {}),
          }),
      ...(context.claims.email ? { customer_email: String(context.claims.email) } : {}),
    });
    return { url: session.url };
  });

export const submitManualPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        country: z.enum(["gm", "sn"]),
        plan: z.enum(["yearly", "monthly"]),
        amount: z.number().positive(),
        currency: z.string().min(2).max(10),
        senderName: z.string().max(120).optional(),
        senderPhone: z.string().max(40).optional(),
        screenshotPath: z.string().max(300).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { error } = await context.supabase.from("manual_payments").insert({
      user_id: context.userId,
      country: data.country,
      plan: data.plan,
      amount: data.amount,
      currency: data.currency,
      method: "wave",
      sender_name: data.senderName ?? null,
      sender_phone: data.senderPhone ?? null,
      screenshot_path: data.screenshotPath ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("manual_payments")
      .select("id, plan, amount, currency, status, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    return data ?? [];
  });

export const amIAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<boolean> => {
    const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    return data === true;
  });

export type AdminOverview = {
  active: { id: string; name: string; plan: string | null; start: string | null; end: string | null }[];
  expired: { id: string; name: string; end: string | null }[];
  pending: {
    id: string;
    user_id: string;
    name: string;
    country: string;
    plan: string;
    amount: number;
    currency: string;
    sender_name: string | null;
    sender_phone: string | null;
    screenshot_url: string | null;
    created_at: string;
  }[];
  revenueEur: number;
  revenueLocal: { currency: string; amount: number }[];
};

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminOverview> => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (isAdmin !== true) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { PLANS } = await import("./plans");

    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, display_name, subscription_status, subscription_plan, subscription_start_date, subscription_end_date");
    const { data: payments } = await supabaseAdmin
      .from("manual_payments")
      .select("*")
      .order("created_at", { ascending: false });

    const names = new Map((profiles ?? []).map((p) => [p.id, p.display_name ?? "Member"]));
    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);

    const priceOf = (plan: string | null) => {
      const p = PLANS.find((x) => x.id === plan);
      return p ? Number(p.price.replace(/[^\d.]/g, "")) : 0;
    };

    const active = (profiles ?? [])
      .filter((p) => p.subscription_status === "active")
      .map((p) => ({ id: p.id, name: p.display_name ?? "Member", plan: p.subscription_plan, start: p.subscription_start_date, end: p.subscription_end_date }));

    const expired = (profiles ?? [])
      .filter((p) => p.subscription_status === "expired" || p.subscription_status === "cancelled")
      .map((p) => ({ id: p.id, name: p.display_name ?? "Member", end: p.subscription_end_date }));

    const revenueEur = (profiles ?? [])
      .filter((p) => p.subscription_status === "active" && p.subscription_start_date && new Date(p.subscription_start_date) >= monthStart)
      .reduce((sum, p) => sum + priceOf(p.subscription_plan), 0);

    const localMap = new Map<string, number>();
    for (const pay of payments ?? []) {
      if (pay.status !== "approved") continue;
      if (new Date(pay.created_at) < monthStart) continue;
      localMap.set(pay.currency, (localMap.get(pay.currency) ?? 0) + Number(pay.amount));
    }

    const pending = [];
    for (const pay of (payments ?? []).filter((p) => p.status === "pending")) {
      let url: string | null = null;
      if (pay.screenshot_path) {
        const { data: signed } = await supabaseAdmin.storage.from("payment-proofs").createSignedUrl(pay.screenshot_path, 3600);
        url = signed?.signedUrl ?? null;
      }
      pending.push({
        id: pay.id,
        user_id: pay.user_id,
        name: names.get(pay.user_id) ?? "Member",
        country: pay.country,
        plan: pay.plan,
        amount: Number(pay.amount),
        currency: pay.currency,
        sender_name: pay.sender_name,
        sender_phone: pay.sender_phone,
        screenshot_url: url,
        created_at: pay.created_at,
      });
    }

    return {
      active,
      expired,
      pending,
      revenueEur,
      revenueLocal: [...localMap].map(([currency, amount]) => ({ currency, amount })),
    };
  });

export const reviewManualPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), approve: z.boolean(), note: z.string().max(300).optional() }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (isAdmin !== true) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { activatePlan } = await import("./subscription.server");

    const { data: payment, error } = await supabaseAdmin.from("manual_payments").select("*").eq("id", data.id).maybeSingle();
    if (error || !payment) throw new Error("Payment not found");

    await supabaseAdmin
      .from("manual_payments")
      .update({
        status: data.approve ? "approved" : "rejected",
        review_note: data.note ?? null,
        reviewed_by: context.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id);

    if (data.approve) await activatePlan(payment.user_id, payment.plan);
    return { ok: true };
  });
