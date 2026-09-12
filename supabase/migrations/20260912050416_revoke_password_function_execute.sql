-- F4: hash_password and verify_password are SECURITY DEFINER and were callable by
-- anon/authenticated through /rest/v1/rpc/, giving a free password-checking oracle.
-- The Edge Functions call them with the service role key, which keeps EXECUTE.

REVOKE ALL ON FUNCTION public.hash_password(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.hash_password(text) FROM anon;
REVOKE ALL ON FUNCTION public.hash_password(text) FROM authenticated;

REVOKE ALL ON FUNCTION public.verify_password(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.verify_password(text, text) FROM anon;
REVOKE ALL ON FUNCTION public.verify_password(text, text) FROM authenticated;
