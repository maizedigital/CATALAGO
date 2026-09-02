/*
# MB Catálogo — Schema inicial

1. Novas tabelas
- `categories`: categorias de produto (Feminino/Masculino subcategorias).
- `products`: catálogo de produtos com imagens, tamanhos, cores, preços, flags de destaque/novidade/oferta/mais vendido, e campos preparados para futura gestão (custo, fornecedor, código de barras, NCM, peso, dimensões).
- `settings`: configuração centralizada da loja (nome, logo, WhatsApp, Instagram, endereço, horário, textos) em formato chave-valor JSON.
- `customers`, `orders`, `order_items`, `product_variants`: estruturas preparadas para futuro painel admin / checkout com gateway. Vazias agora.

2. Segurança
- RLS habilitado em todas as tabelas.
- Catálogo e settings são públicos (leitura anon+authenticated). Escritas restritas a authenticated para uso futuro do admin.
- Tabelas de pedidos/clientes/variantes: leitura/escrita authenticated (uso futuro admin). Cliente final usa checkout via WhatsApp, sem dados sensíveis no front.

3. Notas
- Sem user_id / auth.uid() — app público sem login neste momento.
- Arrays de imagens, tamanhos e cores em JSONB para flexibilidade.
- Seed com 20 produtos fictícios (10 femininos, 10 masculinos) usando imagens de stock licenciadas.
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  gender text NOT NULL DEFAULT 'unisex',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE NOT NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text NOT NULL,
  gender text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  promo_price numeric(10,2),
  images jsonb NOT NULL DEFAULT '[]',
  sizes jsonb NOT NULL DEFAULT '[]',
  colors jsonb NOT NULL DEFAULT '[]',
  stock integer NOT NULL DEFAULT 0,
  featured boolean NOT NULL DEFAULT false,
  bestseller boolean NOT NULL DEFAULT false,
  new_arrival boolean NOT NULL DEFAULT false,
  on_sale boolean NOT NULL DEFAULT false,
  -- campos preparados para futura gestão admin
  cost numeric(10,2),
  supplier text,
  barcode text,
  ncm text,
  weight numeric(10,3),
  dimensions jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size text,
  color text,
  stock integer NOT NULL DEFAULT 0,
  sku text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  whatsapp text,
  cpf text,
  city text,
  district text,
  address text,
  number text,
  complement text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'novo',
  total numeric(10,2) NOT NULL DEFAULT 0,
  payment_method text DEFAULT 'pix',
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text,
  size text,
  color text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL
);

-- RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- categories: leitura pública, escrita authenticated (futuro admin)
DROP POLICY IF EXISTS "read_categories" ON categories;
CREATE POLICY "read_categories" ON categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "write_categories" ON categories;
CREATE POLICY "write_categories" ON categories FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_categories" ON categories;
CREATE POLICY "update_categories" ON categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_categories" ON categories;
CREATE POLICY "delete_categories" ON categories FOR DELETE TO authenticated USING (true);

-- products: leitura pública, escrita authenticated
DROP POLICY IF EXISTS "read_products" ON products;
CREATE POLICY "read_products" ON products FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_products" ON products;
CREATE POLICY "insert_products" ON products FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_products" ON products;
CREATE POLICY "update_products" ON products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_products" ON products;
CREATE POLICY "delete_products" ON products FOR DELETE TO authenticated USING (true);

-- product_variants: leitura pública, escrita authenticated
DROP POLICY IF EXISTS "read_variants" ON product_variants;
CREATE POLICY "read_variants" ON product_variants FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_variants" ON product_variants;
CREATE POLICY "insert_variants" ON product_variants FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_variants" ON product_variants;
CREATE POLICY "update_variants" ON product_variants FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_variants" ON product_variants;
CREATE POLICY "delete_variants" ON product_variants FOR DELETE TO authenticated USING (true);

-- settings: leitura pública, escrita authenticated
DROP POLICY IF EXISTS "read_settings" ON settings;
CREATE POLICY "read_settings" ON settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_settings" ON settings;
CREATE POLICY "insert_settings" ON settings FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_settings" ON settings;
CREATE POLICY "update_settings" ON settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_settings" ON settings;
CREATE POLICY "delete_settings" ON settings FOR DELETE TO authenticated USING (true);

-- customers/orders/order_items: authenticated (futuro admin). Cliente usa WhatsApp no checkout.
DROP POLICY IF EXISTS "read_customers" ON customers;
CREATE POLICY "read_customers" ON customers FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_customers" ON customers;
CREATE POLICY "insert_customers" ON customers FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_customers" ON customers;
CREATE POLICY "update_customers" ON customers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_customers" ON customers;
CREATE POLICY "delete_customers" ON customers FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "read_orders" ON orders;
CREATE POLICY "read_orders" ON orders FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_orders" ON orders;
CREATE POLICY "insert_orders" ON orders FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_orders" ON orders;
CREATE POLICY "update_orders" ON orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_orders" ON orders;
CREATE POLICY "delete_orders" ON orders FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "read_order_items" ON order_items;
CREATE POLICY "read_order_items" ON order_items FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_order_items" ON order_items;
CREATE POLICY "insert_order_items" ON order_items FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_order_items" ON order_items;
CREATE POLICY "update_order_items" ON order_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_order_items" ON order_items;
CREATE POLICY "delete_order_items" ON order_items FOR DELETE TO authenticated USING (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_new ON products(new_arrival);
CREATE INDEX IF NOT EXISTS idx_products_sale ON products(on_sale);
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Seed settings
INSERT INTO settings (key, value) VALUES
  ('store', '{"name":"MB","tagline":"Moda que combina com você","whatsapp":"5511999999999","instagram":"@mbmoda","email":"contato@mbmoda.com.br","address":"São Paulo, SP","hours":"Seg a Sex, 9h às 18h"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Seed products (20)
INSERT INTO products (sku, name, slug, category, gender, description, price, promo_price, images, sizes, colors, stock, featured, bestseller, new_arrival, on_sale) VALUES
-- FEMININO
('MB-F-001','Cropped MB Essential','cropped-mb-essential','Cropped','feminino','Cropped de alfaiataria com caimento perfeito. Tecido leve e respirável, ideal para compor looks modernos.',79.90,NULL,
 '["https://images.pexels.com/photos/6371791/pexels-photo-6371791.jpeg?auto=compress&cs=tinysrgb&h=900","https://images.pexels.com/photos/9558761/pexels-photo-9558761.jpeg?auto=compress&cs=tinysrgb&h=900"]'::jsonb,
 '["PP","P","M","G","GG"]'::jsonb,'["Preto","Branco","Off-white"]'::jsonb,32,true,false,true,false),
('MB-F-002','Camisa Feminina MB','camisa-feminina-mb','Camisa','feminino','Camisa feminina de corte oversized com botões. Tecido premium com toque sedoso.',129.90,NULL,
 '["https://images.pexels.com/photos/11671275/pexels-photo-11671275.jpeg?auto=compress&cs=tinysrgb&h=900","https://images.pexels.com/photos/31674938/pexels-photo-31674938.jpeg?auto=compress&cs=tinysrgb&h=900"]'::jsonb,
 '["PP","P","M","G"]'::jsonb,'["Branco","Off-white","Preto"]'::jsonb,24,true,false,false,false),
('MB-F-003','Calça Wide Leg MB','calca-wide-leg-mb','Calça','feminino','Calça wide leg de cintura alta com caimento fluido. Conforto e elegância em uma só peça.',189.90,NULL,
 '["https://images.pexels.com/photos/34234848/pexels-photo-34234848.jpeg?auto=compress&cs=tinysrgb&h=900","https://images.pexels.com/photos/26448305/pexels-photo-26448305.jpeg?auto=compress&cs=tinysrgb&h=900"]'::jsonb,
 '["36","38","40","42"]'::jsonb,'["Preto","Bege"]'::jsonb,18,false,true,false,false),
('MB-F-004','Vestido MB Classic','vestido-mb-classic','Vestido','feminino','Vestido midi com modelagem atemporal. Tecido encorpado que valoriza a silhueta.',219.90,NULL,
 '["https://images.pexels.com/photos/19927157/pexels-photo-19927157.jpeg?auto=compress&cs=tinysrgb&h=900","https://images.pexels.com/photos/26448305/pexels-photo-26448305.jpeg?auto=compress&cs=tinysrgb&h=900"]'::jsonb,
 '["PP","P","M","G"]'::jsonb,'["Preto","Verde"]'::jsonb,15,true,true,false,false),
('MB-F-005','Blusa MB Premium','blusa-mb-premium','Blusa','feminino','Blusa em malha penteada premium. Toque macio e acabamento refinado.',149.90,NULL,
 '["https://images.pexels.com/photos/10483258/pexels-photo-10483258.jpeg?auto=compress&cs=tinysrgb&h=900","https://images.pexels.com/photos/7206226/pexels-photo-7206226.jpeg?auto=compress&cs=tinysrgb&h=900"]'::jsonb,
 '["PP","P","M","G","GG"]'::jsonb,'["Branco","Preto"]'::jsonb,28,false,false,true,false),
('MB-F-006','Short MB Essential','short-mb-essential','Short','feminino','Short de cintura alta com elastano. Caimento perfeito para o dia a dia.',89.90,69.90,
 '["https://images.pexels.com/photos/6371791/pexels-photo-6371791.jpeg?auto=compress&cs=tinysrgb&h=900","https://images.pexels.com/photos/3894514/pexels-photo-3894514.jpeg?auto=compress&cs=tinysrgb&h=900"]'::jsonb,
 '["36","38","40"]'::jsonb,'["Preto","Jeans"]'::jsonb,20,false,false,false,true),
('MB-F-007','Body MB','body-mb','Body','feminino','Body de lycra com modelagem que acompanha o corpo. Abotoamento entrepernas.',99.90,NULL,
 '["https://images.pexels.com/photos/7206226/pexels-photo-7206226.jpeg?auto=compress&cs=tinysrgb&h=900","https://images.pexels.com/photos/6371791/pexels-photo-6371791.jpeg?auto=compress&cs=tinysrgb&h=900"]'::jsonb,
 '["PP","P","M","G"]'::jsonb,'["Preto","Branco"]'::jsonb,22,false,false,true,false),
('MB-F-008','Saia MB','saia-mb','Saia','feminino','Saia midi de alfaiataria com fenda lateral. Sofisticação para qualquer ocasião.',119.90,89.90,
 '["https://images.pexels.com/photos/26448305/pexels-photo-26448305.jpeg?auto=compress&cs=tinysrgb&h=900","https://images.pexels.com/photos/31674938/pexels-photo-31674938.jpeg?auto=compress&cs=tinysrgb&h=900"]'::jsonb,
 '["36","38","40"]'::jsonb,'["Preto","Bege"]'::jsonb,16,false,false,false,true),
('MB-F-009','Conjunto MB','conjunto-mb-feminino','Conjunto','feminino','Conjunto blusa + calça coordinated. Look completo com peças que combinam entre si.',249.90,NULL,
 '["https://images.pexels.com/photos/31674938/pexels-photo-31674938.jpeg?auto=compress&cs=tinysrgb&h=900","https://images.pexels.com/photos/10483258/pexels-photo-10483258.jpeg?auto=compress&cs=tinysrgb&h=900"]'::jsonb,
 '["PP","P","M","G"]'::jsonb,'["Preto"]'::jsonb,12,true,false,false,false),
('MB-F-010','Regata MB','regata-mb-feminino','Regata','feminino','Regata básica de algodão pima. Leve e versátil para compor diversos looks.',69.90,NULL,
 '["https://images.pexels.com/photos/3894514/pexels-photo-3894514.jpeg?auto=compress&cs=tinysrgb&h=900","https://images.pexels.com/photos/34234848/pexels-photo-34234848.jpeg?auto=compress&cs=tinysrgb&h=900"]'::jsonb,
 '["PP","P","M","G","GG"]'::jsonb,'["Preto","Branco","Cinza"]'::jsonb,40,false,true,true,false),
-- MASCULINO
('MB-M-001','Camiseta MB Essential','camiseta-mb-essential','Camiseta','masculino','Camiseta básica em malha 100% algodão fio 30.1. Caimento regular e toque macio.',59.90,NULL,
 '["https://images.pexels.com/photos/8346029/pexels-photo-8346029.jpeg?auto=compress&cs=tinysrgb&h=900","https://images.pexels.com/photos/32519369/pexels-photo-32519369.jpeg?auto=compress&cs=tinysrgb&h=900"]'::jsonb,
 '["P","M","G","GG","XG"]'::jsonb,'["Preto","Branco","Cinza"]'::jsonb,60,true,true,false,false),
('MB-M-002','Camiseta MB Premium','camiseta-mb-premium','Camiseta','masculino','Camiseta premium em malha penteada com tratamento premium. Toque sedoso e durabilidade superior.',89.90,NULL,
 '["https://images.pexels.com/photos/15568482/pexels-photo-15568482.jpeg?auto=compress&cs=tinysrgb&h=900","https://images.pexels.com/photos/30688132/pexels-photo-30688132.jpeg?auto=compress&cs=tinysrgb&h=900"]'::jsonb,
 '["P","M","G","GG","XG"]'::jsonb,'["Preto","Branco","Off-white"]'::jsonb,45,true,false,true,false),
('MB-M-003','Camisa MB','camisa-mb','Camisa','masculino','Camisa social em tecido de algodão com elastano. Modelagem slim e acabamento impecável.',149.90,NULL,
 '["https://images.pexels.com/photos/18765277/pexels-photo-18765277.jpeg?auto=compress&cs=tinysrgb&h=900","https://images.pexels.com/photos/29911864/pexels-photo-29911864.jpeg?auto=compress&cs=tinysrgb&h=900"]'::jsonb,
 '["P","M","G","GG","XG"]'::jsonb,'["Branco","Azul","Preto"]'::jsonb,30,false,true,false,false),
('MB-M-004','Bermuda MB','bermuda-mb','Bermuda','masculino','Bermuda em sarja com elastano. Conforto e mobilidade para o dia a dia.',109.90,79.90,
 '["https://images.pexels.com/photos/6487425/pexels-photo-6487425.jpeg?auto=compress&cs=tinysrgb&h=900","https://images.pexels.com/photos/8346029/pexels-photo-8346029.jpeg?auto=compress&cs=tinysrgb&h=900"]'::jsonb,
 '["38","40","42","44"]'::jsonb,'["Preto","Bege","Jeans"]'::jsonb,26,false,false,false,true),
('MB-M-005','Calça MB','calca-mb','Calça','masculino','Calça de alfaiataria com modelagem slim. Tecido com elastano para conforto total.',179.90,NULL,
 '["https://images.pexels.com/photos/29911864/pexels-photo-29911864.jpeg?auto=compress&cs=tinysrgb&h=900","https://images.pexels.com/photos/18765277/pexels-photo-18765277.jpeg?auto=compress&cs=tinysrgb&h=900"]'::jsonb,
 '["38","40","42","44"]'::jsonb,'["Preto","Cinza"]'::jsonb,22,false,true,false,false),
('MB-M-006','Polo MB','polo-mb','Polo','masculino','Polo em malha piquet premium. Caimento regular e gola reforçada.',119.90,NULL,
 '["https://images.pexels.com/photos/32519369/pexels-photo-32519369.jpeg?auto=compress&cs=tinysrgb&h=900","https://images.pexels.com/photos/13875998/pexels-photo-13875998.jpeg?auto=compress&cs=tinysrgb&h=900"]'::jsonb,
 '["P","M","G","GG","XG"]'::jsonb,'["Preto","Branco","Azul"]'::jsonb,35,true,false,false,false),
('MB-M-007','Regata MB','regata-mb-masculino','Regata','masculino','Regata em algodão ribana. Modelagem ampla e confortável.',49.90,39.90,
 '["https://images.pexels.com/photos/17273952/pexels-photo-17273952.jpeg?auto=compress&cs=tinysrgb&h=900","https://images.pexels.com/photos/17221215/pexels-photo-17221215.jpeg?auto=compress&cs=tinysrgb&h=900"]'::jsonb,
 '["P","M","G","GG"]'::jsonb,'["Preto","Branco","Cinza"]'::jsonb,50,false,false,true,true),
('MB-M-008','Shorts MB','shorts-mb','Shorts','masculino','Shorts em malha com elastano. Perfeito para treino e lazer.',89.90,NULL,
 '["https://images.pexels.com/photos/17221215/pexels-photo-17221215.jpeg?auto=compress&cs=tinysrgb&h=900","https://images.pexels.com/photos/6487425/pexels-photo-6487425.jpeg?auto=compress&cs=tinysrgb&h=900"]'::jsonb,
 '["38","40","42"]'::jsonb,'["Preto","Jeans"]'::jsonb,28,false,false,true,false),
('MB-M-009','Conjunto MB','conjunto-mb-masculino','Conjunto','masculino','Conjunto camiseta + shorts coordenados. Praticidade e estilo em um só kit.',229.90,NULL,
 '["https://images.pexels.com/photos/30688132/pexels-photo-30688132.jpeg?auto=compress&cs=tinysrgb&h=900","https://images.pexels.com/photos/15568482/pexels-photo-15568482.jpeg?auto=compress&cs=tinysrgb&h=900"]'::jsonb,
 '["P","M","G","GG"]'::jsonb,'["Preto","Cinza"]'::jsonb,18,true,false,false,false),
('MB-M-010','Camiseta Oversized MB','camiseta-oversized-mb','Camiseta','masculino','Camiseta oversized com caimento amplo e moderno. Malha grossa com toque premium.',99.90,NULL,
 '["https://images.pexels.com/photos/13875998/pexels-photo-13875998.jpeg?auto=compress&cs=tinysrgb&h=900","https://images.pexels.com/photos/17273952/pexels-photo-17273952.jpeg?auto=compress&cs=tinysrgb&h=900"]'::jsonb,
 '["P","M","G","GG","XG"]'::jsonb,'["Preto","Branco","Off-white"]'::jsonb,38,false,true,true,false)
ON CONFLICT (sku) DO NOTHING;