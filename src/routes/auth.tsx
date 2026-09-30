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
import { LegalFooter } from "@/components/LegalPage";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { plan?: "starter" | "pro" | "unlimited" } => {
    const p = search["plan"];
    return p === "starter" || p === "pro" || p === "unlimited" ? { plan: p } : {};
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
  const { plan } = Route.useSearch();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (plan) sessionStorage.setItem("fieldco.pendingPlan", plan);
  }, [plan]);

  useEffect(() => {
    if (session) navigate({ to: "/" });
  }, [session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    if (mode === "up") toast.success("Check your email to confirm your account.");
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error(r.error.message ?? "Google sign-in failed");
  };

  return (
    <div className="flex min-h-screen flex-col bg-ink text-ink-foreground">
      <div className="flex flex-1 flex-col justify-center px-6 py-10">
        <div className="mx-auto w-full max-w-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HardHat className="h-7 w-7" />
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight">
            Get the extra work <span className="text-primary">signed</span> before you build it.
          </h1>
          <p className="mt-3 text-sm opacity-70">Photos, scope, price, signature. Done in the field in two minutes.</p>
          {plan && (
            <p className="mt-4 rounded-md border-l-4 border-sage bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground">
              You picked the {plan === "pro" ? "Pro" : plan === "unlimited" ? "Unlimited" : "Starter"} plan — create your account to continue.
            </p>
          )}
          <div className="mt-8 rounded-xl bg-card p-5 text-card-foreground">
            <Button variant="outline" className="h-11 w-full" onClick={google}>
              Continue with Google
            </Button>
            <div className="my-4 text-center text-xs text-muted-foreground">or</div>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
              </div>
              <div>
                <Label htmlFor="pw">Password</Label>
                <Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11" />
              </div>
              <Button type="submit" className="h-11 w-full" disabled={busy}>
                {mode === "in" ? "Sign in" : "Create account"}
              </Button>
            </form>
            <button className="mt-4 w-full text-center text-sm text-muted-foreground" onClick={() => setMode(mode === "in" ? "up" : "in")}>
              {mode === "in" ? "New here? Create an account" : "Have an account? Sign in"}
            </button>
            <Link to="/pricing" className="mt-2 block text-center text-sm font-semibold text-primary hover:underline">View plans & pricing</Link>
          </div>
        </div>
      </div>
      <LegalFooter />
    </div>
  );
}
