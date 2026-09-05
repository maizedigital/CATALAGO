import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Admin-Token",
};

const OPENWA_API_URL = Deno.env.get("OPENWA_API_URL") || "";
const OPENWA_API_KEY = Deno.env.get("OPENWA_API_KEY") || "";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizePhone(raw: string): string {
  return raw.replace(/[@].*$/, "").replace(/[^\d]/g, "");
}

async function proxyToOpenWA(path: string, method: string, body: string | null, url: URL): Promise<Response> {
  if (!OPENWA_API_URL || !OPENWA_API_KEY) {
    return jsonError("OpenWA não configurado. Defina OPENWA_API_URL e OPENWA_API_KEY nas variáveis de ambiente.", 503);
  }
  const openwaUrl = `${OPENWA_API_URL}/api/${path}${url.search}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-API-Key": OPENWA_API_KEY,
  };
  const init: RequestInit = { method, headers };
  if (body && (method === "POST" || method === "PUT")) init.body = body;

  const openwaRes = await fetch(openwaUrl, init);
  const openwaData = await openwaRes.text();
  return new Response(openwaData, {
    status: openwaRes.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const url = new URL(req.url);
    const fullParts = url.pathname.split("/").filter(Boolean);
    const apiIdx = fullParts.findIndex((p) => p === "whatsapp-api");
    const segments = apiIdx >= 0 ? fullParts.slice(apiIdx + 1) : fullParts;
    const resource = segments[0] || "";
    const id = segments[1];
    const subResource = segments[2];

    // --- Webhook receiver (called by OpenWA) ---
    if (resource === "webhook" && req.method === "POST") {
      const event = await req.json();

      const webhookSecret = Deno.env.get("OPENWA_WEBHOOK_SECRET") || "";
      if (webhookSecret) {
        const signature = req.headers.get("X-OpenWA-Signature") || "";
        const expectedSig = await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(webhookSecret + JSON.stringify(event))
        );
        const expectedHex = Array.from(new Uint8Array(expectedSig))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        if (signature !== expectedHex) return jsonError("Invalid signature", 401);
      }

      const eventType = event.event || event.type || "";

      if (eventType === "session.status") {
        const status = event.data?.status || event.session?.status || event.status;
        await supabase.from("settings").upsert({
          key: "wa_connection_status",
          value: { status, updated_at: new Date().toISOString() },
        });
        return json({ received: true });
      }

      if (eventType === "message.received" || eventType === "message") {
        const msg = event.data || event.message || event;
        const fromRaw = msg.from || msg.sender || msg.chatId || "";
        const phone = normalizePhone(fromRaw);
        const body = msg.body || msg.text || msg.content || "";
        const messageId = msg.id || msg.messageId || msg.key?.id || "";
        const mediaUrl = msg.mediaUrl || msg.media?.url || null;
        const mediaType = msg.mediaType || msg.media?.type || null;

        if (!phone) return json({ received: true, skipped: "no_phone" });

        if (messageId) {
          const { data: existing } = await supabase
            .from("wa_messages").select("id").eq("message_id", messageId).maybeSingle();
          if (existing) return json({ received: true, dedup: true });
        }

        let conversationId: string;
        const { data: existingConv } = await supabase
          .from("wa_conversations").select("id, customer_id, lead_id").eq("phone", phone).maybeSingle();

        if (existingConv) {
          conversationId = existingConv.id;
        } else {
          const { data: customer } = await supabase
            .from("customers").select("id, name").eq("whatsapp", phone).maybeSingle();

          let leadId: string | null = null;
          if (!customer) {
            const { data: lead } = await supabase
              .from("leads").select("id, name").eq("whatsapp", phone).maybeSingle();
            if (lead) leadId = lead.id;
          }

          if (!customer && !leadId) {
            const { data: newLead } = await supabase.from("leads").insert({
              name: msg.pushName || msg.notifyName || `WhatsApp ${phone}`,
              whatsapp: phone, origin: "whatsapp", status: "novo",
              last_interaction: "Mensagem recebida via WhatsApp",
            }).select("id").single();
            if (newLead) leadId = newLead.id;
          }

          const { data: newConv } = await supabase.from("wa_conversations").insert({
            phone, phone_raw: fromRaw,
            contact_name: msg.pushName || msg.notifyName || (customer?.name || ""),
            customer_id: customer?.id || null, lead_id: leadId,
            last_message: body.slice(0, 200), last_message_at: new Date().toISOString(),
            last_direction: "in", unread_count: 1,
          }).select("id").single();

          if (!newConv) return jsonError("Failed to create conversation", 500);
          conversationId = newConv.id;
        }

        await supabase.from("wa_messages").insert({
          conversation_id: conversationId, phone, direction: "in",
          body, media_url: mediaUrl, media_type: mediaType,
          message_id: messageId, status: "delivered",
        });

        await supabase.from("wa_conversations").update({
          last_message: body.slice(0, 200), last_message_at: new Date().toISOString(),
          last_direction: "in", unread_count: 1, updated_at: new Date().toISOString(),
        }).eq("id", conversationId);

        if (existingConv?.customer_id) {
          await supabase.from("customers")
            .update({ last_contact: new Date().toISOString(), updated_at: new Date().toISOString() })
            .eq("id", existingConv.customer_id);
        } else if (existingConv?.lead_id) {
          await supabase.from("leads")
            .update({ last_interaction: "Mensagem recebida via WhatsApp", updated_at: new Date().toISOString() })
            .eq("id", existingConv.lead_id);
        }

        return json({ received: true });
      }

      return json({ received: true, unknown_event: eventType });
    }

    // --- GET status — check OpenWA session + local settings ---
    if (resource === "status" && req.method === "GET") {
      if (!OPENWA_API_URL || !OPENWA_API_KEY) {
        return json({ error: "OpenWA não configurado" }, 503);
      }

      // Check local settings for last known status
      const { data: setting } = await supabase
        .from("settings").select("value").eq("key", "wa_connection_status").maybeSingle();

      // Try to get live status from OpenWA
      try {
        const res = await fetch(`${OPENWA_API_URL}/api/sessions`, {
          headers: { "X-API-Key": OPENWA_API_KEY },
        });
        if (!res.ok) {
          return json({
            status: setting?.value?.status || "disconnected",
            updated_at: setting?.value?.updated_at,
          });
        }
        const sessions = await res.json();
        const mbSession = Array.isArray(sessions)
          ? sessions.find((s: Record<string, unknown>) => s.name === "mb" || s.name === "default")
          : sessions;

        if (mbSession) {
          const status = mbSession.status || mbSession.state || "disconnected";
          const phone = mbSession.phone || mbSession.wid || null;
          const qr = mbSession.qr || mbSession.qrCode || null;
          return json({ status, phone, qr, updated_at: new Date().toISOString() });
        }

        return json({
          status: setting?.value?.status || "disconnected",
          updated_at: setting?.value?.updated_at,
        });
      } catch {
        return json({
          status: setting?.value?.status || "disconnected",
          updated_at: setting?.value?.updated_at,
        });
      }
    }

    // --- GET conversations — list from Supabase ---
    if (resource === "conversations" && req.method === "GET") {
      const { data, error } = await supabase
        .from("wa_conversations")
        .select("*")
        .order("last_message_at", { ascending: false });
      if (error) return jsonError(error.message, 400);
      return json(data);
    }

    // --- GET conversations/:id/messages ---
    if (resource === "conversations" && id && subResource === "messages" && req.method === "GET") {
      const { data, error } = await supabase
        .from("wa_messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) return jsonError(error.message, 400);
      return json(data);
    }

    // --- PUT conversations/:id — update (e.g., mark as read) ---
    if (resource === "conversations" && id && req.method === "PUT") {
      const body = await req.json();
      const { unread_count } = body;
      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (typeof unread_count === "number") updateData.unread_count = unread_count;
      const { data, error } = await supabase
        .from("wa_conversations").update(updateData).eq("id", id).select().single();
      if (error) return jsonError(error.message, 400);
      return json(data);
    }

    // --- POST send — send via OpenWA + save to DB ---
    if (resource === "send" && req.method === "POST") {
      if (!OPENWA_API_URL || !OPENWA_API_KEY) {
        return jsonError("OpenWA não configurado", 503);
      }
      const { chatId, text } = await req.json();
      if (!chatId || !text) return jsonError("chatId e text sao obrigatorios", 400);

      const phone = normalizePhone(chatId);

      // Send via OpenWA
      const openwaRes = await fetch(`${OPENWA_API_URL}/api/messages/send-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": OPENWA_API_KEY },
        body: JSON.stringify({ session: "mb", chatId, text }),
      });

      if (!openwaRes.ok) {
        const errData = await openwaRes.text();
        return jsonError(`OpenWA: ${errData}`, openwaRes.status);
      }

      const sendResult = await openwaRes.json();
      const messageId = sendResult?.id || sendResult?.messageId || null;

      // Save outgoing message to DB
      const { data: conv } = await supabase
        .from("wa_conversations").select("id").eq("phone", phone).maybeSingle();

      if (conv) {
        await supabase.from("wa_messages").insert({
          conversation_id: conv.id, phone, direction: "out",
          body: text, message_id: messageId, status: "sent",
        });
        await supabase.from("wa_conversations").update({
          last_message: text.slice(0, 200), last_message_at: new Date().toISOString(),
          last_direction: "out", updated_at: new Date().toISOString(),
        }).eq("id", conv.id);
      }

      return json({ success: true, messageId });
    }

    // --- Proxy remaining requests to OpenWA (sessions, etc.) ---
    return proxyToOpenWA(segments.join("/"), req.method, await req.text(), url);
  } catch (err) {
    return jsonError(err.message, 500);
  }
});
