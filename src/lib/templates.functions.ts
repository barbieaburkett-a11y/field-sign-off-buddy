import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Public lookups: a buyer's secret access token (or the checkout transaction id
// right after paying) is the only key. Returns just what the page needs.
export const getTemplateAccess = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ token: z.string().regex(/^[a-f0-9]{48}$/) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("template_purchases").select("packs").eq("access_token", data.token).maybeSingle();
    return row ? { packs: row.packs } : null;
  });

export const getTokenForTransaction = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ txn: z.string().regex(/^txn_[a-z0-9]+$/) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("template_purchases").select("access_token,created_at").eq("paddle_transaction_id", data.txn).maybeSingle();
    // Only hand out the token shortly after checkout; afterwards use the emailed link.
    if (!row || Date.now() - new Date(row.created_at).getTime() > 2 * 3600_000) return null;
    return row.access_token;
  });
