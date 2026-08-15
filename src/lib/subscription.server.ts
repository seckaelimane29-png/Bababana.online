const DURATIONS: Record<string, number | null> = {
  yearly: 365,
  monthly: 30,
  lifetime: null,
};

export function endDateFor(plan: string, from = new Date()): string | null {
  const days = DURATIONS[plan];
  if (days == null) return null;
  return new Date(from.getTime() + days * 86400000).toISOString();
}

export function graceEndFor(endIso: string | null): string | null {
  if (!endIso) return null;
  return new Date(new Date(endIso).getTime() + 86400000).toISOString();
}

/** Activates a plan on a member profile using the privileged client. */
export async function activatePlan(userId: string, plan: string, stripeCustomerId?: string | null) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const start = new Date();
  const end = endDateFor(plan, start);
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      subscription_status: plan === "lifetime" ? "lifetime" : "active",
      subscription_plan: plan,
      subscription_start_date: start.toISOString(),
      subscription_end_date: end,
      grace_ends_at: graceEndFor(end),
      ...(stripeCustomerId ? { stripe_customer_id: stripeCustomerId } : {}),
    })
    .eq("id", userId);
  if (error) throw error;
}
