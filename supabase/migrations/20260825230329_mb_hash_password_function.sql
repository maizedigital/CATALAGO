/*
# hash_password function

Função SECURITY DEFINER para gerar hash bcrypt (pgcrypto).
Usada pela edge function admin-api ao alterar senha.
*/

CREATE OR REPLACE FUNCTION hash_password(p_password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN crypt(p_password, gen_salt('bf'));
END;
$$;

REVOKE ALL ON FUNCTION hash_password(text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION hash_password(text) TO authenticated;