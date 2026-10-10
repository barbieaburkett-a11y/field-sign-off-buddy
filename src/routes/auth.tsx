import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HardHat } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PLANS } from "@/lib/plans";
import { LegalFooter } from "@/components/LegalPage";

export const Route = createFileRoute("/auth")({
  staticData: { sitemap: true },
  validateSearch: (search: Record<string, unknown>): { plan?: "starter" | "pro" | "unlimited"; next?: string; mode?: "signup" | "signin" } => {
    const p = search["plan"];
    const m = search["mode"];
    const n = search["next"];
    const next = typeof n === "string" && n.startsWith("/") && !n.startsWith("//") ? n : undefined;
    return { ...(m === "signup" || m === "signin" ? { mode: m } : {}), ...(p === "starter" || p === "pro" || p === "unlimited" ? { plan: p } : {}), ...(next ? { next } : {}) };
  },
  head: () => ({
    meta: [
      { title: "Sign in — FieldCO" },
      { name: "description", content: "Sign in to capture and track field change directives." },
      { property: "og:title", content: "Sign in — FieldCO" },
      { property: "og:description", content: "Sign in to capture and track field change directives." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { plan, next, mode: initialMode } = Route.useSearch();
  const returnUrl = () => window.location.origin + (next ?? "");
  const [mode, setMode] = useState<"in" | "up" | "reset">(initialMode === "signin" ? "in" : plan || initialMode === "signup" ? "up" : "in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (plan) sessionStorage.setItem("fieldco.pendingPlan", plan);
  }, [plan]);

  useEffect(() => {
    if (session) { if (next) window.location.href = next; else navigate({ to: "/" }); }
  }, [session, navigate, next]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
      setBusy(false);
      if (error) { toast.error(error.message); return; }
      toast.success("If that email has an account, a reset link is on its way.");
      setMode("in");
      return;
    }
    const { error } =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: returnUrl() } });
    setBusy(false);
    if (error) {
      const msg = /invalid login/i.test(error.message) ? "That email and password don't match. Try again or reset your password." : /already registered/i.test(error.message) ? "That email already has an account — sign in instead." : error.message;
      toast.error(msg);
      return;
    }
    if (mode === "up") toast.success("Check your email to confirm your account.");
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: returnUrl() });
    if (r.error) toast.error(r.error.message ?? "Google sign-in failed");
  };

  return (
    <div className="flex min-h-screen flex-col bg-ink text-ink-foreground">
      <div className="flex flex-1 flex-col justify-center px-6 py-10">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" aria-label="FieldCO home" className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HardHat className="h-7 w-7" />
          </Link>
                    <h1 className="mt-6 text-4xl font-extrabold leading-tight">
            Get the extra work <span className="text-primary">signed</span> before you build it.
          </h1>
          <p className="mt-3 text-sm opacity-70">Photos, scope, price and the GC's signature — captured on your phone.</p>
          {mode === "up" && (
            <div className="mt-4 rounded-md border-l-4 border-sage bg-secondary px-3 py-3 text-sm text-secondary-foreground">
              {plan && <p className="font-semibold">You picked {PLANS.find((x) => x.id === plan)!.name} — ${PLANS.find((x) => x.id === plan)!.price}/month once you choose it at checkout.</p>}
              <p className={plan ? "mt-1" : "font-semibold"}>Try all Pro features free for 14 days. No payment details required.</p>
              <p className="mt-1 opacity-80">Nothing is charged unless you choose a paid plan and complete checkout. After 14 days, choose a plan to keep creating directives; existing records stay viewable and exportable.</p>
            </div>
          )}
          <div className="mt-8 rounded-xl bg-card p-5 text-card-foreground">
            <h2 className="mb-4 text-lg font-bold">{mode === "up" ? "Create your account" : mode === "in" ? "Sign in" : "Reset your password"}</h2>
            {mode !== "reset" && <>
            <Button variant="outline" className="h-11 w-full" onClick={google}>
              Continue with Google
            </Button>
            <div className="my-4 text-center text-xs text-muted-foreground">or</div></>}
            <form onSubmit={submit} className="space-y-3">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
              </div>
              {mode !== "reset" && <div>
                <Label htmlFor="pw">Password</Label>
                <Input id="pw" type="password" autoComplete={mode === "up" ? "new-password" : "current-password"} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11" />
                {mode === "up" && <p className="mt-1 text-xs text-muted-foreground">At least 6 characters.</p>}
              </div>}
              <Button type="submit" className="h-11 w-full" disabled={busy}>
                {busy ? "Working…" : mode === "in" ? "Sign in" : mode === "up" ? "Start 14-day free trial" : "Send reset link"}
              </Button>
            </form>
            {mode === "in" && <button type="button" className="mt-3 w-full text-center text-sm text-muted-foreground underline" onClick={() => setMode("reset")}>Forgot your password?</button>}
            <button type="button" className="mt-4 w-full text-center text-sm font-semibold text-foreground underline underline-offset-4" onClick={() => setMode(mode === "up" ? "in" : "up")}>
              {mode === "up" ? "Already have an account? Sign in" : "New here? Start a free trial"}
            </button>
            <Link to="/pricing" className="mt-2 block text-center text-sm font-semibold text-primary hover:underline">View plans & pricing</Link>
          </div>
        </div>
      </div>
      <LegalFooter />
    </div>
  );
}
