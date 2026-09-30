import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Minus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { UpgradeDialog } from "@/components/UpgradeDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { HardHat } from "lucide-react";
import type { ReactNode } from "react";
import { effectivePlan, hasPaidPlan, isTrialActive, PLANS, trialDaysLeft, usePlan, type PlanId } from "@/lib/plans";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Plans & Pricing — FieldCO" },
      { name: "description", content: "Choose FieldCO protection for small crews, growing teams, or multi-crew contractors." },
      { property: "og:title", content: "Plans & Pricing — FieldCO" },
      { property: "og:description", content: "Simple monthly plans for field change-order protection." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

const rows = [
  ["Foremen", "1–3", "Up to 10", "Unlimited"],
  ["Change directives", "Unlimited", "Unlimited", "Unlimited"],
  ["On-screen signing", true, true, true],
  ["PDF exports", true, true, true],
  ["SMS approval routing", false, true, true],
  ["Custom packet logo", false, true, true],
  ["Automatic office PM CC", false, true, true],
  ["Jobs", "—", "—", "Unlimited"],
] as const;

function PricingPage() {
  const { user, loading } = useAuth();
  const { data: account, refetch } = usePlan(user?.id);
  const navigate = useNavigate();
  const [upgrade, setUpgrade] = useState<PlanId | null>(null);
  const [companyName, setCompanyName] = useState(account?.company_name ?? "");
  const [logoUrl, setLogoUrl] = useState(account?.company_logo_url ?? "");
  const [officeEmail, setOfficeEmail] = useState(account?.office_pm_email ?? "");
  const plan = effectivePlan(account);
  const canBrand = plan === "pro" || plan === "unlimited";

  useEffect(() => {
    if (!account) return;
    setCompanyName(account.company_name ?? "");
    setLogoUrl(account.company_logo_url ?? "");
    setOfficeEmail(account.office_pm_email ?? "");
  }, [account]);

  if (loading) return null;
  const Shell = user ? AppShell : PublicShell;

  const saveSettings = async () => {
    if (!user) return;
    const { error } = await supabase.from("account_plans").update({ company_name: companyName || null, company_logo_url: logoUrl || null, office_pm_email: officeEmail || null, updated_at: new Date().toISOString() }).eq("user_id", user.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Packet and office settings saved");
    refetch();
  };

  return (
    <Shell>
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-primary">Plans & billing</p>
          <h1 className="mt-1 text-3xl font-bold">Keep every extra protected.</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">Straightforward monthly pricing for crews that need signed backup before the work starts.</p>
        </div>
        {user && <Button variant="outline" asChild><Link to="/">Back</Link></Button>}
      </div>

      {isTrialActive(account) && (
        <div className="mb-6 border-l-4 border-sage bg-secondary p-4">
          <p className="font-semibold">Your Pro trial has {trialDaysLeft(account)} days left.</p>
          <p className="text-sm text-muted-foreground">All Pro features stay open during your 14-day trial.</p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {PLANS.map((item) => {
          const current = hasPaidPlan(account) && account?.plan === item.id;
          return (
            <section key={item.id} className={`border bg-card p-5 ${item.id === "pro" ? "border-primary shadow-sm" : ""}`}>
              {item.id === "pro" && <p className="mb-3 text-xs font-bold uppercase text-primary">Most popular</p>}
              <h2 className="text-2xl font-bold">{item.name}</h2>
              <p className="mt-2 min-h-10 text-sm text-muted-foreground">{item.summary}</p>
              <p className="mt-5"><span className="font-display text-4xl font-bold">${item.price}</span><span className="text-sm text-muted-foreground"> / month</span></p>
              <p className="mt-2 text-sm font-semibold">{item.foremen}</p>
              <ul className="my-5 space-y-2 text-sm">
                {item.features.map((feature) => <li key={feature} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />{feature}</li>)}
              </ul>
              <Button className="w-full" variant={current ? "secondary" : item.id === "pro" ? "default" : "outline"} disabled={current} onClick={() => user ? setUpgrade(item.id) : navigate({ to: "/auth", search: { plan: item.id } })}>{current ? "Current plan" : `Choose ${item.name}`}</Button>
            </section>
          );
        })}
      </div>

      <section className="mt-10 overflow-hidden border bg-card">
        <div className="border-b bg-secondary p-5"><h2 className="text-xl font-bold">Compare every feature</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead><tr className="border-b"><th className="p-4 text-left">Feature</th>{PLANS.map((item) => <th key={item.id} className="p-4 text-center">{item.name}</th>)}</tr></thead>
            <tbody>{rows.map(([label, ...values]) => <tr key={label} className="border-b last:border-0"><td className="p-4 font-medium">{label}</td>{values.map((value, index) => <td key={`${label}-${index}`} className="p-4 text-center">{typeof value === "boolean" ? value ? <Check className="mx-auto h-4 w-4 text-success" /> : <Minus className="mx-auto h-4 w-4 text-muted-foreground" /> : value}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </section>

      {user && <section className="mt-10 border-t pt-8">
        <h2 className="text-xl font-bold">Signed packet & office delivery</h2>
        <p className="mt-1 text-sm text-muted-foreground">Available on Pro and Unlimited.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="company">Company name</Label><Input id="company" className="mt-1 h-11" disabled={!canBrand} value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></div>
          <div><Label htmlFor="logo">Company logo image URL</Label><Input id="logo" type="url" className="mt-1 h-11" disabled={!canBrand} value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} /></div>
          <div className="sm:col-span-2"><Label htmlFor="office">Office PM email</Label><Input id="office" type="email" className="mt-1 h-11" disabled={!canBrand} value={officeEmail} onChange={(e) => setOfficeEmail(e.target.value)} /></div>
        </div>
        <Button className="mt-4" disabled={!canBrand} onClick={saveSettings}>Save settings</Button>
      </section>}
      <UpgradeDialog open={upgrade !== null} onOpenChange={(open) => !open && setUpgrade(null)} recommended={upgrade ?? "pro"} />
    </Shell>
  );
}
function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-ink text-ink-foreground">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link to="/pricing" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground"><HardHat className="h-5 w-5" /></span>
            FieldCO
          </Link>
          <Button size="sm" asChild><Link to="/auth">Start free trial</Link></Button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}
