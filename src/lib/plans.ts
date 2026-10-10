import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PlanId = "starter" | "pro" | "unlimited";
export type PlanFeature = "onsite_signing" | "pdf_exports" | "sms_routing" | "custom_logo" | "office_cc" | "unlimited_jobs";

export const PLANS = [
  {
    id: "starter" as const,
    name: "Starter",
    price: 49,
    summary: "For small field teams protecting every extra.",
    foremen: "Up to 3 foremen",
    features: ["Unlimited change directives", "On-screen signing", "PDF exports"],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: 99,
    summary: "For growing crews that route approvals back to the office.",
    foremen: "Up to 10 foremen",
    features: ["Everything in Starter", "SMS approval routing", "Custom logo on packets", "Automatic office PM email CC"],
  },
  {
    id: "unlimited" as const,
    name: "Unlimited",
    price: 199,
    summary: "For multi-crew contractors working across many jobs.",
    foremen: "Unlimited foremen",
    features: ["Everything in Pro", "Unlimited foremen"],
  },
];

export type AccountPlan = {
  user_id: string;
  plan: PlanId;
  subscription_status: string;
  trial_started_at: string;
  trial_ends_at: string;
  company_name: string | null;
  company_logo_url: string | null;
  office_pm_email: string | null;
  billing_environment: "sandbox" | "live" | null;
  payment_failed_at: string | null;
  grace_period_ends_at: string | null;
  next_payment_retry_at: string | null;
};

const PLAN_COLUMNS = "user_id,plan,subscription_status,trial_started_at,trial_ends_at,company_name,company_logo_url,office_pm_email,billing_environment,payment_failed_at,grace_period_ends_at,next_payment_retry_at";

function currentBillingEnv() {
  const token = import.meta.env['VITE_PAYMENTS_CLIENT_TOKEN'] as string | undefined;
  return token?.startsWith("test_") ? "sandbox" : "live";
}

export function usePlan(userId?: string) {
  return useQuery({
    queryKey: ["account-plan", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase.from("account_plans").select(PLAN_COLUMNS).eq("user_id", userId ?? "").maybeSingle();
      if (error) throw error;
      if (data) return data as AccountPlan;
      const { data: created, error: createError } = await supabase.from("account_plans").insert({ user_id: userId ?? "" }).select(PLAN_COLUMNS).single();
      if (createError) throw createError;
      return created as AccountPlan;
    },
  });
}

export function isTrialActive(account?: AccountPlan | null) {
  return Boolean(account?.subscription_status === "trialing" && new Date(account.trial_ends_at).getTime() > Date.now());
}

export function hasPaidPlan(account?: AccountPlan | null) {
  if (!account || account.billing_environment !== currentBillingEnv()) return false;
  if (account.subscription_status === "active") return true;
  return isInGracePeriod(account);
}

export function isInGracePeriod(account?: AccountPlan | null) {
  return Boolean(
    account?.subscription_status === "past_due" &&
    account.grace_period_ends_at &&
    new Date(account.grace_period_ends_at).getTime() > Date.now(),
  );
}

export function graceDaysLeft(account?: AccountPlan | null) {
  if (!isInGracePeriod(account)) return 0;
  return Math.max(1, Math.ceil((new Date(account?.grace_period_ends_at ?? 0).getTime() - Date.now()) / 86_400_000));
}

export function effectivePlan(account?: AccountPlan | null): PlanId {
  if (hasPaidPlan(account)) return account!.plan;
  if (isTrialActive(account)) return "pro";
  return "starter";
}

export function hasFeature(account: AccountPlan | null | undefined, feature: PlanFeature) {
  const plan = effectivePlan(account);
  if (feature === "onsite_signing" || feature === "pdf_exports") return true;
  if (feature === "unlimited_jobs") return plan === "unlimited";
  return plan === "pro" || plan === "unlimited";
}

export function trialDaysLeft(account?: AccountPlan | null) {
  if (!isTrialActive(account)) return 0;
  return Math.max(1, Math.ceil((new Date(account?.trial_ends_at ?? 0).getTime() - Date.now()) / 86_400_000));
}
