ALTER TABLE public.change_orders ADD COLUMN IF NOT EXISTS schedule_impact_days integer CHECK (schedule_impact_days IS NULL OR schedule_impact_days BETWEEN 0 AND 3650);
ALTER TABLE public.change_orders ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1;

CREATE OR REPLACE FUNCTION public.account_can_write(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.account_plans a WHERE a.user_id = _uid AND (
      (a.subscription_status = 'trialing' AND a.trial_ends_at > now())
      OR a.subscription_status = 'active'
      OR (a.subscription_status = 'past_due' AND a.grace_period_ends_at > now())
    )
  )
$$;
REVOKE ALL ON FUNCTION public.account_can_write(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.account_can_write(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "own cos" ON public.change_orders;
CREATE POLICY "read own cos" ON public.change_orders FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "insert own cos when subscribed" ON public.change_orders FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND public.account_can_write(auth.uid()));
CREATE POLICY "update own cos when subscribed" ON public.change_orders FOR UPDATE TO authenticated USING (user_id = auth.uid() AND public.account_can_write(auth.uid())) WITH CHECK (user_id = auth.uid() AND public.account_can_write(auth.uid()));
CREATE POLICY "delete own cos when subscribed" ON public.change_orders FOR DELETE TO authenticated USING (user_id = auth.uid() AND public.account_can_write(auth.uid()));

DROP POLICY IF EXISTS "own jobs" ON public.jobs;
CREATE POLICY "read own jobs" ON public.jobs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "insert own jobs when subscribed" ON public.jobs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND public.account_can_write(auth.uid()));
CREATE POLICY "update own jobs when subscribed" ON public.jobs FOR UPDATE TO authenticated USING (user_id = auth.uid() AND public.account_can_write(auth.uid())) WITH CHECK (user_id = auth.uid() AND public.account_can_write(auth.uid()));
CREATE POLICY "delete own jobs when subscribed" ON public.jobs FOR DELETE TO authenticated USING (user_id = auth.uid() AND public.account_can_write(auth.uid()));