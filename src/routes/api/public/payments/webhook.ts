import { createFileRoute } from "@tanstack/react-router";
import { verifyWebhook, EventName, type PaddleEnv } from "@/lib/paddle.server";

const PLAN_BY_PRODUCT: Record<string, "starter" | "pro" | "unlimited"> = {
  starter_plan: "starter",
  pro_plan: "pro",
  unlimited_plan: "unlimited",
};

function mapStatus(status: string) {
  if (status === "active" || status === "trialing" || status === "past_due") return "active";
  return status; // canceled, paused
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function upsertFromSubscription(data: any, env: PaddleEnv) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const productId: string | undefined = data.items?.[0]?.product?.importMeta?.externalId;
  const plan = productId ? PLAN_BY_PRODUCT[productId] : undefined;
  const userId: string | undefined = data.customData?.userId;

  const values = {
    ...(plan ? { plan } : {}),
    subscription_status: mapStatus(data.status),
    paddle_subscription_id: data.id,
    paddle_customer_id: data.customerId,
    billing_environment: env,
    updated_at: new Date().toISOString(),
  };

  if (userId) {
    if (!plan) { console.warn("Unknown product on subscription", data.id); return; }
    await supabaseAdmin.from("account_plans").upsert({ user_id: userId, ...values }, { onConflict: "user_id" });
  } else {
    await supabaseAdmin.from("account_plans").update(values).eq("paddle_subscription_id", data.id);
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const envParam = new URL(request.url).searchParams.get("env");
        const env: PaddleEnv = envParam === "live" ? "live" : "sandbox";
        try {
          const event = await verifyWebhook(request, env);
          switch (event.eventType) {
            case EventName.SubscriptionCreated:
            case EventName.SubscriptionUpdated:
            case EventName.SubscriptionCanceled:
              await upsertFromSubscription(event.data, env);
              break;
            default:
              break;
          }
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
