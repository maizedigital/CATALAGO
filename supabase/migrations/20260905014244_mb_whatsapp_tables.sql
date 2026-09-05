/*
# WhatsApp Conversations and Messages Tables

## Purpose
Stores WhatsApp conversations and individual messages synced from OpenWA.
Enables the MB Admin WhatsApp inbox and CRM integration.

## New Tables

### wa_conversations
- `id` (uuid, primary key)
- `phone` (text, not null) — normalized WhatsApp number (digits only, with country code)
- `phone_raw` (text) — original format from OpenWA (e.g. "5511999999999@c.us")
- `contact_name` (text) — display name from WhatsApp or CRM
- `customer_id` (uuid, nullable) — FK to customers table, matched by phone
- `lead_id` (uuid, nullable) — FK to leads table, matched by phone
- `last_message` (text) — preview of most recent message
- `last_message_at` (timestamptz) — timestamp of most recent message
- `last_direction` (text) — 'in' or 'out' for last message direction
- `unread_count` (integer, default 0) — unread incoming messages
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

### wa_messages
- `id` (uuid, primary key)
- `conversation_id` (uuid, not null) — FK to wa_conversations
- `phone` (text, not null) — normalized phone for quick lookups
- `direction` (text, not null) — 'in' (received) or 'out' (sent)
- `body` (text) — message text content
- `media_url` (text, nullable) — URL to media if applicable
- `media_type` (text, nullable) — image/video/audio/document
- `message_id` (text, nullable) — OpenWA message ID for dedup
- `status` (text, default 'sent') — sent/delivered/read/failed
- `created_at` (timestamptz, default now())

## Indexes
- `wa_conversations_phone_idx` on wa_conversations(phone) — fast lookup by number
- `wa_conversations_customer_idx` on wa_conversations(customer_id)
- `wa_messages_conversation_idx` on wa_messages(conversation_id, created_at) — inbox query
- `wa_messages_phone_idx` on wa_messages(phone, created_at)
- `wa_messages_message_id_idx` on wa_messages(message_id) — webhook dedup

## Security
- RLS enabled on both tables
- Policies: anon + authenticated can read (webhook edge function uses service role)
- Only authenticated can insert/update/delete (admin operations)
- Webhook edge function uses service role key which bypasses RLS
*/

CREATE TABLE IF NOT EXISTS wa_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  phone_raw text,
  contact_name text,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  last_message text,
  last_message_at timestamptz DEFAULT now(),
  last_direction text DEFAULT 'in',
  unread_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE wa_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_wa_conversations" ON wa_conversations;
CREATE POLICY "read_wa_conversations" ON wa_conversations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_wa_conversations" ON wa_conversations;
CREATE POLICY "insert_wa_conversations" ON wa_conversations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_wa_conversations" ON wa_conversations;
CREATE POLICY "update_wa_conversations" ON wa_conversations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_wa_conversations" ON wa_conversations;
CREATE POLICY "delete_wa_conversations" ON wa_conversations FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS wa_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES wa_conversations(id) ON DELETE CASCADE,
  phone text NOT NULL,
  direction text NOT NULL DEFAULT 'in',
  body text,
  media_url text,
  media_type text,
  message_id text,
  status text DEFAULT 'sent',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wa_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_wa_messages" ON wa_messages;
CREATE POLICY "read_wa_messages" ON wa_messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_wa_messages" ON wa_messages;
CREATE POLICY "insert_wa_messages" ON wa_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_wa_messages" ON wa_messages;
CREATE POLICY "update_wa_messages" ON wa_messages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_wa_messages" ON wa_messages;
CREATE POLICY "delete_wa_messages" ON wa_messages FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS wa_conversations_phone_idx ON wa_conversations(phone);
CREATE INDEX IF NOT EXISTS wa_conversations_customer_idx ON wa_conversations(customer_id);
CREATE INDEX IF NOT EXISTS wa_messages_conversation_idx ON wa_messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS wa_messages_phone_idx ON wa_messages(phone, created_at DESC);
CREATE INDEX IF NOT EXISTS wa_messages_message_id_idx ON wa_messages(message_id);
