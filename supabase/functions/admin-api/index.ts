import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// MB Admin API v2
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Admin-Token",
};

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
          .or(`visitor_id.eq.${id},whatsapp.eq.${id}`)
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
          .or(`customer_id.eq.${id},customer_whatsapp.eq.${wa}`)
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
      const { username, currentPassword, newPassword } = await req.json();
      const { data: admin } = await supabase
        .from("admin_users")
        .select("id, password_hash")
        .eq("username", username)
        .maybeSingle();
      if (!admin) return jsonError("Usuario nao encontrado", 404);

      const { data: valid } = await supabase.rpc("verify_password", {
        p_password: currentPassword,
        p_hash: admin.password_hash,
      });
      if (!valid) return jsonError("Senha atual incorreta", 401);

      const { data: newHash } = await supabase.rpc("hash_password", { p_password: newPassword });
      const { error } = await supabase
        .from("admin_users")
        .update({ password_hash: newHash, updated_at: new Date().toISOString() })
        .eq("id", admin.id);
      return okOrError({ success: true }, error);
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

    return jsonError("Recurso nao encontrado", 404);
  } catch (err) {
    return jsonError(err.message, 500);
  }
});

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
