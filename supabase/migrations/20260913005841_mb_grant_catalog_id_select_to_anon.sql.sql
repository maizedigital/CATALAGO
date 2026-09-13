-- The storefront filters products by catalog_id using .eq('catalog_id', ...).
-- The anon role needs SELECT on catalog_id to apply that filter in RLS-protected queries.
GRANT SELECT (catalog_id) ON public.products TO anon;
