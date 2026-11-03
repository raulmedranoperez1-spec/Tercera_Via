import { tool } from "npm:langchain@1";
import { z } from "npm:zod@3";

const TAVILY_SEARCH_URL = "https://api.tavily.com/search";

interface TavilyResult {
  title: string;
  url: string;
  content: string;
}

export function createTavilySearchTool(apiKey: string) {
  return tool(
    async ({ query }: { query: string }) => {
      try {
        const res = await fetch(TAVILY_SEARCH_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ query, max_results: 5, search_depth: "basic" }),
        });
        if (!res.ok) {
          return `Error: la búsqueda en internet falló (código ${res.status}).`;
        }
        const data = (await res.json()) as { results?: TavilyResult[] };
        const results = (data.results ?? []).map((r) => ({
          title: r.title,
          url: r.url,
          content: r.content,
        }));
        if (results.length === 0) return "No se encontraron resultados.";
        return JSON.stringify(results);
      } catch {
        return "Error: no se pudo conectar con el servicio de búsqueda.";
      }
    },
    {
      name: "buscar_en_internet",
      description:
        "Busca información actual en internet y devuelve resultados con título, enlace y extracto. Úsala para datos recientes o para verificar hechos.",
      schema: z.object({
        query: z.string().min(3).max(300).describe("Consulta de búsqueda en español o inglés"),
      }),
    },
  );
}
