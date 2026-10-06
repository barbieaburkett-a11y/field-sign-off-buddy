import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Packs bought with the signed-in account's email (purchases are keyed by checkout email).
export const getMyPacks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: u } = await context.supabase.auth.getUser();
    const email = u.user?.email;
    if (!email || !u.user?.email_confirmed_at) return { packs: [] as string[], email: email ?? null };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const safe = email.replace(/[\\%_]/g, (m) => "\\" + m);
    const { data } = await supabaseAdmin.from("template_purchases").select("packs").ilike("email", safe);
    const packs = Array.from(new Set((data ?? []).flatMap((r) => r.packs)));
    return { packs, email };
  });
