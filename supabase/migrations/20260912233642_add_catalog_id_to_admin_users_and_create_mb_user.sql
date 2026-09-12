/*
# Add catalog_id to admin_users and create MB tenant user

## Changes
1. Adds `catalog_id` column to `admin_users` table — links an admin user
   to a specific catalog/tenant. NULL means the user is a global Enviey
   administrator with access to all tenants.
2. Creates the `mbmodabrasil` user with password `1234`, linked to the
   MB Moda Brasil catalog (ID 37c86a47-b2c1-4563-8e30-a5fff68ef918).

## Security
- No RLS changes needed — admin_users is already locked down.
- The new column is nullable so existing admin users (global admins)
  continue to work unchanged.
*/

ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS catalog_id uuid REFERENCES public.catalogs(id) ON DELETE SET NULL;

-- Create the mbmodabrasil tenant user with password 1234
INSERT INTO public.admin_users (username, password_hash, catalog_id)
SELECT 'mbmodabrasil', hash_password('1234'), id
FROM public.catalogs
WHERE slug = 'mbmodabrasil'
ON CONFLICT (username) DO UPDATE
SET password_hash = EXCLUDED.password_hash,
    catalog_id = EXCLUDED.catalog_id,
    updated_at = now();
