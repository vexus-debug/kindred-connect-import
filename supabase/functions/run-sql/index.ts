import { Client } from "https://deno.land/x/postgres@v0.19.3/mod.ts";

Deno.serve(async (req) => {
  const key = req.headers.get("x-admin-key");
  if (key !== Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) {
    return new Response("forbidden", { status: 403 });
  }
  const sql = await req.text();
  const client = new Client(Deno.env.get("SUPABASE_DB_URL")!);
  try {
    await client.connect();
    await client.queryArray(sql);
    return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { "content-type": "application/json" } });
  } finally {
    try { await client.end(); } catch (_) { /* noop */ }
  }
});
