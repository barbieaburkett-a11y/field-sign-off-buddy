import { Link } from "@tanstack/react-router";
import { HardHat } from "lucide-react";
import type { ReactNode } from "react";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-ink text-ink-foreground">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <HardHat className="h-5 w-5" />
            </span>
            FieldCO
          </Link>
          <Link to="/pricing" className="text-sm font-semibold hover:underline">Plans & pricing</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Last updated: {updated}</p>
        <div className="mt-6 space-y-6 text-sm leading-relaxed [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:text-primary [&_a]:underline">
          {children}
        </div>
      </main>
      <LegalFooter />
    </div>
  );
}

export function LegalFooter() {
  return (
    <footer className="no-print border-t">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-8 font-mono text-xs text-muted-foreground sm:px-8">
        <span>© {new Date().getFullYear()} The Command Suite</span>
        <nav className="flex flex-wrap gap-4">
          <Link to="/terms" className="hover:text-foreground hover:underline">Terms of Service</Link>
          <Link to="/privacy" className="hover:text-foreground hover:underline">Privacy Policy</Link>
          <Link to="/refunds" className="hover:text-foreground hover:underline">Refund Policy</Link>
          <a href="mailto:hello@thecommandsuite.com" className="hover:text-foreground hover:underline">Support: hello@thecommandsuite.com</a>
        </nav>
      </div>
    </footer>
  );
}
