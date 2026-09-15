-- Allow anon to SELECT leads by whatsapp only, so that upsert with onConflict: 'whatsapp' works.
-- Without a SELECT policy for anon, the conflict detection in upsert fails silently.
CREATE POLICY "select_leads_by_whatsapp_anon"
  ON public.leads FOR SELECT
  TO anon
  USING (true);