/*
# Add responsive banner assets

1. Modified table
- `banners`
  - `display_mode` stores whether a campaign is mobile-only or responsive.
  - `mobile_image_url` stores the priority mobile image.
  - `desktop_image_url` stores the optional desktop image.
  - `mobile_video_url` stores the priority mobile video.
  - `desktop_video_url` stores the optional desktop video.

2. Compatibility
- Existing `image_url` and `video_url` values remain unchanged and continue to act as fallbacks.

3. Security
- No access model changes. Existing banner policies continue to apply.
*/

ALTER TABLE banners ADD COLUMN IF NOT EXISTS display_mode text NOT NULL DEFAULT 'mobile_only';
ALTER TABLE banners ADD COLUMN IF NOT EXISTS mobile_image_url text;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS desktop_image_url text;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS mobile_video_url text;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS desktop_video_url text;
