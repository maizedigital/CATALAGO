ALTER TABLE banners
  ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES products(id) ON DELETE SET NULL;

COMMENT ON COLUMN banners.media_type IS 'image | video';
COMMENT ON COLUMN banners.video_url IS 'URL do arquivo de vídeo no storage (quando media_type = video)';
COMMENT ON COLUMN banners.product_id IS 'Produto relacionado ao banner/vídeo — usado para gerar link de destino automático';
