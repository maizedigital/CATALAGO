/*
# Product sort_order, order customer_cpf, fix create_checkout_order

1. Changes to `products` table:
   - Add `sort_order` integer column (default 0) to support manual product ordering.
   - Backfill existing products with sequential sort_order based on created_at.

2. Changes to `orders` table:
   - Add `customer_cpf` text column (nullable) to store the customer's CPF at order time.

3. Fix `create_checkout_order` function:
   - The function currently inserts orders with only customer_id, but does NOT set
     customer_name or customer_whatsapp on the order row. The admin panel reads
     those columns directly from orders, so they show as "—".
   - Updated function now sets customer_name, customer_whatsapp, and customer_cpf
     directly on the order row at insert time.
   - Also sets catalog_id on the order so it is scoped correctly.

4. Security: No RLS changes. Existing policies remain intact.
*/

-- Add sort_order to products
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sort_order') THEN
    ALTER TABLE public.products ADD COLUMN sort_order integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Backfill sort_order for existing products (sequential by created_at)
UPDATE public.products
SET sort_order = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM public.products
) sub
WHERE public.products.id = sub.id AND public.products.sort_order = 0;

-- Add customer_cpf to orders
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_cpf') THEN
    ALTER TABLE public.orders ADD COLUMN customer_cpf text;
  END IF;
END $$;

-- Recreate create_checkout_order with customer data on order row
CREATE OR REPLACE FUNCTION public.create_checkout_order(
  p_name text,
  p_whatsapp text,
  p_cpf text,
  p_items jsonb,
  p_payment_method text DEFAULT 'pix'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_order_id uuid;
  v_customer_id uuid;
  v_catalog_id uuid;
  v_total numeric(10,2) := 0;
  v_item jsonb;
  v_product public.products%ROWTYPE;
  v_quantity integer;
  v_unit_price numeric(10,2);
  v_size text;
  v_color text;
BEGIN
  IF coalesce(btrim(p_name), '') = '' OR coalesce(btrim(p_whatsapp), '') = '' THEN
    RAISE EXCEPTION 'dados invalidos';
  END IF;

  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'carrinho vazio';
  END IF;

  -- Resolve catalog_id from the first product
  SELECT catalog_id INTO v_catalog_id
  FROM public.products
  WHERE id = ((p_items -> 0) ->> 'productId')::uuid
  LIMIT 1;

  SELECT id INTO v_customer_id
  FROM public.customers
  WHERE whatsapp = btrim(p_whatsapp)
  LIMIT 1;

  IF v_customer_id IS NULL THEN
    INSERT INTO public.customers (name, whatsapp, cpf, origin, status, last_purchase, last_contact, orders_count, total_spent)
    VALUES (left(btrim(p_name), 120), btrim(p_whatsapp), nullif(left(btrim(coalesce(p_cpf, '')), 20), ''), 'site', 'cliente', now(), now(), 0, 0)
    RETURNING id INTO v_customer_id;
  ELSE
    UPDATE public.customers
    SET name = left(btrim(p_name), 120),
    cpf = coalesce(nullif(left(btrim(coalesce(p_cpf, '')), 20), ''), cpf),
    last_contact = now(),
    updated_at = now()
    WHERE id = v_customer_id;
  END IF;

  -- Insert order WITH customer data directly on the row
  INSERT INTO public.orders (customer_id, status, total, payment_method, notes, customer_name, customer_whatsapp, customer_cpf, catalog_id)
  VALUES (
    v_customer_id,
    'novo',
    0,
    CASE WHEN lower(coalesce(p_payment_method, 'pix')) = 'pix' THEN 'pix' ELSE 'pix' END,
    'Pedido iniciado pelo catálogo MB Moda Brasil',
    left(btrim(p_name), 120),
    btrim(p_whatsapp),
    nullif(left(btrim(coalesce(p_cpf, '')), 20), ''),
    v_catalog_id
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    IF (v_item ->> 'productId') !~ '^[0-9a-fA-F-]{36}$' THEN
      RAISE EXCEPTION 'produto invalido';
    END IF;

    v_quantity := least(greatest(coalesce((v_item ->> 'quantity')::int, 1), 1), 100);
    SELECT * INTO v_product
    FROM public.products
    WHERE id = (v_item ->> 'productId')::uuid
    AND active = true;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'produto indisponivel';
    END IF;

    v_unit_price := CASE
      WHEN v_product.promo_price IS NOT NULL AND v_product.promo_price < v_product.price THEN v_product.promo_price
      ELSE v_product.price
    END;
    v_size := left(coalesce(v_item ->> 'size', 'Único'), 40);
    v_color := left(coalesce(v_item ->> 'color', 'Único'), 40);

    INSERT INTO public.order_items (order_id, product_id, product_name, size, color, quantity, unit_price)
    VALUES (v_order_id, v_product.id, v_product.name, v_size, v_color, v_quantity, v_unit_price);

    v_total := v_total + (v_unit_price * v_quantity);
  END LOOP;

  UPDATE public.orders SET total = v_total WHERE id = v_order_id;
  UPDATE public.customers
  SET last_purchase = now(), last_contact = now(), orders_count = coalesce(orders_count, 0) + 1,
  total_spent = coalesce(total_spent, 0) + v_total,
  status = CASE WHEN coalesce(orders_count, 0) >= 1 THEN 'cliente recorrente' ELSE 'cliente' END,
  updated_at = now()
  WHERE id = v_customer_id;
  UPDATE public.leads SET status = 'cliente', last_interaction = now() WHERE whatsapp = btrim(p_whatsapp);

  RETURN v_order_id;
END;
$function$;
