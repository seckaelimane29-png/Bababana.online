import { createFileRoute } from "@tanstack/react-router";

type StripeEvent = {
  type: string;
  data: { object: Record<string, unknown> };
};

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["STRIPE_WEBHOOK_SECRET"];
        if (!secret) return new Response("Not configured", { status: 500 });

        const payload = await request.text();
        const { verifyStripeSignature } = await import("@/lib/stripe.server");
        const valid = await verifyStripeSignature(payload, request.headers.get("stripe-signature"), secret);
        if (!valid) return new Response("Invalid signature", { status: 401 });

        const event = JSON.parse(payload) as StripeEvent;
        const obj = event.data.object;
        const metadata = (obj["metadata"] as Record<string, string> | undefined) ?? {};
        const userId = metadata["user_id"] ?? (obj["client_reference_id"] as string | undefined);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { activatePlan } = await import("@/lib/subscription.server");

        try {
          const trialing = obj["status"] === "trialing";
          const trialEnd = typeof obj["trial_end"] === "number" ? new Date((obj["trial_end"] as number) * 1000).toISOString() : null;

          const startTrial = async (id: string, customer: string | null) => {
            await supabaseAdmin
              .from("profiles")
              .update({
                subscription_status: "trial",
                subscription_plan: "yearly",
                trial_ends_at: trialEnd,
                subscription_end_date: trialEnd,
                grace_ends_at: null,
                ...(customer ? { stripe_customer_id: customer } : {}),
              })
              .eq("id", id);
          };

          if (event.type === "checkout.session.completed" && userId) {
            await activatePlan(userId, metadata["plan"] ?? "yearly", (obj["customer"] as string | null) ?? null);
          } else if (event.type === "customer.subscription.created" || (event.type === "customer.subscription.updated" && trialing)) {
            const customer = (obj["customer"] as string | null) ?? null;
            let targetId: string | undefined = userId;
            if (!targetId && customer) {
              const { data } = await supabaseAdmin.from("profiles").select("id").eq("stripe_customer_id", customer).maybeSingle();
              targetId = data?.id ?? undefined;
            }
            if (targetId) {
              if (trialing && trialEnd) await startTrial(targetId, customer);
              else await activatePlan(targetId, metadata["plan"] ?? "yearly", customer);
            }
          } else if (event.type === "invoice.paid" || event.type === "customer.subscription.updated") {
            const customer = obj["customer"] as string | undefined;
            let targetId: string | undefined = userId;
            if (!targetId && customer) {
              const { data } = await supabaseAdmin.from("profiles").select("id, subscription_plan").eq("stripe_customer_id", customer).maybeSingle();
              targetId = data?.id ?? undefined;
              if (targetId) await activatePlan(targetId, metadata["plan"] ?? data?.subscription_plan ?? "yearly", customer);
            } else if (targetId) {
              await activatePlan(targetId, metadata["plan"] ?? "yearly", customer ?? null);
            }
          } else if (event.type === "customer.subscription.deleted" || event.type === "invoice.payment_failed") {
            const customer = obj["customer"] as string | undefined;
            if (customer) {
              await supabaseAdmin.from("profiles").update({ subscription_status: "expired" }).eq("stripe_customer_id", customer);
            } else if (userId) {
              await supabaseAdmin.from("profiles").update({ subscription_status: "expired" }).eq("id", userId);
            }
          }
        } catch (err) {
          console.error("stripe webhook", err);
          return new Response("Handler error", { status: 500 });
        }

        return new Response("ok");
      },
    },
  },
});
