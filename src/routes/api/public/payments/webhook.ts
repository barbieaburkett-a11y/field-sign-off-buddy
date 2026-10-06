import { createFileRoute } from "@tanstack/react-router";
import { verifyWebhook, EventName, type PaddleEnv } from "@/lib/paddle.server";

const PLAN_BY_PRODUCT: Record<string, "starter" | "pro" | "unlimited"> = {
  starter_plan: "starter",
  pro_plan: "pro",
  unlimited_plan: "unlimited",
};

function mapStatus(status: string) {
  if (status === "active" || status === "trialing") return "active";
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
    ...(data.status === "active" || data.status === "trialing"
      ? { payment_failed_at: null, grace_period_ends_at: null, next_payment_retry_at: null, retry_reminder_sent_for: null }
      : {}),
  };

  if (userId) {
    if (!plan) { console.warn("Unknown product on subscription", data.id); return; }
    await supabaseAdmin.from("account_plans").upsert({ user_id: userId, ...values }, { onConflict: "user_id" });
  } else {
    await supabaseAdmin.from("account_plans").update(values).eq("paddle_subscription_id", data.id);
  }
  if (data.status === "past_due") await startGracePeriod(data.id, data.nextBilledAt);
}

const PACK_BY_PRODUCT: Record<string, string> = {
  tpl_electrical: "electrical",
  tpl_plumbing_hvac: "plumbing_hvac",
  tpl_concrete_framing: "concrete_framing",
  tpl_finishes: "finishes",
  tpl_bundle: "bundle",
};
const PACK_NAMES: Record<string, string> = {
  electrical: "Electrical Template Pack", plumbing_hvac: "Plumbing & HVAC Template Pack",
  concrete_framing: "Concrete & Framing Template Pack", finishes: "Drywall, Paint & Finishes Template Pack",
  bundle: "All-Trades Template Bundle",
};

// One-time template pack purchase: record access and email the download link.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleTemplatePurchase(data: any, env: PaddleEnv) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const packs: string[] = (data.items ?? []).map((i: any) => PACK_BY_PRODUCT[i.price?.productId && i.product?.importMeta?.externalId ? i.product.importMeta.externalId : i.price?.importMeta?.externalId?.replace(/_once$/, "") ?? ""]).filter(Boolean);
  if (!packs.length) return;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { getPaddleClient } = await import("@/lib/paddle.server");
  let email: string | undefined;
  if (data.customerId) {
    const customer = await getPaddleClient(env).customers.get(data.customerId);
    email = customer.email;
  }
  if (!email) { console.error("No customer email for template purchase", data.id); return; }
  const { data: row, error } = await supabaseAdmin.from("template_purchases")
    .upsert({ email, packs, paddle_transaction_id: data.id, environment: env }, { onConflict: "paddle_transaction_id" })
    .select("access_token,email_sent_at").single();
  if (error || !row) { console.error("Template purchase save failed", error); return; }
  if (row.email_sent_at) return;
  const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
  await sendTemplateEmail("template-purchase", email, {
    templateData: { packNames: packs.map((p) => PACK_NAMES[p]).join(", "), accessUrl: `https://approvefield.app/templates/access/${row.access_token}` },
    idempotencyKey: `template-purchase-${data.id}`,
  });
  await supabaseAdmin.from("template_purchases").update({ email_sent_at: new Date().toISOString() }).eq("paddle_transaction_id", data.id);
}

const GRACE_DAYS = 7;

// Starts the grace period once per failure episode; access stays on until it ends.
async function startGracePeriod(subscriptionId: string, nextRetryAt?: string | null) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const now = new Date();
  await supabaseAdmin.from("account_plans")
    .update({
      subscription_status: "past_due",
      updated_at: now.toISOString(),
      // Paddle's own retry schedule: the next attempt it has planned for this subscription.
      ...(nextRetryAt && new Date(nextRetryAt).getTime() > now.getTime() ? { next_payment_retry_at: nextRetryAt } : {}),
    })
    .eq("paddle_subscription_id", subscriptionId);
  await supabaseAdmin.from("account_plans")
    .update({
      payment_failed_at: now.toISOString(),
      grace_period_ends_at: new Date(now.getTime() + GRACE_DAYS * 86_400_000).toISOString(),
    })
    .eq("paddle_subscription_id", subscriptionId)
    .is("payment_failed_at", null);
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  staticData: { sitemap: false },
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
            case EventName.TransactionCompleted:
              if (!(event.data as { subscriptionId?: string | null }).subscriptionId) await handleTemplatePurchase(event.data, env);
              break;
            case EventName.TransactionPaymentFailed: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const subId = (event.data as any).subscriptionId as string | undefined;
              if (subId) await startGracePeriod(subId);
              break;
            }
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
