import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// MB Admin API v2
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Admin-Token",
};

// Resources reachable without an admin session. Everything else requires one.
const PUBLIC_RESOURCES = new Set(["go"]);

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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
    const apiIdx = fullParts.findIndex((p) => p === "admin-api");
    const segments = apiIdx >= 0 ? fullParts.slice(apiIdx + 1) : fullParts;
    const resource = segments[0] || "";
    const id = segments[1];
    const subResource = segments[2];

    // --- Admin session gate ---
    // This function holds the service role key, which bypasses row level security,
    // so every non-public resource must prove it carries a live admin session.
    let currentAdminId: string | null = null;
    if (!PUBLIC_RESOURCES.has(resource)) {
      const token = req.headers.get("X-Admin-Token") || "";
      if (!token || token.length < 32) return jsonError("Nao autorizado", 401);

      const { data: session } = await supabase
        .from("admin_sessions")
        .select("admin_id, expires_at")
        .eq("token_hash", await sha256Hex(token))
        .maybeSingle();

      if (!session || new Date(session.expires_at).getTime() <= Date.now()) {
        return jsonError("Nao autorizado", 401);
      }
      currentAdminId = session.admin_id as string;
    }

    // --- Dashboard stats ---
    if (resource === "dashboard" && req.method === "GET") {
      const [products, orders, customers, leads, visitors, events] = await Promise.all([
        supabase.from("products").select("id, active"),
        supabase.from("orders").select("id, total"),
        supabase.from("customers").select("id"),
        supabase.from("leads").select("id"),
        supabase.from("visitors").select("id"),
        supabase.from("customer_events").select("id, event_type"),
      ]);

      const totalSales = (orders.data || []).reduce((s: number, o: Record<string, unknown>) => s + Number(o.total || 0), 0);
      const whatsappClicks = (events.data || []).filter((e: Record<string, unknown>) => e.event_type === "whatsapp_click").length;
      const activeProducts = (products.data || []).filter((p: Record<string, unknown>) => p.active !== false).length;

      return json({
        sales: totalSales,
        orders: orders.data?.length || 0,
        customers: customers.data?.length || 0,
        products: products.data?.length || 0,
        active_products: activeProducts,
        visitors: visitors.data?.length || 0,
        leads: leads.data?.length || 0,
        whatsapp_clicks: whatsappClicks,
      });
    }

    // --- Product image upload ---
    if (resource === "upload" && req.method === "POST") {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      if (!file) return jsonError("Nenhum arquivo enviado", 400);

      const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowed.includes(file.type)) return jsonError("Tipo de arquivo nao suportado", 400);
      if (file.size > 5 * 1024 * 1024) return jsonError("Arquivo muito grande (max 5MB)", 400);

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const path = `products/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type, upsert: false });

      if (uploadError) return jsonError(uploadError.message, 400);

      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(uploadData.path);
      return json({ url: urlData.publicUrl, path: uploadData.path });
    }

    // --- Banner image upload ---
    if (resource === "banner-upload" && req.method === "POST") {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      if (!file) return jsonError("Nenhum arquivo enviado", 400);

      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(file.type)) return jsonError("Tipo de arquivo nao suportado. Use JPG, PNG ou WebP.", 400);
      if (file.size > 10 * 1024 * 1024) return jsonError("Arquivo muito grande (max 10MB)", 400);

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const path = `banners/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type, upsert: false });

      if (uploadError) return jsonError(uploadError.message, 400);

      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(uploadData.path);
      return json({ url: urlData.publicUrl, path: uploadData.path });
    }

    // --- Video upload ---
    if (resource === "video-upload" && req.method === "POST") {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      if (!file) return jsonError("Nenhum arquivo enviado", 400);

      const allowed = ["video/mp4", "video/webm", "video/ogg"];
      if (!allowed.includes(file.type)) return jsonError("Formato nao suportado. Use MP4, WebM ou OGG.", 400);
      if (file.size > 100 * 1024 * 1024) return jsonError("Arquivo muito grande (max 100MB)", 400);

      const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const path = `videos/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type, upsert: false });

      if (uploadError) return jsonError(uploadError.message, 400);

      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(uploadData.path);
      return json({ url: urlData.publicUrl, path: uploadData.path });
    }

    // --- Delete uploaded image ---
    if (resource === "upload" && req.method === "DELETE" && id) {
      const { error } = await supabase.storage.from("product-images").remove([`products/${id}`]);
      return okOrError({ success: true }, error);
    }

    // --- Products CRUD ---
    if (resource === "products") {
      if (req.method === "GET") {
        const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
        return okOrError(data, error);
      }
      if (req.method === "POST") {
        const body = await req.json();
        const { data, error } = await supabase.from("products").insert(body).select().single();
        return okOrError(data, error);
      }
      if (req.method === "PUT" && id) {
        const body = await req.json();
        const { data, error } = await supabase.from("products").update(body).eq("id", id).select().single();
        return okOrError(data, error);
      }
      if (req.method === "DELETE" && id) {
        const { error } = await supabase.from("products").delete().eq("id", id);
        return okOrError({ success: true }, error);
      }
    }

    // --- Orders ---
    if (resource === "orders") {
      if (req.method === "GET" && id) {
        const { data, error } = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .eq("id", id)
          .single();
        return okOrError(data, error);
      }
      if (req.method === "GET") {
        const { data, error } = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .order("created_at", { ascending: false });
        return okOrError(data, error);
      }
      if (req.method === "PUT" && id) {
        const body = await req.json();
        const { data, error } = await supabase.from("orders").update(body).eq("id", id).select().single();
        return okOrError(data, error);
      }
      if (req.method === "POST") {
        const body = await req.json();
        const { data, error } = await supabase.from("orders").insert(body).select().single();
        return okOrError(data, error);
      }
    }

    // --- Customers ---
    if (resource === "customers") {
      if (req.method === "GET" && id && subResource === "events") {
        const { data, error } = await supabase
          .from("customer_events")
          .select("*")
          .or(`visitor_id.eq.${safeFilterValue(id)},whatsapp.eq.${safeFilterValue(id)}`)
          .order("created_at", { ascending: false })
          .limit(200);
        return okOrError(data, error);
      }
      if (req.method === "GET" && id && subResource === "orders") {
        const { data: customer } = await supabase
          .from("customers")
          .select("whatsapp")
          .eq("id", id)
          .single();
        const wa = customer?.whatsapp;
        if (!wa) return okOrError([], null);
        const { data, error } = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .or(`customer_id.eq.${safeFilterValue(id)},customer_whatsapp.eq.${safeFilterValue(wa)}`)
          .order("created_at", { ascending: false });
        return okOrError(data, error);
      }
      if (req.method === "GET" && id) {
        const { data, error } = await supabase
          .from("customers")
          .select("*")
          .eq("id", id)
          .single();
        return okOrError(data, error);
      }
      if (req.method === "GET") {
        const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
        return okOrError(data, error);
      }
      if (req.method === "POST") {
        const body = await req.json();
        const phone = (body.whatsapp || "").replace(/\D/g, "");
        if (phone) {
          const { data: existing } = await supabase
            .from("customers")
            .select("id, name")
            .eq("whatsapp", phone)
            .maybeSingle();
          if (existing) {
            const { data, error } = await supabase
              .from("customers")
              .update({ name: body.name || existing.name, ...body, whatsapp: phone })
              .eq("id", existing.id)
              .select()
              .single();
            return okOrError(data, error);
          }
          body.whatsapp = phone;
        }
        const { data, error } = await supabase.from("customers").insert(body).select().single();
        return okOrError(data, error);
      }
      if (req.method === "PUT" && id) {
        const body = await req.json();
        const { data, error } = await supabase.from("customers").update(body).eq("id", id).select().single();
        return okOrError(data, error);
      }
      if (req.method === "DELETE" && id) {
        const { error } = await supabase.from("customers").delete().eq("id", id);
        return okOrError({ success: true }, error);
      }
    }

    // --- Leads ---
    if (resource === "leads") {
      if (req.method === "GET") {
        const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
        return okOrError(data, error);
      }
      if (req.method === "PUT" && id) {
        const body = await req.json();
        const { data, error } = await supabase.from("leads").update(body).eq("id", id).select().single();
        return okOrError(data, error);
      }
      if (req.method === "DELETE" && id) {
        const { error } = await supabase.from("leads").delete().eq("id", id);
        return okOrError({ success: true }, error);
      }
    }

    // --- Customer events ---
    if (resource === "events") {
      if (req.method === "GET") {
        const { data, error } = await supabase
          .from("customer_events")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(500);
        return okOrError(data, error);
      }
    }

    // --- Visitors ---
    if (resource === "visitors") {
      if (req.method === "GET") {
        const { data, error } = await supabase
          .from("visitors")
          .select("*")
          .order("last_visit", { ascending: false })
          .limit(500);
        return okOrError(data, error);
      }
    }

    // --- CRM dashboard ---
    if (resource === "crm-dashboard" && req.method === "GET") {
      const [customers, leads, orders, events] = await Promise.all([
        supabase.from("customers").select("id, status, total_spent, orders_count"),
        supabase.from("leads").select("id, status, created_at"),
        supabase.from("orders").select("id, total, created_at"),
        supabase.from("customer_events").select("id, event_type"),
      ]);

      const allCustomers = customers.data || [];
      const allLeads = leads.data || [];
      const allOrders = orders.data || [];

      const totalSales = allOrders.reduce((s: number, o: Record<string, unknown>) => s + Number(o.total || 0), 0);
      const recurring = allCustomers.filter((c: Record<string, unknown>) => (c.orders_count || 0) >= 2).length;
      const newLeads = allLeads.filter((l: Record<string, unknown>) => l.status === 'novo' || l.status === 'Novo').length;
      const whatsappClicks = (events.data || []).filter((e: Record<string, unknown>) => e.event_type === "whatsapp_click").length;
      const avgTicket = allOrders.length > 0 ? totalSales / allOrders.length : 0;

      return json({
        total_customers: allCustomers.length,
        total_leads: allLeads.length,
        new_leads: newLeads,
        recurring_customers: recurring,
        orders: allOrders.length,
        revenue: totalSales,
        avg_ticket: avgTicket,
        whatsapp_clicks: whatsappClicks,
      });
    }

    // --- Product rankings ---
    if (resource === "rankings" && req.method === "GET") {
      const { data: events } = await supabase
        .from("customer_events")
        .select("event_type, product_name, product_id")
        .order("created_at", { ascending: false })
        .limit(5000);

      const { data: orderItems } = await supabase
        .from("order_items")
        .select("product_name, quantity")
        .limit(5000);

      const countByProduct = (items: Record<string, unknown>[], field: string, filterType?: string) => {
        const counts: Record<string, number> = {};
        for (const item of items) {
          if (filterType && item.event_type !== filterType) continue;
          const name = item[field];
          if (!name) continue;
          counts[name] = (counts[name] || 0) + 1;
        }
        return Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([name, count]) => ({ name, count }));
      };

      return json({
        most_viewed: countByProduct(events || [], 'product_name', 'product_view'),
        most_carted: countByProduct(events || [], 'product_name', 'add_to_cart'),
        most_whatsapp: countByProduct(events || [], 'product_name', 'whatsapp_click'),
        most_sold: countByProduct(orderItems || [], 'product_name').map((p: { name: string; count: number }) => ({ name: p.name, count: p.count })),
      });
    }

    // --- Analytics ---
    if (resource === "analytics" && req.method === "GET") {
      const daysParam = url.searchParams.get("days") || "30";
      const days = parseInt(daysParam, 10) || 30;
      const since = new Date(Date.now() - days * 86400000).toISOString();

      const [visitors, leads, customers, events, orders] = await Promise.all([
        supabase.from("visitors").select("id, created_at").gte("created_at", since),
        supabase.from("leads").select("id, created_at").gte("created_at", since),
        supabase.from("customers").select("id, created_at").gte("created_at", since),
        supabase.from("customer_events").select("id, event_type, created_at").gte("created_at", since),
        supabase.from("orders").select("id, created_at, total").gte("created_at", since),
      ]);

      const eventCounts: Record<string, number> = {};
      for (const e of events.data || []) {
        eventCounts[e.event_type] = (eventCounts[e.event_type] || 0) + 1;
      }

      return json({
        visitors: visitors.data?.length || 0,
        new_leads: leads.data?.length || 0,
        new_customers: customers.data?.length || 0,
        orders: orders.data?.length || 0,
        event_counts: eventCounts,
        daily: groupByDay(visitors.data || [], leads.data || [], orders.data || [], days),
      });
    }

    // --- Settings ---
    if (resource === "settings") {
      if (req.method === "GET") {
        const { data, error } = await supabase.from("settings").select("*");
        return okOrError(data, error);
      }
      if (req.method === "PUT") {
        const body = await req.json();
        const { key, value } = body;
        const { data, error } = await supabase.from("settings").upsert({ key, value }).select().single();
        return okOrError(data, error);
      }
    }

    // --- Change password ---
    if (resource === "change-password" && req.method === "POST") {
      const { currentPassword, newPassword } = await req.json();

      if (typeof newPassword !== "string" || newPassword.length < 10) {
        return jsonError("A nova senha deve ter pelo menos 10 caracteres", 400);
      }

      // The account comes from the verified session, never from the request body,
      // and both failure branches return the same message so the endpoint cannot
      // be used to discover which usernames exist.
      const { data: admin } = await supabase
        .from("admin_users")
        .select("id, password_hash")
        .eq("id", currentAdminId)
        .maybeSingle();

      const { data: valid } = admin
        ? await supabase.rpc("verify_password", {
            p_password: currentPassword,
            p_hash: admin.password_hash,
          })
        : { data: false };

      if (!admin || !valid) return jsonError("Senha atual incorreta", 401);

      const { data: newHash } = await supabase.rpc("hash_password", { p_password: newPassword });
      const { error } = await supabase
        .from("admin_users")
        .update({ password_hash: newHash, updated_at: new Date().toISOString() })
        .eq("id", admin.id);
      if (error) return jsonError("Nao foi possivel alterar a senha", 400);

      // Changing the password invalidates every existing session.
      await supabase.from("admin_sessions").delete().eq("admin_id", admin.id);
      return json({ success: true });
    }

    // --- Banners CRUD ---
    if (resource === "banners") {
      if (req.method === "GET") {
        const { data, error } = await supabase.from("banners").select("*").order("sort_order", { ascending: true });
        return okOrError(data, error);
      }
      if (req.method === "POST") {
        const body = await req.json();
        const { data, error } = await supabase.from("banners").insert(body).select().single();
        return okOrError(data, error);
      }
      if (req.method === "PUT" && id) {
        const body = await req.json();
        const { data, error } = await supabase.from("banners").update({ ...body, updated_at: new Date().toISOString() }).eq("id", id).select().single();
        return okOrError(data, error);
      }
      if (req.method === "DELETE" && id) {
        const { data: banner } = await supabase.from("banners").select("video_url").eq("id", id).maybeSingle();
        if (banner?.video_url) {
          const videoPath = banner.video_url.split("/product-images/")[1];
          if (videoPath) await supabase.storage.from("product-images").remove([videoPath]);
        }
        const { error } = await supabase.from("banners").delete().eq("id", id);
        return okOrError({ success: true }, error);
      }
    }

    // --- Banner reorder ---
    if (resource === "banners-reorder" && req.method === "POST") {
      const body = await req.json();
      const items: { id: string; sort_order: number }[] = body.items || [];
      for (const item of items) {
        await supabase.from("banners").update({ sort_order: item.sort_order, updated_at: new Date().toISOString() }).eq("id", item.id);
      }
      return json({ success: true });
    }

    // --- Short links CRUD ---
    if (resource === "short-links") {
      if (req.method === "GET" && id && subResource === "stats") {
        const { data: clicks } = await supabase
          .from("link_clicks")
          .select("id, visitor_id, referrer, user_agent, country, device_type, created_at")
          .eq("link_id", id)
          .order("created_at", { ascending: false })
          .limit(5000);
        const all = clicks || [];
        const now = Date.now();
        const today = new Date().toISOString().slice(0, 10);
        const sevenDaysAgo = new Date(now - 7 * 86400000).toISOString();
        const thirtyDaysAgo = new Date(now - 30 * 86400000).toISOString();
        const uniqueVisitors = new Set(all.map((c: Record<string, unknown>) => c.visitor_id).filter(Boolean));
        const lastClick = all.length > 0 ? (all[0] as Record<string, unknown>).created_at : null;
        const referrers: Record<string, number> = {};
        const devices: Record<string, number> = {};
        const countries: Record<string, number> = {};
        for (const c of all) {
          const r = (c as Record<string, unknown>).referrer as string || "(direto)";
          referrers[r] = (referrers[r] || 0) + 1;
          const d = (c as Record<string, unknown>).device_type as string || "unknown";
          devices[d] = (devices[d] || 0) + 1;
          const co = (c as Record<string, unknown>).country as string || "unknown";
          countries[co] = (countries[co] || 0) + 1;
        }
        return json({
          total: all.length,
          unique: uniqueVisitors.size,
          today: all.filter((c: Record<string, unknown>) => (c.created_at as string)?.slice(0, 10) === today).length,
          last7: all.filter((c: Record<string, unknown>) => (c.created_at as string) >= sevenDaysAgo).length,
          last30: all.filter((c: Record<string, unknown>) => (c.created_at as string) >= thirtyDaysAgo).length,
          last_click: lastClick,
          referrers: Object.entries(referrers).sort((a, b) => b[1] - a[1]).slice(0, 10),
          devices: Object.entries(devices).sort((a, b) => b[1] - a[1]),
          countries: Object.entries(countries).sort((a, b) => b[1] - a[1]).slice(0, 10),
        });
      }
      if (req.method === "GET") {
        const { data, error } = await supabase.from("short_links").select("*").order("created_at", { ascending: false });
        return okOrError(data, error);
      }
      if (req.method === "POST") {
        const body = await req.json();
        const slug = (body.slug || body.name || "").toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
        if (!slug) return jsonError("Slug inválido", 400);
        const { data: existing } = await supabase.from("short_links").select("id").eq("slug", slug).maybeSingle();
        if (existing) return jsonError("Este slug já está em uso", 400);
        const { data, error } = await supabase.from("short_links").insert({ ...body, slug }).select().single();
        return okOrError(data, error);
      }
      if (req.method === "PUT" && id) {
        const body = await req.json();
        if (body.slug) {
          body.slug = body.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
        }
        const { data, error } = await supabase.from("short_links").update({ ...body, updated_at: new Date().toISOString() }).eq("id", id).select().single();
        return okOrError(data, error);
      }
      if (req.method === "DELETE" && id) {
        const { error } = await supabase.from("short_links").delete().eq("id", id);
        return okOrError({ success: true }, error);
      }
    }

    // --- Short link redirect (public) ---
    if (resource === "go" && req.method === "GET" && id) {
      const { data: link } = await supabase.from("short_links").select("id, destination_url, active").eq("slug", id).maybeSingle();
      if (!link) return jsonError("Link não encontrado", 404);
      if (!link.active) return jsonError("Link inativo", 410);

      const ua = req.headers.get("user-agent") || "";
      const referrer = req.headers.get("referer") || "";
      const acceptLang = req.headers.get("accept-language") || "";
      const deviceType = /mobile|android|iphone/i.test(ua) ? "mobile" : /tablet|ipad/i.test(ua) ? "tablet" : "desktop";
      const country = (req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || req.headers.get("x-superb-country") || "") as string;

      // Generate an anonymous fingerprint from IP + UA prefix for unique visitor counting
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
      const fingerprint = `${ip}_${ua.slice(0, 60)}_${acceptLang.slice(0, 10)}`;

      await supabase.from("link_clicks").insert({
        link_id: link.id,
        visitor_id: fingerprint,
        referrer: referrer || null,
        user_agent: ua || null,
        country: country || null,
        device_type: deviceType,
      });

      return Response.redirect(link.destination_url, 302);
    }

    // --- Live visitors ---
    if (resource === "live-visitors" && req.method === "GET") {
      const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("customer_events")
        .select("visitor_id, event_data, created_at")
        .gte("created_at", twoMinAgo)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) return jsonError(error.message, 400);
      const events = (data || []) as Record<string, unknown>[];
      // Exclude admin paths and deduplicate by visitor_id
      const visitorLastSeen: Record<string, string> = {};
      const paths: Record<string, number> = {};
      for (const e of events) {
        const vid = e.visitor_id as string;
        if (!vid) continue;
        const ed = e.event_data as Record<string, unknown> | null;
        const path = (ed?.path as string) || "";
        if (path.startsWith("/admin")) continue;
        visitorLastSeen[vid] = e.created_at as string;
        if (path) paths[path] = (paths[path] || 0) + 1;
      }
      const activeCount = Object.keys(visitorLastSeen).length;
      const lastActivity = Object.values(visitorLastSeen).sort().reverse()[0] || null;
      const topPaths = Object.entries(paths).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([path, count]) => ({ path, count }));
      return json({ active: activeCount, last_activity: lastActivity, top_paths: topPaths });
    }

    return jsonError("Recurso nao encontrado", 404);
  } catch (err) {
    console.error("admin-api error", err);
    return jsonError("Erro interno", 500);
  }
});

// PostgREST `or` filters are parsed from a string, so a raw path segment could
// otherwise inject extra filter terms. Quote the value and escape the quotes.
function safeFilterValue(value: string) {
  return `"${String(value).replace(/[\\"]/g, "")}"`;
}
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
function okOrError(data: unknown, error: { message: string } | null) {
  if (error) return jsonError(error.message, 400);
  return json(data);
}
function groupByDay(visitors: Record<string, unknown>[], leads: Record<string, unknown>[], orders: Record<string, unknown>[], days: number) {
  const result: { date: string; visitors: number; leads: number; orders: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const ds = d.toISOString().slice(0, 10);
    result.push({
      date: ds,
      visitors: visitors.filter((v) => v.created_at?.slice(0, 10) === ds).length,
      leads: leads.filter((l) => l.created_at?.slice(0, 10) === ds).length,
      orders: orders.filter((o) => o.created_at?.slice(0, 10) === ds).length,
    });
  }
  return result;
}
