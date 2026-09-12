import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { store_name, slug, email, password, template_slug } = await req.json();

    if (!store_name || !slug || !email || !password) {
      return jsonError("Todos os campos são obrigatórios", 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase.rpc("signup_tenant", {
      p_store_name: store_name,
      p_slug: slug,
      p_email: email,
      p_password: password,
      p_template_slug: template_slug || "mbmodabrasil",
    });

    if (error) {
      const msg = error.message || "Erro ao criar conta";
      if (msg.includes("já está em uso")) {
        return jsonError("Este endereço de loja já está em uso. Escolha outro.", 409);
      }
      if (msg.includes("Slug inválido")) {
        return jsonError("Endereço de loja inválido. Use apenas letras, números e hífens.", 400);
      }
      if (msg.includes("senha")) {
        return jsonError("A senha deve ter pelo menos 4 caracteres.", 400);
      }
      if (msg.includes("E-mail")) {
        return jsonError("E-mail inválido.", 400);
      }
      return jsonError("Não foi possível criar a conta. Tente novamente.", 400);
    }

    if (!data || data.length === 0) {
      return jsonError("Não foi possível criar a conta.", 500);
    }

    const result = data[0];

    // Issue a session token so the user is immediately logged in
    const raw = new Uint8Array(32);
    crypto.getRandomValues(raw);
    const token = Array.from(raw)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const tokenHash = await sha256Hex(token);
    const expiresAt = new Date(Date.now() + 12 * 3600 * 1000).toISOString();

    await supabase.from("admin_sessions").insert({
      admin_id: result.admin_id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

    return new Response(
      JSON.stringify({
        token,
        username: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""),
        id: result.admin_id,
        catalog_id: result.catalog_id,
        catalog_slug: result.catalog_slug,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("tenant-signup error", err);
    return jsonError("Erro interno. Tente novamente.", 500);
  }
});

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
