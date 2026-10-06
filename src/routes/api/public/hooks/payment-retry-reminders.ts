import { createFileRoute } from "@tanstack/react-router";

// Hourly job: email account owners one day before Paddle's next payment retry.
// Idempotent: retry_reminder_sent_for records which retry date was already reminded.
export const Route = createFileRoute("/api/public/hooks/payment-retry-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
        if (!expected || request.headers.get("apikey") !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");

        const now = new Date();
        const in24h = new Date(now.getTime() + 24 * 3600 * 1000);
        const { data: rows, error } = await supabaseAdmin
          .from("account_plans")
          .select("user_id, company_name, next_payment_retry_at, grace_period_ends_at, retry_reminder_sent_for")
          .eq("subscription_status", "past_due")
          .gt("next_payment_retry_at", now.toISOString())
          .lte("next_payment_retry_at", in24h.toISOString());
        if (error) {
          console.error("retry reminders query failed", error);
          return Response.json({ ok: false, error: error.message }, { status: 500 });
        }

        const fmt = (s: string | null) =>
          s ? new Date(s).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : undefined;
        let sent = 0;
        for (const row of rows ?? []) {
          if (!row.next_payment_retry_at) continue;
          if (row.retry_reminder_sent_for && new Date(row.retry_reminder_sent_for).getTime() === new Date(row.next_payment_retry_at).getTime()) continue;
          const { data: u } = await supabaseAdmin.auth.admin.getUserById(row.user_id);
          const email = u?.user?.email;
          if (!email) continue;
          try {
            const result = await sendTemplateEmail("payment-retry-reminder", email, {
              templateData: {
                companyName: row.company_name ?? undefined,
                retryDate: fmt(row.next_payment_retry_at),
                graceEndDate: fmt(row.grace_period_ends_at),
                billingUrl: "https://approvefield.app/pricing",
              },
              idempotencyKey: `retry-reminder-${row.user_id}-${row.next_payment_retry_at}`,
            });
            if (result.sent) sent++;
            await supabaseAdmin
              .from("account_plans")
              .update({ retry_reminder_sent_for: row.next_payment_retry_at })
              .eq("user_id", row.user_id);
          } catch (e) {
            console.error("retry reminder send failed", row.user_id, e);
          }
        }
        // Same hourly run: remind subs about directives unsigned 24h after sending (one reminder each).
        let approvalSent = 0;
        const dayAgo = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();
        const { data: stale } = await supabaseAdmin
          .from("change_orders")
          .select("id, user_id, number, title, amount, jobs(name)")
          .eq("status", "pending")
          .is("approval_reminder_sent_at", null)
          .lte("sent_at", dayAgo)
          .limit(100);
        for (const co of stale ?? []) {
          const { data: u } = await supabaseAdmin.auth.admin.getUserById(co.user_id);
          const email = u?.user?.email;
          if (!email) continue;
          try {
            const result = await sendTemplateEmail("approval-reminder", email, {
              templateData: {
                number: `CD-${String(co.number).padStart(4, "0")}`,
                title: co.title,
                jobName: (co.jobs as { name?: string } | null)?.name,
                amount: Number(co.amount).toLocaleString("en-US", { style: "currency", currency: "USD" }),
                detailUrl: `https://approvefield.app/co/${co.id}`,
              },
              idempotencyKey: `approval-reminder-${co.id}`,
            });
            if (result.sent) approvalSent++;
            await supabaseAdmin.from("change_orders").update({ approval_reminder_sent_at: new Date().toISOString() }).eq("id", co.id);
          } catch (e) {
            console.error("approval reminder send failed", co.id, e);
          }
        }
        return Response.json({ ok: true, candidates: rows?.length ?? 0, sent, approvalSent });
      },
    },
  },
});
