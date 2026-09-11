-- Add unique constraint on leads.whatsapp so we can use upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_leads_whatsapp_unique'
  ) THEN
    ALTER TABLE leads ADD CONSTRAINT leads_whatsapp_unique UNIQUE (whatsapp);
  END IF;
END $$;
