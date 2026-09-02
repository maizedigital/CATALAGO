/*
# CRM Customer Extensions

1. Modified Tables
- `customers`: Added `address`, `number`, `complement`, `updated_at` columns if not present.
  These are needed for the CRM customer detail view and checkout flow.

2. Security
- No changes to RLS policies — existing policies remain in place.
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'address') THEN
    ALTER TABLE customers ADD COLUMN address text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'number') THEN
    ALTER TABLE customers ADD COLUMN number text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'complement') THEN
    ALTER TABLE customers ADD COLUMN complement text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'updated_at') THEN
    ALTER TABLE customers ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;
