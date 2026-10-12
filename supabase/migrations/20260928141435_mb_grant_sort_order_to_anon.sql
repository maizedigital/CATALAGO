/*
# Grant SELECT on sort_order to anon

The migration 20260912050824 column-level granted SELECT to anon on specific
public-facing product columns but did not include sort_order (added later).
The storefront queries sort_order in its SELECT list, which causes a
permission error under the anon key and returns zero products.

This adds sort_order to the anon column-level grant. No data changes.
*/

GRANT SELECT (sort_order) ON public.products TO anon;
