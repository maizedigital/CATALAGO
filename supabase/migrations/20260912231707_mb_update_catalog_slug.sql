-- Update MB catalog slug to match the enviey.app routing structure
UPDATE public.catalogs
SET slug = 'mb-moda-brasil',
    name = 'MB Moda Brasil',
    updated_at = now()
WHERE slug = 'mb';
