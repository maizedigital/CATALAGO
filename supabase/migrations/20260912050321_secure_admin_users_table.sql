-- F2: admin_users holds bcrypt password hashes and was reachable through the Data API.
-- Enable RLS and remove every client-role privilege. The Edge Functions use the
-- service role key, which bypasses both RLS and these grants, so they are unaffected.

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.admin_users FROM anon;
REVOKE ALL ON public.admin_users FROM authenticated;
