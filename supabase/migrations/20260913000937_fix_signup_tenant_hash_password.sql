/*
# Fix signup_tenant to use hash_password function instead of gen_salt directly

The gen_salt function from pgcrypto is available in the extensions schema,
but signup_tenant's SET search_path = public prevents finding it.
Use the existing hash_password() function instead, which is in the public schema.
*/

CREATE OR REPLACE FUNCTION public.signup_tenant(
  p_store_name text,
  p_slug text,
  p_email text,
  p_password text,
  p_template_slug text DEFAULT NULL
) RETURNS table(
  catalog_id uuid,
  catalog_slug text,
  admin_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_slug text;
  v_catalog_id uuid;
  v_admin_id uuid;
  v_template_id uuid;
  v_password_hash text;
BEGIN
  -- Normalize slug: lowercase, URL-safe, no spaces
  v_slug := lower(trim(p_slug));
  v_slug := regexp_replace(v_slug, '[^a-z0-9-]', '-', 'g');
  v_slug := regexp_replace(v_slug, '-+', '-', 'g');
  v_slug := trim(both '-' from v_slug);

  IF v_slug = '' OR length(v_slug) < 2 THEN
    RAISE EXCEPTION 'Slug inválido: deve ter pelo menos 2 caracteres';
  END IF;

  -- Check slug uniqueness
  IF EXISTS (SELECT 1 FROM catalogs WHERE slug = v_slug) THEN
    RAISE EXCEPTION 'Este endereço já está em uso. Escolha outro.';
  END IF;

  -- Validate password
  IF length(p_password) < 4 THEN
    RAISE EXCEPTION 'A senha deve ter pelo menos 4 caracteres';
  END IF;

  -- Validate email
  IF p_email IS NULL OR p_email !~ '@' THEN
    RAISE EXCEPTION 'E-mail inválido';
  END IF;

  -- Hash password using the existing hash_password function
  v_password_hash := public.hash_password(p_password);

  -- Create the catalog (tenant)
  INSERT INTO catalogs (name, slug, status, settings, is_template)
  VALUES (p_store_name, v_slug, 'active', '{}'::jsonb, false)
  RETURNING id INTO v_catalog_id;

  -- Create the admin user (tenant-scoped)
  INSERT INTO admin_users (username, password_hash, catalog_id, email, display_name)
  VALUES (v_slug, v_password_hash, v_catalog_id, p_email, p_store_name)
  RETURNING id INTO v_admin_id;

  -- Create the tenant profile
  INSERT INTO tenant_profiles (id, catalog_id, display_name, email)
  VALUES (v_admin_id, v_catalog_id, p_store_name, p_email);

  -- Create the catalog member
  INSERT INTO catalog_members (catalog_id, admin_id, role)
  VALUES (v_catalog_id, v_admin_id, 'owner');

  -- Clone template products if requested
  IF p_template_slug IS NOT NULL AND p_template_slug != '' THEN
    SELECT id INTO v_template_id FROM catalogs WHERE slug = p_template_slug AND is_template = true;
    IF v_template_id IS NOT NULL THEN
      PERFORM clone_catalog(v_template_id, v_catalog_id);
    END IF;
  END IF;

  RETURN QUERY SELECT v_catalog_id, v_slug, v_admin_id;
END;
$$;

REVOKE ALL ON FUNCTION public.signup_tenant(text, text, text, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.signup_tenant(text, text, text, text, text) TO anon, authenticated;
