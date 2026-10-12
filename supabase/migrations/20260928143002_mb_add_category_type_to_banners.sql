/*
# Add category carousel support to banners table

1. Changes to `banners` table:
   - Add `type` text column (default 'banner') to distinguish between
     regular banners ('banner') and category carousel items ('category').
   - Add `category_name` text column (nullable) to store the display name
     for category carousel items (e.g. "CAMISAS", "TÊNIS").

2. Backfill existing banners with type='banner'.

3. Grant SELECT on new columns to anon role (consistent with existing
   column-level grants on the banners table).

4. Security: No RLS policy changes. Existing policies remain intact.
   The banners table already has anon SELECT access.
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'banners' AND column_name = 'type') THEN
    ALTER TABLE public.banners ADD COLUMN type text NOT NULL DEFAULT 'banner';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'banners' AND column_name = 'category_name') THEN
    ALTER TABLE public.banners ADD COLUMN category_name text;
  END IF;
END $$;

GRANT SELECT (type, category_name) ON public.banners TO anon;
