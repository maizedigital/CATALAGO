-- The storefront reads products with the anon key. Cost price, supplier, barcode,
-- NCM, weight, dimensions and stock_minimum are internal business data and were
-- being served to anyone. Narrow the anon SELECT grant to the public catalogue
-- columns; the storefront queries now request those columns explicitly, and the
-- admin panel reads through the service role, which is unaffected.

REVOKE SELECT ON public.products FROM anon;

GRANT SELECT (
  id, sku, name, slug, category, subcategory, gender, product_type, description,
  price, promo_price, images, sizes, colors, stock, featured, bestseller,
  new_arrival, on_sale, active, created_at
) ON public.products TO anon;
