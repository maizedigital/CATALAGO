-- Corrigir search_path da função verify_password para incluir o schema extensions
CREATE OR REPLACE FUNCTION verify_password(p_password text, p_hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = extensions, public
AS $$
BEGIN
  RETURN p_hash = crypt(p_password, p_hash);
END;
$$;

REVOKE ALL ON FUNCTION verify_password(text, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION verify_password(text, text) TO authenticated;

-- Também corrigir hash_password se existir
CREATE OR REPLACE FUNCTION hash_password(p_password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = extensions, public
AS $$
BEGIN
  RETURN crypt(p_password, gen_salt('bf'));
END;
$$;

REVOKE ALL ON FUNCTION hash_password(text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION hash_password(text) TO authenticated;

-- Recriar o hash do admin com a senha 1234
UPDATE admin_users
SET password_hash = crypt('1234', gen_salt('bf'))
WHERE username = 'admin';
