import { Link, useNavigate } from "@tanstack/react-router";
import { HardHat, LogOut, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { STATUS_CLASS, STATUS_LABEL, type Status } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { isTrialActive, trialDaysLeft, usePlan } from "@/lib/plans";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

export function AppShell({ children, action }: { children: ReactNode; action?: ReactNode }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: account } = usePlan(user?.id);
  return (
    <div className="min-h-screen">
      <div className="no-print"><PaymentTestModeBanner /></div>
      <header className="no-print sticky top-0 z-10 border-b bg-ink text-ink-foreground">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <HardHat className="h-5 w-5" />
            </span>
            FieldCO
          </Link>
          <div className="flex items-center gap-2">
            {action}
            <Button variant="ghost" size="sm" asChild className="text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground">
              <Link to="/pricing"><Sparkles className="h-4 w-4" /><span className="hidden sm:inline">Plans</span></Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sign out"
              className="text-ink-foreground opacity-70 hover:bg-ink-foreground/10 hover:text-ink-foreground hover:opacity-100"
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
      {isTrialActive(account) && (
        <div className="no-print border-b bg-secondary">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-2 text-sm">
            <span><strong>Pro trial:</strong> {trialDaysLeft(account)} days left</span>
            <Link to="/pricing" className="shrink-0 font-semibold text-primary hover:underline">Choose a plan</Link>
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
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASS[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
