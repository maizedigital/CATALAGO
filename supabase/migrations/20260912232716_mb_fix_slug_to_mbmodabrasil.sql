-- Update MB catalog slug from 'mb-moda-brasil' to 'mbmodabrasil'
UPDATE public.catalogs
SET slug = 'mbmodabrasil',
    updated_at = now()
WHERE slug = 'mb-moda-brasil';
