/*
# Banners, Product Type, and Admin Email Account

1. New Tables
- `banners`: manageable banner images for the storefront carousel.
  - id (uuid PK)
  - title (text) — internal label for the admin
  - image_url (text) — public storage URL
  - link_url (text, nullable) — optional destination when clicked
  - active (boolean, default true) — only active banners show on storefront
  - sort_order (integer, default 0) — lower = appears first
  - created_at, updated_at (timestamptz)

2. Modified Tables
- `products`: adds `product_type` column (text, default 'roupas') to support 'roupas' and 'calcados'.
  This controls which size options are presented in the admin form.

3. Security
- `banners`: RLS enabled. Public SELECT (anon + authenticated) so the storefront can read active banners.
  INSERT/UPDATE/DELETE restricted to authenticated (admin).
- `products` RLS unchanged — existing policies already allow authenticated writes.

4. Admin account
- Inserts a new admin_users row with username 'agencia.maizedigital@gmail.com' and password '1234'
  (bcrypt-hashed via pgcrypto) if it does not already exist.
- The existing 'admin' account remains unchanged.

5. Notes
- Banners use the existing `product-images` storage bucket (reused as `banners` folder within it).
- No new storage bucket is created.
*/

-- ============ BANNERS TABLE ============
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  link_url text,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_banners" ON banners;
CREATE POLICY "read_banners" ON banners FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_banners" ON banners;
CREATE POLICY "insert_banners" ON banners FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_banners" ON banners;
CREATE POLICY "update_banners" ON banners FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_banners" ON banners;
CREATE POLICY "delete_banners" ON banners FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_banners_active_sort ON banners(active, sort_order);

-- ============ PRODUCT TYPE COLUMN ============
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'product_type') THEN
    ALTER TABLE products ADD COLUMN product_type text NOT NULL DEFAULT 'roupas';
  END IF;
END $$;

-- ============ ADMIN EMAIL ACCOUNT ============
INSERT INTO admin_users (username, password_hash)
SELECT 'agencia.maizedigital@gmail.com', crypt('1234', gen_salt('bf'))
WHERE NOT EXISTS (
  SELECT 1 FROM admin_users WHERE username = 'agencia.maizedigital@gmail.com'
);
