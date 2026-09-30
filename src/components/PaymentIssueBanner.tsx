import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { getBillingPortalUrl } from "@/lib/payments.functions";
import { graceDaysLeft, isInGracePeriod, type AccountPlan } from "@/lib/plans";

export function PaymentIssueBanner({ account }: { account?: AccountPlan | null }) {
  const getPortal = useServerFn(getBillingPortalUrl);
  const [busy, setBusy] = useState(false);
  if (account?.subscription_status !== "past_due") return null;
  const inGrace = isInGracePeriod(account);
  const days = graceDaysLeft(account);

  async function openPortal() {
    const tab = window.open("", "_blank");
    setBusy(true);
    try {
      const url = await getPortal();
      if (tab) tab.location.href = url; else window.location.href = url;
    } catch {
      tab?.close();
      toast.error("Couldn't open billing. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div role="alert" className="no-print border-b border-destructive/30 bg-destructive/10">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-2 text-sm">
        <span className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          {inGrace ? (
            <span><strong>Payment failed.</strong> Your plan stays active for {days} more {days === 1 ? "day" : "days"} — update your card to avoid losing features.</span>
          ) : (
            <span><strong>Payment still failing.</strong> Paid features are paused until your card is updated.</span>
          )}
        </span>
        <button onClick={openPortal} disabled={busy} className="shrink-0 font-semibold text-destructive hover:underline disabled:opacity-60">
          {busy ? "Opening…" : "Update payment"}
        </button>
      </div>
    </div>
  );
}
