CREATE TABLE public.saved_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  trade text NOT NULL,
  doc text NOT NULL,
  title text NOT NULL DEFAULT 'Untitled form',
  values jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_forms TO authenticated;
GRANT ALL ON public.saved_forms TO service_role;
ALTER TABLE public.saved_forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own saved forms" ON public.saved_forms FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX saved_forms_user_idx ON public.saved_forms(user_id, updated_at DESC);