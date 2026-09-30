import { useState } from "react";
import { Check, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PLANS, type PlanId } from "@/lib/plans";
import { useAuth } from "@/lib/auth";
import { openPlanCheckout } from "@/lib/paddle";

export function UpgradeDialog({ open, onOpenChange, recommended = "pro", reason }: { open: boolean; onOpenChange: (open: boolean) => void; recommended?: PlanId; reason?: string }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState<PlanId | null>(null);
  const choose = async (plan: PlanId) => {
    if (!user) { toast.error("Please sign in first."); return; }
    setBusy(plan);
    try {
      onOpenChange(false);
      await openPlanCheckout(plan, { id: user.id, email: user.email });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Checkout could not open");
    } finally {
      setBusy(null);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-0">
        <DialogHeader className="border-b bg-secondary px-6 py-5 text-left">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground"><LockKeyhole className="h-4 w-4" /></div>
          <DialogTitle className="pt-2 font-display text-2xl">Choose the protection your crew needs</DialogTitle>
          <DialogDescription>{reason ?? "Start with 14 days of Pro access, then choose the right fit."}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-6">
          {PLANS.map((plan) => (
            <section key={plan.id} className={`border p-4 ${plan.id === recommended ? "border-primary bg-accent" : "bg-card"}`}>
              {plan.id === recommended && <p className="mb-2 text-xs font-bold uppercase text-primary">Best fit</p>}
              <h3 className="font-display text-xl font-bold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.foremen}</p>
              <p className="mt-4"><span className="font-display text-3xl font-bold">${plan.price}</span><span className="text-sm text-muted-foreground">/month</span></p>
              <ul className="my-4 space-y-2 text-sm">
                {plan.features.map((feature) => <li key={feature} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />{feature}</li>)}
              </ul>
              <Button className="w-full" disabled={busy !== null} variant={plan.id === recommended ? "default" : "outline"} onClick={() => choose(plan.id)}>{busy === plan.id ? "Opening…" : `Choose ${plan.name}`}</Button>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
