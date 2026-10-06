CREATE TABLE public.template_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  packs text[] NOT NULL DEFAULT '{}',
  access_token text NOT NULL UNIQUE DEFAULT encode(extensions.gen_random_bytes(24), 'hex'),
  paddle_transaction_id text NOT NULL UNIQUE,
  environment text NOT NULL DEFAULT 'sandbox',
  email_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.template_purchases TO service_role;
ALTER TABLE public.template_purchases ENABLE ROW LEVEL SECURITY;