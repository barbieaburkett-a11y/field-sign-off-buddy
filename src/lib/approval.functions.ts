import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const tokenSchema = z.object({ token: z.string().regex(/^[a-f0-9]{20,64}$/) });

export const getApproval = createServerFn({ method: "GET" })
  .inputValidator((d) => tokenSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: co } = await supabaseAdmin
      .from("change_orders")
      .select(
        "user_id,number,title,description,amount,photos,status,foreman_name,signer_name,signer_title,signature,signed_at,sent_at,created_at,reject_reason,jobs(name,gc_name,address)",
      )
      .eq("share_token", data.token)
      .maybeSingle();
    if (!co) return null;
    let photoUrls: string[] = [];
    if (co.photos.length) {
      const { data: s } = await supabaseAdmin.storage
        .from("co-photos")
        .createSignedUrls(co.photos, 3600);
      photoUrls = (s ?? []).map((x) => x.signedUrl ?? "");
    }
    const { data: account } = await supabaseAdmin
      .from("account_plans")
      .select("plan,subscription_status,trial_ends_at,company_name,company_logo_url")
      .eq("user_id", co.user_id)
      .maybeSingle();
    const trialActive = account?.subscription_status === "trialing" && new Date(account.trial_ends_at).getTime() > Date.now();
    const canBrand = trialActive || (account?.subscription_status === "active" && (account.plan === "pro" || account.plan === "unlimited"));
    const { photos: _p, user_id: _u, ...rest } = co;
    return { ...rest, photoUrls, companyName: canBrand ? account?.company_name : null, companyLogoUrl: canBrand ? account?.company_logo_url : null };
  });

export const submitApproval = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    tokenSchema
      .extend({
        decision: z.enum(["approved", "rejected"]),
        signerName: z.string().trim().min(1).max(120),
        signerTitle: z.string().trim().max(120).optional(),
        signature: z.string().startsWith("data:image/png;base64,").max(400_000).optional(),
        reason: z.string().trim().max(1000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.decision === "approved" && !data.signature) throw new Error("Signature required");
    const { data: row, error } = await supabaseAdmin
      .from("change_orders")
      .update({
        status: data.decision,
        signer_name: data.signerName,
        signer_title: data.signerTitle ?? null,
        signature: data.decision === "approved" ? (data.signature ?? null) : null,
        reject_reason: data.decision === "rejected" ? (data.reason ?? null) : null,
        signed_method: "remote",
        signed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("share_token", data.token)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("This change directive is no longer awaiting approval.");
    return { ok: true };
  });
