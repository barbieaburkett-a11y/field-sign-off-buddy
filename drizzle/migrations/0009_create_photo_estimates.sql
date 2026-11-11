-- Photo Estimate (Phase 1): field-first estimates that start from photos and typed
-- measurements, priced from the contractor's own line-item library, gated by a
-- human-confirm rule (every drafted line stays 'verify' until confirmed).
-- Photos reuse the existing 'co-photos' storage bucket and its policies
-- (paths are `${auth.uid()}/${uuid}.${ext}`, same as change_orders.photos).

CREATE TABLE public.estimate_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  sample_key text,
  description text NOT NULL,
  unit text NOT NULL DEFAULT 'EA',
  labor numeric NOT NULL DEFAULT 0,
  material numeric NOT NULL DEFAULT 0,
  equipment numeric NOT NULL DEFAULT 0,
  is_sample boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX estimate_items_user_sample_key ON public.estimate_items(user_id, sample_key) WHERE sample_key IS NOT NULL;
CREATE INDEX estimate_items_user_idx ON public.estimate_items(user_id, active, description);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estimate_items TO authenticated;
GRANT ALL ON public.estimate_items TO service_role;
ALTER TABLE public.estimate_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own estimate items" ON public.estimate_items FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "insert own estimate items when subscribed" ON public.estimate_items FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND public.account_can_write(auth.uid()));
CREATE POLICY "update own estimate items when subscribed" ON public.estimate_items FOR UPDATE TO authenticated USING (user_id = auth.uid() AND public.account_can_write(auth.uid())) WITH CHECK (user_id = auth.uid() AND public.account_can_write(auth.uid()));
CREATE POLICY "delete own estimate items when subscribed" ON public.estimate_items FOR DELETE TO authenticated USING (user_id = auth.uid() AND public.account_can_write(auth.uid()));

CREATE TABLE public.estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  client_name text,
  number serial,
  title text NOT NULL DEFAULT 'Photo estimate',
  site_notes text NOT NULL DEFAULT '',
  photos text[] NOT NULL DEFAULT '{}',
  measure jsonb NOT NULL DEFAULT '{}'::jsonb,
  overhead_percent numeric NOT NULL DEFAULT 10,
  markup_percent numeric NOT NULL DEFAULT 20,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved')),
  source text NOT NULL DEFAULT 'fieldco-photo',
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX estimates_user_idx ON public.estimates(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estimates TO authenticated;
GRANT ALL ON public.estimates TO service_role;
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own estimates" ON public.estimates FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "insert own estimates when subscribed" ON public.estimates FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND public.account_can_write(auth.uid()));
CREATE POLICY "update own estimates when subscribed" ON public.estimates FOR UPDATE TO authenticated USING (user_id = auth.uid() AND public.account_can_write(auth.uid())) WITH CHECK (user_id = auth.uid() AND public.account_can_write(auth.uid()));
CREATE POLICY "delete own estimates when subscribed" ON public.estimates FOR DELETE TO authenticated USING (user_id = auth.uid() AND public.account_can_write(auth.uid()));

CREATE TABLE public.estimate_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id uuid NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  item_id uuid REFERENCES public.estimate_items(id) ON DELETE SET NULL,
  description text NOT NULL,
  unit text NOT NULL DEFAULT 'EA',
  quantity numeric NOT NULL DEFAULT 1,
  labor numeric NOT NULL DEFAULT 0,
  material numeric NOT NULL DEFAULT 0,
  equipment numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'verify' CHECK (status IN ('verify', 'confirmed')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX estimate_lines_estimate_idx ON public.estimate_lines(estimate_id, sort_order);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estimate_lines TO authenticated;
GRANT ALL ON public.estimate_lines TO service_role;
ALTER TABLE public.estimate_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own estimate lines" ON public.estimate_lines FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "insert own estimate lines when subscribed" ON public.estimate_lines FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND public.account_can_write(auth.uid()));
CREATE POLICY "update own estimate lines when subscribed" ON public.estimate_lines FOR UPDATE TO authenticated USING (user_id = auth.uid() AND public.account_can_write(auth.uid())) WITH CHECK (user_id = auth.uid() AND public.account_can_write(auth.uid()));
CREATE POLICY "delete own estimate lines when subscribed" ON public.estimate_lines FOR DELETE TO authenticated USING (user_id = auth.uid() AND public.account_can_write(auth.uid()));
