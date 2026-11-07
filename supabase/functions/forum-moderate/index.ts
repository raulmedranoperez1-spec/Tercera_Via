const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ModerationResult {
  recommendation: "publicar" | "marcar" | "sugerir_ocultacion";
  reasons: string[];
  confidence: "alta" | "media" | "baja";
}

const SYSTEM_PROMPT = `Eres el sistema de moderación del foro de La Tercera Vía, un proyecto de periodismo desadjetivado y respetuoso.

Analiza el siguiente mensaje del foro y determina si cumple con las normas de participación:

1. RESPETO: ningún mensaje puede contener insultos, amenazas o ataques personales.
2. VERACIDAD: las afirmaciones deben poder contrastarse. La desinformación intencional será retirada.
3. SIN ODIO: se rechaza cualquier forma de discriminación por origen, género, orientación, religión o discapacidad.
4. SIN SPAM: no se permite contenido promocional no autorizado ni enlaces irrelevantes.
5. ARGUMENTACIÓN: favorece el contraste de ideas y el debate razonado frente al eslogan o la arenga.
6. IDENTIDAD: participa con tu cuenta. Los contenidos son atribuibles a su autor.

Devuelve EXCLUSIVAMENTE un objeto JSON con esta forma exacta, sin texto adicional:
{
  "recommendation": "publicar" | "marcar" | "sugerir_ocultacion",
  "reasons": ["motivo1", "motivo2"],
  "confidence": "alta" | "media" | "baja"
}

- "publicar": el mensaje cumple las normas.
- "marcar": hay una posible infracción leve o ambigua que requiere revisión humana.
- "sugerir_ocultacion": hay una infracción clara y grave (insultos graves, amenazas, odio, spam evidente).

Si no estás seguro, usa "marcar" con confianza "baja".
El campo "reasons" debe contener una breve explicación en español de cada problema detectado, o un array vacío si recomiendas "publicar".`;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export async function moderateMessage(text: string): Promise<ModerationResult> {
  const openRouterKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!openRouterKey) {
    throw new Error("Falta la clave OPENROUTER_API_KEY");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openRouterKey}`,
    },
    body: JSON.stringify({
      model: "openrouter/free",
      temperature: 0.1,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter respondió ${response.status}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Respuesta inválida del modelo");
  }

  const parsed = JSON.parse(content) as ModerationResult;
  if (!["publicar", "marcar", "sugerir_ocultacion"].includes(parsed.recommendation)) {
    throw new Error("Recomendación no válida");
  }
  return parsed;
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
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    if (!text) {
      return jsonResponse({ error: "Falta el campo 'text'." }, 400);
    }
    if (text.length > 5000) {
      return jsonResponse({ error: "El texto no puede superar 5000 caracteres." }, 400);
    }

    const result = await moderateMessage(text);
    return jsonResponse(result);
  } catch (err) {
    console.error("forum-moderate error:", err);
    return jsonResponse(
      { error: "No se pudo completar el análisis de moderación." },
      500,
    );
  }
});
