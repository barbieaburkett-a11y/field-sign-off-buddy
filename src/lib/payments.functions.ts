import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const resolvePaddlePrice = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z.object({
      priceId: z.enum(["starter_monthly", "pro_monthly", "unlimited_monthly", "tpl_electrical_once", "tpl_plumbing_hvac_once", "tpl_concrete_framing_once", "tpl_finishes_once", "tpl_bundle_once"]),
      environment: z.enum(["sandbox", "live"]),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const { gatewayFetch } = await import("./paddle.server");
    const response = await gatewayFetch(data.environment, `/prices?external_id=${encodeURIComponent(data.priceId)}`);
    const result = (await response.json()) as { data?: { id: string }[] };
    if (!result.data?.length) throw new Error("Price not found");
    return result.data[0]!.id;
  });

export const getBillingPortalUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("account_plans")
      .select("paddle_customer_id,paddle_subscription_id,billing_environment")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!data?.paddle_customer_id || !data.billing_environment) throw new Error("No billing account found");
    const { getPaddleClient } = await import("./paddle.server");
    const paddle = getPaddleClient(data.billing_environment as "sandbox" | "live");
    const session = await paddle.customerPortalSessions.create(
      data.paddle_customer_id,
      data.paddle_subscription_id ? [data.paddle_subscription_id] : [],
    );
    return session.urls.general.overview;
  });
