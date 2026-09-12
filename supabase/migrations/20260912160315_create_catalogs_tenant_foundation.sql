/*
# Multi-tenant foundation: catalogs table and catalog_id on all data tables

1. New Tables
- `catalogs`: represents a tenant/store in the Enviey SaaS. Each catalog has a
  name, slug (for public URL), domain, WhatsApp number, and branding settings.
  MB is the first catalog.
- `catalog_members`: links admin_users to catalogs with a role (admin/editor).

2. Modified Tables (additive only — nullable catalog_id columns)
- `products` — adds `catalog_id uuid` referencing catalogs
- `orders` — adds `catalog_id uuid` referencing catalogs
- `customers` — adds `catalog_id uuid` referencing catalogs
- `leads` — adds `catalog_id uuid` referencing catalogs
- `visitors` — adds `catalog_id uuid` referencing catalogs
- `customer_events` — adds `catalog_id uuid` referencing catalogs
- `banners` — adds `catalog_id uuid` referencing catalogs
- `settings` — adds `catalog_id uuid` referencing catalogs
- `short_links` — adds `catalog_id uuid` referencing catalogs
- `link_clicks` — adds `catalog_id uuid` referencing catalogs

3. Data Migration
- Inserts one row into `catalogs` for MB (slug 'mb', domain 'mbmodabrasil.com.br').
- Backfills `catalog_id` on all existing rows to the MB catalog id.

4. Security
- RLS enabled on `catalogs` and `catalog_members`.
- Both tables are service-role-only (no anon/authenticated grants) because they
  are managed exclusively through the authenticated admin-api edge function.
- All new `catalog_id` columns are nullable so existing rows and the public
  storefront continue to work without changes.

5. Important Notes
- This migration is purely additive. No existing column is dropped, renamed,
  or type-changed. No existing RLS policy is modified. The public storefront
  queries do not filter by catalog_id yet — that comes later when the
  storefront is made tenant-aware. For now, all data belongs to MB and the
  catalog_id column simply records that ownership.
*/

CREATE TABLE IF NOT EXISTS public.catalogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  domain text,
  whatsapp text,
  status text NOT NULL DEFAULT 'active',
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.catalog_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id uuid NOT NULL REFERENCES public.catalogs(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (catalog_id, admin_id)
);

ALTER TABLE public.catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_members ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.catalogs FROM anon, authenticated;
REVOKE ALL ON public.catalog_members FROM anon, authenticated;

-- Add nullable catalog_id to every data table. Idempotent: each DO block
-- checks information_schema before adding.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='catalog_id') THEN
    ALTER TABLE public.products ADD COLUMN catalog_id uuid REFERENCES public.catalogs(id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='catalog_id') THEN
    ALTER TABLE public.orders ADD COLUMN catalog_id uuid REFERENCES public.catalogs(id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='customers' AND column_name='catalog_id') THEN
    ALTER TABLE public.customers ADD COLUMN catalog_id uuid REFERENCES public.catalogs(id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='leads' AND column_name='catalog_id') THEN
    ALTER TABLE public.leads ADD COLUMN catalog_id uuid REFERENCES public.catalogs(id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='visitors' AND column_name='catalog_id') THEN
    ALTER TABLE public.visitors ADD COLUMN catalog_id uuid REFERENCES public.catalogs(id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='customer_events' AND column_name='catalog_id') THEN
    ALTER TABLE public.customer_events ADD COLUMN catalog_id uuid REFERENCES public.catalogs(id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='banners' AND column_name='catalog_id') THEN
    ALTER TABLE public.banners ADD COLUMN catalog_id uuid REFERENCES public.catalogs(id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='settings' AND column_name='catalog_id') THEN
    ALTER TABLE public.settings ADD COLUMN catalog_id uuid REFERENCES public.catalogs(id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='short_links' AND column_name='catalog_id') THEN
    ALTER TABLE public.short_links ADD COLUMN catalog_id uuid REFERENCES public.catalogs(id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='link_clicks' AND column_name='catalog_id') THEN
    ALTER TABLE public.link_clicks ADD COLUMN catalog_id uuid REFERENCES public.catalogs(id);
  END IF;
END $$;

-- Insert the MB catalog as the first tenant if it does not exist.
INSERT INTO public.catalogs (name, slug, domain, whatsapp, status)
SELECT 'MB', 'mb', 'mbmodabrasil.com.br', '5573999929009', 'active'
WHERE NOT EXISTS (SELECT 1 FROM public.catalogs WHERE slug = 'mb');

-- Backfill catalog_id on all existing rows to the MB catalog.
-- Runs only if there are null catalog_id rows.
DO $$
DECLARE
  v_mb_id uuid;
BEGIN
  SELECT id INTO v_mb_id FROM public.catalogs WHERE slug = 'mb';
  IF v_mb_id IS NULL THEN RETURN; END IF;

  UPDATE public.products SET catalog_id = v_mb_id WHERE catalog_id IS NULL;
  UPDATE public.orders SET catalog_id = v_mb_id WHERE catalog_id IS NULL;
  UPDATE public.customers SET catalog_id = v_mb_id WHERE catalog_id IS NULL;
  UPDATE public.leads SET catalog_id = v_mb_id WHERE catalog_id IS NULL;
  UPDATE public.visitors SET catalog_id = v_mb_id WHERE catalog_id IS NULL;
  UPDATE public.customer_events SET catalog_id = v_mb_id WHERE catalog_id IS NULL;
  UPDATE public.banners SET catalog_id = v_mb_id WHERE catalog_id IS NULL;
  UPDATE public.settings SET catalog_id = v_mb_id WHERE catalog_id IS NULL;
  UPDATE public.short_links SET catalog_id = v_mb_id WHERE catalog_id IS NULL;
  UPDATE public.link_clicks SET catalog_id = v_mb_id WHERE catalog_id IS NULL;
END $$;

-- Make the current admin a member of the MB catalog.
INSERT INTO public.catalog_members (catalog_id, admin_id, role)
SELECT c.id, a.id, 'admin'
FROM public.catalogs c, public.admin_users a
WHERE c.slug = 'mb'
ON CONFLICT (catalog_id, admin_id) DO NOTHING;
