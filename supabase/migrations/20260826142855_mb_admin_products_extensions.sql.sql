-- Adicionar colunas a products para gestão completa do admin
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='subcategory') THEN
    ALTER TABLE products ADD COLUMN subcategory text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='stock_minimum') THEN
    ALTER TABLE products ADD COLUMN stock_minimum integer NOT NULL DEFAULT 5;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='active') THEN
    ALTER TABLE products ADD COLUMN active boolean NOT NULL DEFAULT true;
  END IF;
END $$;

-- Tabela de ajustes de estoque
CREATE TABLE IF NOT EXISTS inventory_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  old_stock integer NOT NULL,
  new_stock integer NOT NULL,
  reason text,
  username text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE inventory_adjustments ENABLE ROW LEVEL SECURITY;

-- Escrita authenticated (admin), leitura authenticated
DROP POLICY IF EXISTS "read_inventory_adjustments" ON inventory_adjustments;
CREATE POLICY "read_inventory_adjustments" ON inventory_adjustments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_inventory_adjustments" ON inventory_adjustments;
CREATE POLICY "insert_inventory_adjustments" ON inventory_adjustments FOR INSERT TO authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_product ON inventory_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_created ON inventory_adjustments(created_at);

-- Atualizar settings com Instagram correto
UPDATE settings SET value = jsonb_set(value, '{instagram}', '"@mbmodabrasil"') WHERE key = 'store';
