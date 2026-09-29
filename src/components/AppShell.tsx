import { Link, useNavigate } from "@tanstack/react-router";
import { HardHat, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export function AppShell({ children, action }: { children: ReactNode; action?: ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
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
            <button
              aria-label="Sign out"
              className="rounded-md p-2 opacity-70 hover:opacity-100"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/auth" });
              }}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return null as unknown as ReactNode ?? <span>{status}{label}</span>;
}
