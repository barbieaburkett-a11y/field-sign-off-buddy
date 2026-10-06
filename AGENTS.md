<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Billing entitlements live in `public.account_plans`; the browser may create only its own Starter trial and update company display settings, while provider callbacks own subscription fields, preventing client-side plan escalation.
- The hourly /api/public/hooks/payment-retry-reminders job also sends the one-time 24h unsigned-directive reminder; add new periodic emails there instead of new cron jobs to avoid extra schedules.
- Shared visual roles and button treatments are defined in global theme tokens and Button variants; page styling must consume these roles so the public site and field workflows remain consistent.
- MCP: agent tools live in src/lib/mcp/ with Supabase OAuth; RLS runs as the caller via forwarded token.
