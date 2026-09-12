-- F5: admin-login issued an opaque token that was never stored or verified.
-- This table gives the server a record it can check on every admin-api request.
-- Only the service role (used by the Edge Functions) may touch it.

CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS admin_sessions_token_hash_idx ON public.admin_sessions (token_hash);
CREATE INDEX IF NOT EXISTS admin_sessions_expires_at_idx ON public.admin_sessions (expires_at);

ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.admin_sessions FROM anon;
REVOKE ALL ON public.admin_sessions FROM authenticated;
