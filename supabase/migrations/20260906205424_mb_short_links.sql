/*
# Short links with click statistics

1. New Tables
- `short_links`
  - id (uuid, primary key)
  - slug (text, unique, not null) — the short code in the URL
  - name (text, not null) — internal label for the admin
  - destination_url (text, not null) — where the short link redirects
  - active (boolean, default true)
  - created_at, updated_at (timestamptz)
- `link_clicks`
  - id (uuid, primary key)
  - link_id (uuid, references short_links, cascade delete)
  - visitor_id (text, nullable) — reused from tracking visitor ID
  - referrer (text, nullable)
  - user_agent (text, nullable)
  - country (text, nullable)
  - device_type (text, nullable) — 'mobile' | 'desktop' | 'tablet'
  - created_at (timestamptz, default now())

2. Security
- RLS enabled on both tables.
- short_links: admin-only CRUD (TO authenticated). Public reads via the edge function using service role key.
- link_clicks: public INSERT (anon + authenticated) so the redirect endpoint can log clicks; SELECT admin-only (authenticated).
*/

CREATE TABLE IF NOT EXISTS short_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  destination_url text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE short_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_short_links" ON short_links;
CREATE POLICY "read_short_links" ON short_links FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_short_links" ON short_links;
CREATE POLICY "insert_short_links" ON short_links FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_short_links" ON short_links;
CREATE POLICY "update_short_links" ON short_links FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_short_links" ON short_links;
CREATE POLICY "delete_short_links" ON short_links FOR DELETE
  TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS link_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid REFERENCES short_links(id) ON DELETE CASCADE,
  visitor_id text,
  referrer text,
  user_agent text,
  country text,
  device_type text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_link_clicks" ON link_clicks;
CREATE POLICY "insert_link_clicks" ON link_clicks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "read_link_clicks" ON link_clicks;
CREATE POLICY "read_link_clicks" ON link_clicks FOR SELECT
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_link_clicks_link_id ON link_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_created_at ON link_clicks(created_at);
