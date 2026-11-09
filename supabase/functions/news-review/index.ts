import { createClient } from "npm:@supabase/supabase-js@2";
import { ChatOpenAI } from "npm:@langchain/openai@1.8.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const OPENROUTER_FREE_MODEL = "openrouter/free";
const MIN_TEXT_LENGTH = 40;
const MAX_TEXT_LENGTH = 20000;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const DEONTOLOGICAL_PROMPT = `Eres el sistema de revisión deontológica de La Tercera Vía. Analiza el borrador periodístico que se te presenta y comprueba si cumple cada uno de los nueve artículos del Código Deontológico.

CÓDIGO DEONTOLÓGICO (normativa obligatoria):

ARTÍCULO 1. Del fin primordial.
La noticia debe centrarse en hechos estructurales, datos contrastados y contextos verificables, sin buscar provocar respuestas emocionales o identitarias.

ARTÍCULO 2. Regla de las 24 Horas.
Las noticias sobre conflictos públicos de confrontación política o social no deben publicarse antes de transcurridas 24 horas desde el inicio del acontecimiento. Si se proporciona la fecha del acontecimiento, verifica si han pasado 24 horas.

ARTÍCULO 3. De la sobriedad en la titulación.
El titular no debe contener signos de interrogación ni exclamación. Debe explicar qué ha ocurrido en términos materiales. No debe usar metáforas bélicas, pugilísticas o catastrofistas (batalla, incendio, estalla, golpe, humillación).

ARTÍCULO 4. Del principio de parquedad adjetiva.
Detecta calificativos morales o emocionales como histórico, vergonzoso, magistral, escándalo o desastre. Solo se permiten dentro de citas textuales atribuidas y contextualizadas.

ARTÍCULO 5. De la no amplificación del insulto.
Detecta declaraciones que consistan exclusivamente en descalificaciones personales o provocaciones partidistas sin contenido legislativo, presupuestario o de gestión. Estas no deben constituir por sí solas el eje de una noticia.

ARTÍCULO 6. De la transparencia documental obligatoria.
Cuando la noticia cite leyes, autos judiciales, informes técnicos o contratos de gasto público, debe incluir un enlace directo al documento primario. Si faltan enlaces obligatorios, marca el artículo como no cumplido.

ARTÍCULO 7. De la paridad de encuadre en el disenso.
En controversias públicas manifiestas, el texto debe incluir dos apartados: "Hechos de consenso acreditados" y "Puntos de discrepancia". Debe presentar los argumentos de las partes de manera simétrica.

ARTÍCULO 8. Del examen cruzado de sesgos.
La revisión automática detecta posibles incumplimientos. La firma final corresponde al Editor de Descompresión (humano). Marca siempre como "pendiente de firma del editor".

ARTÍCULO 9. De la ausencia de métricas especulativas.
No se mostrarán públicamente contadores de lecturas, likes ni clasificaciones de popularidad. La plataforma debe respetar este principio.

INSTRUCCIONES DE RESPUESTA:
Responde EXCLUSIVAMENTE con un objeto JSON válido, sin texto adicional, con esta estructura exacta:

{
  "articles": [
    {
      "article_number": 1,
      "status": "cumple" | "no_cumple" | "revision_necesaria",
      "details": "Explicación concreta de qué se cumple o no, qué parte del texto tiene el problema, y qué debe corregir el escritor."
    },
    ... (para los 9 artículos)
  ],
  "summary": "Resumen breve del resultado general de la revisión."
}

Reglas para cada artículo:
- Si el artículo se cumple claramente, marca "cumple".
- Si hay un incumplimiento detectable, marca "no_cumple" y explica qué corregir.
- Si no puedes comprobar una condición por falta de información, marca "revision_necesaria" — NUNCA "cumple" automáticamente.
- Para el Artículo 8, marca siempre "revision_necesaria" con el detalle "Pendiente de firma del Editor de Descompresión."
- Para el Artículo 2, si no se proporciona fecha del acontecimiento, marca "revision_necesaria" indicando que el escritor debe indicar la fecha de inicio del acontecimiento.`;

interface ArticleResult {
  article_number: number;
  status: "cumple" | "no_cumple" | "revision_necesaria";
  details: string;
}

interface ReviewResult {
  articles: ArticleResult[];
  summary: string;
}

function extractJsonFromText(text: string): ReviewResult | null {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.articles || !Array.isArray(parsed.articles)) return null;
    return parsed as ReviewResult;
  } catch {
    return null;
  }
}

async function reviewText(
  text: string,
  eventStartAt: string | null,
): Promise<ReviewResult> {
  const apiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!apiKey) {
    throw new HttpError(503, "El servicio de revisión no está disponible en este momento.");
  }

  let userMessage = `BORRADOR A REVISAR:\n\n${text}`;
  if (eventStartAt) {
    const eventDate = new Date(eventStartAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60);
    userMessage += `\n\nFECHA DE INICIO DEL ACONTECIMIENTO: ${eventDate.toISOString()}\nHoras transcurridas desde el inicio: ${hoursDiff.toFixed(1)} horas`;
  } else {
    userMessage += `\n\nFECHA DE INICIO DEL ACONTECIMIENTO: No proporcionada por el escritor.`;
  }

  const model = new ChatOpenAI({
    model: OPENROUTER_FREE_MODEL,
    apiKey,
    temperature: 0.1,
    configuration: { baseURL: OPENROUTER_BASE_URL },
  });

  const response = await model.invoke([
    ["system", DEONTOLOGICAL_PROMPT],
    ["user", userMessage],
  ]);

  const content = typeof response.content === "string" ? response.content.trim() : "";
  if (!content) throw new Error("El modelo no devolvió una respuesta válida.");

  const result = extractJsonFromText(content);
  if (!result) throw new Error("No se pudo extraer el informe estructurado de la revisión.");
  return result;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") throw new HttpError(405, "Método no permitido.");
    const body = (await req.json().catch(() => null)) as {
      text?: unknown;
      event_start_at?: unknown;
    } | null;

    const text = typeof body?.text === "string" ? body.text.trim() : "";
    if (text.length < MIN_TEXT_LENGTH) {
      throw new HttpError(400, `El borrador debe tener al menos ${MIN_TEXT_LENGTH} caracteres.`);
    }
    if (text.length > MAX_TEXT_LENGTH) {
      throw new HttpError(400, `El borrador no puede superar ${MAX_TEXT_LENGTH} caracteres.`);
    }

    const eventStartAt = typeof body?.event_start_at === "string" ? body.event_start_at : null;
    const result = await reviewText(text, eventStartAt);

    const passed = result.articles.every(
      (a) => a.status === "cumple" || (a.article_number === 8 && a.status === "revision_necesaria"),
    );

    return json({ result: { ...result, passed } });
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.message }, err.status);
    console.error("news-review error:", err);
    return json({ error: "No se pudo completar la revisión deontológica. Inténtalo de nuevo." }, 500);
  }
});
