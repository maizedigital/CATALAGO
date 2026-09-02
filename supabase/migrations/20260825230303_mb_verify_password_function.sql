/*
# verify_password function

Função SECURITY DEFINER para verificar senha contra hash bcrypt (pgcrypto).
Usada pela edge function admin-login. Aceita senha em texto puro e hash,
retorna boolean. Acesso apenas via service role (não exposta ao anon).
*/

CREATE OR REPLACE FUNCTION verify_password(p_password text, p_hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN p_hash = crypt(p_password, p_hash);
END;
$$;

-- Não conceder a anon — apenas authenticated e service_role
REVOKE ALL ON FUNCTION verify_password(text, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION verify_password(text, text) TO authenticated;