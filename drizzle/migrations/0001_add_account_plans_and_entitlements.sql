CREATE TABLE public.account_plans (
  user_id uuid PRIMARY KEY,
  plan text NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter','pro','unlimited')),
  subscription_status text NOT NULL DEFAULT 'trialing' CHECK (subscription_status IN ('trialing','active','past_due','canceled','expired')),
  trial_started_at timestamptz NOT NULL DEFAULT now(),
  trial_ends_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  company_name text,
  company_logo_url text,
  office_pm_email text,
  paddle_customer_id text UNIQUE,
  paddle_subscription_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.account_plans TO authenticated;
GRANT INSERT (user_id) ON public.account_plans TO authenticated;
GRANT UPDATE (company_name, company_logo_url, office_pm_email, updated_at) ON public.account_plans TO authenticated;
GRANT ALL ON public.account_plans TO service_role;
ALTER TABLE public.account_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own account plan" ON public.account_plans FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "create own starter trial" ON public.account_plans FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid()
  AND plan = 'starter'
  AND subscription_status = 'trialing'
  AND trial_started_at <= now()
  AND trial_ends_at > now()
  AND trial_ends_at <= now() + interval '14 days 5 minutes'
  AND paddle_customer_id IS NULL
  AND paddle_subscription_id IS NULL
);
CREATE POLICY "update own company settings" ON public.account_plans FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.enforce_foreman_plan_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  account_plan text;
  account_status text;
  account_trial_end timestamptz;
  foreman_limit integer;
  foreman_count integer;
BEGIN
  IF NEW.foreman_name IS NULL OR btrim(NEW.foreman_name) = '' THEN
    RETURN NEW;
  END IF;

  SELECT plan, subscription_status, trial_ends_at
  INTO account_plan, account_status, account_trial_end
  FROM public.account_plans
  WHERE user_id = NEW.user_id;

  IF account_status = 'trialing' AND account_trial_end > now() THEN
    account_plan := 'pro';
  ELSIF account_status IS DISTINCT FROM 'active' THEN
    account_plan := 'starter';
  END IF;

  foreman_limit := CASE COALESCE(account_plan, 'starter')
    WHEN 'unlimited' THEN NULL
    WHEN 'pro' THEN 10
    ELSE 3
  END;

  IF foreman_limit IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT count(DISTINCT lower(btrim(foreman_name)))
  INTO foreman_count
  FROM public.change_orders
  WHERE user_id = NEW.user_id
    AND foreman_name IS NOT NULL
    AND btrim(foreman_name) <> ''
    AND (TG_OP <> 'UPDATE' OR id <> NEW.id);

  IF NOT EXISTS (
    SELECT 1 FROM public.change_orders
    WHERE user_id = NEW.user_id
      AND foreman_name IS NOT NULL
      AND lower(btrim(foreman_name)) = lower(btrim(NEW.foreman_name))
      AND (TG_OP <> 'UPDATE' OR id <> NEW.id)
  ) AND foreman_count >= foreman_limit THEN
    RAISE EXCEPTION 'Your plan allows up to % foremen. Upgrade to add another.', foreman_limit;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_foreman_plan_limit
BEFORE INSERT OR UPDATE OF foreman_name ON public.change_orders
FOR EACH ROW EXECUTE FUNCTION public.enforce_foreman_plan_limit();