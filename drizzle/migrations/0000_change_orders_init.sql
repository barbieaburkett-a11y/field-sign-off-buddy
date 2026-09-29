CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  gc_name text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own jobs" ON public.jobs FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.change_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  number serial,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  amount numeric(12,2) NOT NULL DEFAULT 0,
  photos text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending','approved','rejected')),
  share_token text NOT NULL UNIQUE DEFAULT encode(extensions.gen_random_bytes(18),'hex'),
  foreman_name text,
  signer_name text,
  signer_title text,
  signature text,
  signed_method text,
  reject_reason text,
  sent_at timestamptz,
  signed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.change_orders TO authenticated;
GRANT USAGE ON SEQUENCE public.change_orders_number_seq TO authenticated;
GRANT ALL ON public.change_orders TO service_role;
ALTER TABLE public.change_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cos" ON public.change_orders FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "read own photos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'co-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "upload own photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'co-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "delete own photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'co-photos' AND (storage.foldername(name))[1] = auth.uid()::text);