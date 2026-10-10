import { Link, useNavigate } from "@tanstack/react-router";
import { HardHat, LogOut, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { STATUS_CLASS, STATUS_LABEL, type Status } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { isTrialActive, isTrialExpired, canWrite, trialDaysLeft, usePlan } from "@/lib/plans";
import { PaymentIssueBanner } from "@/components/PaymentIssueBanner";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { LegalFooter } from "@/components/LegalPage";

export function AppShell({ children, action }: { children: ReactNode; action?: ReactNode }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: account } = usePlan(user?.id);
  return (
    <div className="min-h-screen">
      <div className="no-print"><PaymentTestModeBanner /></div>
      <header className="no-print sticky top-0 z-10 border-b bg-background text-foreground">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-mono text-lg font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <HardHat className="h-5 w-5" />
            </span>
            FieldCO
          </Link>
          <div className="flex items-center gap-2">
            {action}
            <Button variant="ghost" size="sm" asChild>
              <Link to="/pricing"><Sparkles className="h-4 w-4" /><span className="hidden sm:inline">Plans</span></Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sign out"
              className="text-muted-foreground hover:text-foreground"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/auth" });
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <PaymentIssueBanner account={account} />
      {isTrialActive(account) && (
        <div className="no-print border-b bg-secondary">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-2 text-sm">
            <span><strong>Pro trial:</strong> {trialDaysLeft(account)} days left</span>
            <Link to="/pricing" className="shrink-0 font-semibold text-primary hover:underline">Choose a plan</Link>
          </div>
        </div>
      )}
      {account && !canWrite(account) && !account.payment_failed_at && (
        <div className="no-print border-b bg-accent">
          <div className="mx-auto max-w-3xl px-4 py-4 text-sm text-accent-foreground">
            <p className="font-semibold">{isTrialExpired(account) ? "Your free trial has ended." : "Your subscription has ended."} Your existing records are safe and available to view and export. Choose a plan to create new directives and request approvals.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" asChild><Link to="/pricing">Choose a plan</Link></Button>
              <Button size="sm" variant="outline" asChild><Link to="/">View existing records</Link></Button>
            </div>
          </div>
        </div>
      )}
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
      <LegalFooter />
    </div>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center rounded-sm border border-current px-2.5 py-1 font-mono text-xs font-semibold ${STATUS_CLASS[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
