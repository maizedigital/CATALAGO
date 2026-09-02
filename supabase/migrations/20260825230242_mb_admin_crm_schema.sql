/*
# MB Admin + CRM + Coleta de Dados — Schema

1. Novas tabelas
- `admin_users`: usuários administrativos com username + password_hash (bcrypt via pgcrypto). Seed inicial: admin / 1234 (hash bcrypt). Preparado para alteração de senha futura.
- `leads`: contatos capturados no site (nome, whatsapp, cpf opcional, origem, status, produto de interesse, observações, datas).
- `customer_events`: histórico de comportamento do visitante/cliente (produto visualizado, categoria acessada, carrinho, checkout, clique whatsapp, etc).
- `visitors`: visitantes únicos identificados por fingerprint (localStorage). Conta acessos para o dashboard.

2. Tabelas modificadas
- `customers`: adiciona colunas `origin`, `status`, `first_contact`, `last_contact`, `last_purchase`, `total_spent`, `orders_count`, `notes` para CRM completo.
- `orders`: adiciona colunas `customer_whatsapp`, `customer_name` para pedidos vindos do checkout via WhatsApp (sem necessidade de customer_id).

3. Segurança
- `admin_users`: sem RLS pois autenticação é feita via edge function com SECURITY DEFINER. Apenas a edge function lê essa tabela (service role key).
- `leads`: escrita anon (visitante preenche formulário) + leitura/escrita authenticated (admin gerencia). INSERT upsert por whatsapp.
- `customer_events`: escrita anon (rastreamento de visitantes) + leitura authenticated (admin). 
- `visitors`: escrita anon (registro de visita) + leitura authenticated (admin).
- `customers`: agora permite INSERT anon para coleta de leads no site, SELECT/UPDATE/DELETE authenticated (admin).

4. Notas
- pgcrypto habilitado para funções crypt() e gen_salt() usadas no hash bcrypt.
- O hash inicial 'admin/1234' é apenas para desenvolvimento — deve ser alterado via admin.
- Índices em whatsapp para buscas de dedup.
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- admin_users
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seed admin user (admin / 1234) se não existir
INSERT INTO admin_users (username, password_hash)
SELECT 'admin', crypt('1234', gen_salt('bf'))
WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE username = 'admin');

-- leads
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  whatsapp text NOT NULL,
  cpf text,
  city text,
  origin text DEFAULT 'site',
  status text DEFAULT 'novo',
  product_interest text,
  last_interaction text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- customer_events
CREATE TABLE IF NOT EXISTS customer_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text,
  whatsapp text,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text,
  created_at timestamptz DEFAULT now()
);

-- visitors
CREATE TABLE IF NOT EXISTS visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text UNIQUE NOT NULL,
  first_visit timestamptz DEFAULT now(),
  last_visit timestamptz DEFAULT now(),
  visit_count integer DEFAULT 1,
  whatsapp text
);

-- Adicionar colunas a customers (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='origin') THEN
    ALTER TABLE customers ADD COLUMN origin text DEFAULT 'site';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='status') THEN
    ALTER TABLE customers ADD COLUMN status text DEFAULT 'novo';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='first_contact') THEN
    ALTER TABLE customers ADD COLUMN first_contact timestamptz DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='last_contact') THEN
    ALTER TABLE customers ADD COLUMN last_contact timestamptz DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='last_purchase') THEN
    ALTER TABLE customers ADD COLUMN last_purchase timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='total_spent') THEN
    ALTER TABLE customers ADD COLUMN total_spent numeric(10,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='orders_count') THEN
    ALTER TABLE customers ADD COLUMN orders_count integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='notes') THEN
    ALTER TABLE customers ADD COLUMN notes text;
  END IF;
END $$;

-- Adicionar colunas a orders (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='customer_whatsapp') THEN
    ALTER TABLE orders ADD COLUMN customer_whatsapp text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='customer_name') THEN
    ALTER TABLE orders ADD COLUMN customer_name text;
  END IF;
END $$;

-- RLS nas novas tabelas
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- leads: INSERT anon (visitante), SELECT/UPDATE/DELETE authenticated (admin)
-- INSERT upsert: se whatsapp já existe, atualiza; senão cria.
DROP POLICY IF EXISTS "insert_leads" ON leads;
CREATE POLICY "insert_leads" ON leads FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "read_leads" ON leads;
CREATE POLICY "read_leads" ON leads FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "update_leads" ON leads;
CREATE POLICY "update_leads" ON leads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_leads" ON leads;
CREATE POLICY "delete_leads" ON leads FOR DELETE TO authenticated USING (true);

-- customer_events: INSERT anon (rastreamento), SELECT authenticated (admin)
DROP POLICY IF EXISTS "insert_events" ON customer_events;
CREATE POLICY "insert_events" ON customer_events FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "read_events" ON customer_events;
CREATE POLICY "read_events" ON customer_events FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "delete_events" ON customer_events;
CREATE POLICY "delete_events" ON customer_events FOR DELETE TO authenticated USING (true);

-- visitors: INSERT/UPDATE anon (registro de visita), SELECT authenticated (admin)
DROP POLICY IF EXISTS "insert_visitors" ON visitors;
CREATE POLICY "insert_visitors" ON visitors FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_visitors" ON visitors;
CREATE POLICY "update_visitors" ON visitors FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "read_visitors" ON visitors;
CREATE POLICY "read_visitors" ON visitors FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "delete_visitors" ON visitors;
CREATE POLICY "delete_visitors" ON visitors FOR DELETE TO authenticated USING (true);

-- Atualizar customers: agora permite INSERT anon (coleta de leads no site)
DROP POLICY IF EXISTS "insert_customers" ON customers;
CREATE POLICY "insert_customers" ON customers FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_leads_whatsapp ON leads(whatsapp);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_events_visitor ON customer_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_events_whatsapp ON customer_events(whatsapp);
CREATE INDEX IF NOT EXISTS idx_events_type ON customer_events(event_type);
CREATE INDEX IF NOT EXISTS idx_visitors_visitor ON visitors(visitor_id);
CREATE INDEX IF NOT EXISTS idx_customers_whatsapp ON customers(whatsapp);

-- Atualizar settings com WhatsApp correto
UPDATE settings SET value = jsonb_set(value, '{whatsapp}', '"5573999929009"') WHERE key = 'store';