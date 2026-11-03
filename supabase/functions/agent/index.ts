import { runAgent } from "./agent.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MAX_MESSAGE_LENGTH = 2000;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "Método no permitido." }, 405);
    }

    const body = await req.json().catch(() => null);
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!message) {
      return jsonResponse({ error: "Falta el campo 'message'." }, 400);
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return jsonResponse(
        { error: `El mensaje no puede superar ${MAX_MESSAGE_LENGTH} caracteres.` },
        400,
      );
    }

    const reply = await runAgent(message);
    return jsonResponse({ reply });
  } catch (err) {
    console.error("agent error:", err);
    return jsonResponse({ error: "No se pudo completar la consulta al agente." }, 500);
  }
});
