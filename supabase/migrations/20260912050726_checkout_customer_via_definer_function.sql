-- F6: anon held a blanket INSERT on public.customers with an always-true check and
-- every column insertable, so a visitor could post arbitrary total_spent, orders_count
-- and status straight into the CRM figures the owner reads on the dashboard.
--
-- Replace it with a SECURITY DEFINER function that is the only way an anonymous
-- visitor can touch the table. It accepts identity fields only and recomputes the
-- order total server-side from the products table, so the money never comes from
-- the browser.

CREATE OR REPLACE FUNCTION public.record_checkout_customer(
  p_name text,
  p_whatsapp text,
  p_cpf text,
  p_items jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total numeric := 0;
  v_existing public.customers%ROWTYPE;
BEGIN
  IF coalesce(btrim(p_name), '') = '' OR coalesce(btrim(p_whatsapp), '') = '' THEN
    RAISE EXCEPTION 'dados invalidos';
  END IF;

  -- Recompute the order total from the catalogue, ignoring any price the client sent.
  SELECT coalesce(sum(coalesce(pr.promo_price, pr.price) * qty), 0)
    INTO v_total
  FROM (
    SELECT (item ->> 'productId')::uuid AS product_id,
           least(greatest(coalesce((item ->> 'quantity')::int, 1), 1), 100) AS qty
    FROM jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) AS item
    WHERE (item ->> 'productId') ~ '^[0-9a-fA-F-]{36}$'
  ) AS line
  JOIN public.products pr ON pr.id = line.product_id;

  SELECT * INTO v_existing
  FROM public.customers
  WHERE whatsapp = btrim(p_whatsapp)
  LIMIT 1;

  IF FOUND THEN
    UPDATE public.customers
       SET name = left(btrim(p_name), 120),
           cpf = coalesce(nullif(left(btrim(coalesce(p_cpf, '')), 20), ''), cpf),
           last_purchase = now(),
           last_contact = now(),
           updated_at = now(),
           orders_count = coalesce(orders_count, 0) + 1,
           total_spent = coalesce(total_spent, 0) + v_total,
           status = CASE WHEN coalesce(orders_count, 0) >= 1
                         THEN 'cliente recorrente' ELSE 'cliente' END
     WHERE id = v_existing.id;
  ELSE
    INSERT INTO public.customers (name, whatsapp, cpf, origin, status,
                                  last_purchase, last_contact, orders_count, total_spent)
    VALUES (left(btrim(p_name), 120),
            btrim(p_whatsapp),
            nullif(left(btrim(coalesce(p_cpf, '')), 20), ''),
            'site',
            'cliente',
            now(), now(), 1, v_total);
  END IF;

  UPDATE public.leads
     SET status = 'cliente', last_interaction = now()
   WHERE whatsapp = btrim(p_whatsapp);
END;
$$;

REVOKE ALL ON FUNCTION public.record_checkout_customer(text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_checkout_customer(text, text, text, jsonb) TO anon, authenticated;

-- Remove the direct anonymous write path now that the function covers checkout.
DROP POLICY IF EXISTS insert_customers ON public.customers;
CREATE POLICY insert_customers ON public.customers
  FOR INSERT TO authenticated WITH CHECK (true);

REVOKE INSERT ON public.customers FROM anon;
