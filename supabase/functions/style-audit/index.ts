import { createClient } from "npm:@supabase/supabase-js@2";
import { ChatOpenAI } from "npm:@langchain/openai@1.8.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const OPENROUTER_FREE_MODEL = "openrouter/free";
const PROMPT_KEY = "style_audit_prompt";
const MIN_TEXT_LENGTH = 40;
const MAX_TEXT_LENGTH = 15000;
const RETRIEVAL_LIMIT = 15;
const MAX_SEARCH_TERMS = 60;

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface StyleFragment {
  content: string;
  document_name: string;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function searchTerms(text: string): string[] {
  const counts = new Map<string, number>();
  for (const match of text.toLowerCase().matchAll(/[\p{L}\p{N}]{4,}/gu)) {
    counts.set(match[0], (counts.get(match[0]) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_SEARCH_TERMS)
    .map(([term]) => term);
}

async function loadPrompt(): Promise<string> {
  const { data, error } = await supabase
    .from("agent_settings")
    .select("value")
    .eq("key", PROMPT_KEY)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new HttpError(503, "El agente todavía no está configurado.");
  return data.value;
}

async function retrieveFragments(text: string): Promise<StyleFragment[]> {
  const { data, error } = await supabase.rpc("search_style_chunks", {
    query_text: searchTerms(text).join(" or "),
    match_count: RETRIEVAL_LIMIT,
  });
  if (error) throw error;
  return (data ?? []) as StyleFragment[];
}

async function auditText(text: string): Promise<string> {
  const apiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!apiKey) throw new HttpError(503, "El servicio de auditoría no está disponible en este momento.");

  const prompt = await loadPrompt();
  const fragments = await retrieveFragments(text);
  if (fragments.length === 0) {
    throw new HttpError(409, "Todavía no hay documentos del Libro de estilo listos para la revisión.");
  }

  const context = fragments
    .map((fragment, index) => `Fragmento ${index + 1} (${fragment.document_name}):\n${fragment.content}`)
    .join("\n\n");

  const model = new ChatOpenAI({
    model: OPENROUTER_FREE_MODEL,
    apiKey,
    temperature: 0.1,
    configuration: { baseURL: OPENROUTER_BASE_URL },
  });

  const response = await model.invoke([
    ["system", `${prompt}\n\nFRAGMENTOS DEL LIBRO DE ESTILO:\n\n${context}`],
    ["user", `BORRADOR A REVISAR:\n\n${text}`],
  ]);

  const content = typeof response.content === "string" ? response.content.trim() : "";
  if (!content) throw new Error("El modelo no devolvió una respuesta de texto.");
  return content;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") throw new HttpError(405, "Método no permitido.");
    const body = (await req.json().catch(() => null)) as { text?: unknown } | null;
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    if (text.length < MIN_TEXT_LENGTH) {
      throw new HttpError(400, `El borrador debe tener al menos ${MIN_TEXT_LENGTH} caracteres.`);
    }
    if (text.length > MAX_TEXT_LENGTH) {
      throw new HttpError(400, `El borrador no puede superar ${MAX_TEXT_LENGTH} caracteres.`);
    }

    const result = await auditText(text);
    return json({ result });
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.message }, err.status);
    console.error("style-audit error:", err);
    return json({ error: "No se pudo completar la auditoría. Inténtalo de nuevo." }, 500);
  }
});
