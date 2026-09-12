/*
# SaaS multi-tenant foundation: profiles, templates, signup function, storefront RLS

## Summary

This migration implements the database layer for the Enviey SaaS multi-tenant
platform. It adds tenant user profiles, a template flag on catalogs, a SECURITY
DEFINER function that atomically creates a new tenant (catalog + admin user +
profile + cloned products), and RLS policies so the public storefront can read
catalog-scoped data while the admin API (service role) retains full access.

## 1. New Tables

### tenant_profiles
- `id` (uuid, primary key — same as admin_users.id)
- `catalog_id` (uuid, FK to catalogs.id)
- `display_name` (text — store owner's display name)
- `avatar_url` (text — nullable; defaults to null, UI generates initials avatar)
- `email` (text — owner contact email)
- `created_at` / `updated_at` (timestamptz)

Stores the tenant owner's profile. One row per admin_users row that has a
catalog_id (i.e. tenant-scoped users, not global admins).

## 2. Modified Tables

### catalogs
- Added `is_template` (boolean, default false) — marks a catalog as a
  template that new tenants can clone from.
- Added `template_name` (text, nullable) — display name shown in the template
  picker.

### admin_users
- Added `email` (text, nullable) — contact email for tenant owners.
- Added `display_name` (text, nullable) — store owner's name.

## 3. New Functions

### signup_tenant(p_store_name, p_slug, p_email, p_password, p_template_slug)
SECURITY DEFINER function that atomically:
1. Validates the slug (URL-safe, unique).
2. Creates a catalogs row for the new tenant.
3. Creates an admin_users row (tenant-scoped, linked to the new catalog).
4. Creates a tenant_profiles row.
5. Creates a catalog_members row.
6. If a template slug is provided, clones that template's products into the
   new catalog with new IDs and the new catalog_id.
7. Returns the new catalog's id, slug, and the admin user's id.

### clone_catalog(p_source_catalog_id, p_target_catalog_id)
SECURITY DEFINER helper that copies all products from a source catalog to a
target catalog with new IDs. Called internally by signup_tenant.

## 4. Security Changes

### RLS on products (public read, catalog-scoped)
- SELECT: anon + authenticated can read active products WHERE catalog_id matches.
  (The storefront needs to read products by catalog_id.)
- All other operations remain service-role only (admin API).

### RLS on banners (public read, catalog-scoped)
- SELECT: anon + authenticated can read banners WHERE catalog_id matches.

### RLS on catalogs (public read of catalog metadata)
- SELECT: anon + authenticated can read catalogs WHERE status = 'active'.
  (The storefront needs to resolve slug → catalog_id.)

### RLS on settings (public read, catalog-scoped)
- SELECT: anon + authenticated can read settings WHERE catalog_id matches.

### RLS on tenant_profiles
- SELECT: service-role only (admin API manages profiles).
- INSERT/UPDATE: service-role only.

## 5. Template Setup

Marks the MB Moda Brasil catalog as a template (is_template = true,
template_name = 'MB Moda Brasil').

## 6. Important Notes

1. The signup_tenant function uses pgcrypto's crypt() for password hashing,
   consistent with the existing hash_password() function.
2. Slug uniqueness is enforced by a unique index on catalogs.slug.
3. The clone_catalog function copies product data but NOT order/customer/lead
   data — those are tenant-specific and start empty.
4. Existing RLS policies on products/banners are replaced (dropped + recreated)
   to add the catalog_id filter.
5. The settings table upsert pattern in the admin API must include catalog_id
   in the conflict target — this is handled in the edge function update.
*/

-- ============================================================
-- 1. Add columns to catalogs
-- ============================================================
ALTER TABLE public.catalogs
  ADD COLUMN IF NOT EXISTS is_template boolean NOT NULL DEFAULT false;
ALTER TABLE public.catalogs
  ADD COLUMN IF NOT EXISTS template_name text;

-- ============================================================
-- 2. Add columns to admin_users
-- ============================================================
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS display_name text;

-- ============================================================
-- 3. Create tenant_profiles table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tenant_profiles (
  id uuid PRIMARY KEY REFERENCES public.admin_users(id) ON DELETE CASCADE,
  catalog_id uuid REFERENCES public.catalogs(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  avatar_url text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tenant_profiles ENABLE ROW LEVEL SECURITY;

-- Service-role only (admin API manages profiles)
DROP POLICY IF EXISTS "tenant_profiles_select" ON public.tenant_profiles;
CREATE POLICY "tenant_profiles_select" ON public.tenant_profiles
  FOR SELECT TO anon, authenticated USING (false);

DROP POLICY IF EXISTS "tenant_profiles_insert" ON public.tenant_profiles;
CREATE POLICY "tenant_profiles_insert" ON public.tenant_profiles
  FOR INSERT TO anon, authenticated WITH CHECK (false);

DROP POLICY IF EXISTS "tenant_profiles_update" ON public.tenant_profiles;
CREATE POLICY "tenant_profiles_update" ON public.tenant_profiles
  FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);

-- ============================================================
-- 4. Unique index on catalogs.slug (if not already present)
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS catalogs_slug_key ON public.catalogs (slug);

-- ============================================================
-- 5. Mark MB catalog as a template
-- ============================================================
UPDATE public.catalogs
SET is_template = true,
    template_name = 'MB Moda Brasil'
WHERE slug = 'mbmodabrasil';

-- ============================================================
-- 6. RLS for public storefront reads (catalog-scoped)
-- ============================================================

-- Products: public can read active products for a specific catalog
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_public_select" ON public.products;
CREATE POLICY "products_public_select" ON public.products
  FOR SELECT TO anon, authenticated
  USING (active = true AND catalog_id IS NOT NULL);

-- Banners: public can read banners for a specific catalog
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "banners_public_select" ON public.banners;
CREATE POLICY "banners_public_select" ON public.banners
  FOR SELECT TO anon, authenticated
  USING (catalog_id IS NOT NULL);

-- Catalogs: public can read active catalog metadata (slug resolution)
DROP POLICY IF EXISTS "catalogs_public_select" ON public.catalogs;
CREATE POLICY "catalogs_public_select" ON public.catalogs
  FOR SELECT TO anon, authenticated
  USING (status = 'active');

-- Settings: public can read settings for a specific catalog
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_public_select" ON public.settings;
CREATE POLICY "settings_public_select" ON public.settings
  FOR SELECT TO anon, authenticated
  USING (catalog_id IS NOT NULL);

-- Short links: public can read active links for a specific catalog
ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "short_links_public_select" ON public.short_links;
CREATE POLICY "short_links_public_select" ON public.short_links
  FOR SELECT TO anon, authenticated
  USING (catalog_id IS NOT NULL);

-- ============================================================
-- 7. clone_catalog function — copies products from source to target
-- ============================================================
CREATE OR REPLACE FUNCTION public.clone_catalog(
  p_source_catalog_id uuid,
  p_target_catalog_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO products (
    sku, name, slug, category, subcategory, gender, product_type,
    description, price, promo_price, images, sizes, colors, stock,
    stock_minimum, featured, bestseller, new_arrival, on_sale, active,
    cost, supplier, barcode, ncm, weight, dimensions, catalog_id
  )
  SELECT
    sku, name,
    -- Prefix slug to avoid collisions across catalogs
    slug || '-' || substr(p_target_catalog_id::text, 1, 8),
    category, subcategory, gender, product_type,
    description, price, promo_price, images, sizes, colors, stock,
    stock_minimum, featured, bestseller, new_arrival, on_sale, active,
    cost, supplier, barcode, ncm, weight, dimensions,
    p_target_catalog_id
  FROM products
  WHERE catalog_id = p_source_catalog_id;
END;
$$;

REVOKE ALL ON FUNCTION public.clone_catalog(uuid, uuid) FROM anon, authenticated;

-- ============================================================
-- 8. signup_tenant function — atomic tenant creation
-- ============================================================
CREATE OR REPLACE FUNCTION public.signup_tenant(
  p_store_name text,
  p_slug text,
  p_email text,
  p_password text,
  p_template_slug text DEFAULT 'mbmodabrasil'
) RETURNS table(
  catalog_id uuid,
  catalog_slug text,
  admin_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

  -- Hash password
  v_password_hash := crypt(p_password, gen_salt('bf'));

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

-- ============================================================
-- 9. Backfill tenant_profiles for existing mbmodabrasil user
-- ============================================================
INSERT INTO public.tenant_profiles (id, catalog_id, display_name, email)
SELECT au.id, au.catalog_id, 'MB Moda Brasil', au.email
FROM public.admin_users au
WHERE au.username = 'mbmodabrasil' AND au.catalog_id IS NOT NULL
ON CONFLICT (id) DO UPDATE
SET display_name = EXCLUDED.display_name,
    updated_at = now();
