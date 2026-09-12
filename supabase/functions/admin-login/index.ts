import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SESSION_TTL_HOURS = 12;

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
    const { username, password } = await req.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: "Usuário e senha são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("id, username, password_hash, catalog_id")
      .eq("username", username)
      .maybeSingle();

    if (error || !admin) {
      return new Response(
        JSON.stringify({ error: "Credenciais inválidas" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify bcrypt hash using pgcrypto via RPC
    const { data: valid, error: rpcError } = await supabase.rpc("verify_password", {
      p_password: password,
      p_hash: admin.password_hash,
    });

    if (rpcError || !valid) {
      return new Response(
        JSON.stringify({ error: "Credenciais inválidas" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Issue a high-entropy session token and persist only its hash so the
    // admin-api can verify it server-side on every request.
    const raw = new Uint8Array(32);
    crypto.getRandomValues(raw);
    const token = Array.from(raw)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const tokenHash = await sha256Hex(token);
    const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 3600 * 1000).toISOString();

    const { error: sessionError } = await supabase.from("admin_sessions").insert({
      admin_id: admin.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

    if (sessionError) {
      console.error("admin-login session insert failed", sessionError);
      return new Response(
        JSON.stringify({ error: "Não foi possível iniciar a sessão" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Best-effort cleanup of expired sessions.
    await supabase.from("admin_sessions").delete().lt("expires_at", new Date().toISOString());

    return new Response(
      JSON.stringify({ token, username: admin.username, id: admin.id, catalog_id: admin.catalog_id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("admin-login error", err);
    return new Response(
      JSON.stringify({ error: "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
