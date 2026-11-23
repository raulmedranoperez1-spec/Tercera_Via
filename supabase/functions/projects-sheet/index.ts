const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1cv9pGIANVqSIF_rfjd4do0dliFoNfJ5jpbpDZmxfrdM/export?format=csv";

interface SheetProject {
  titulo: string;
  descripcion: string;
  archivoUrl: string;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        current.push(field);
        field = "";
      } else if (char === "\n") {
        current.push(field);
        rows.push(current);
        current = [];
        field = "";
      } else if (char !== "\r") {
        field += char;
      }
    }
  }
  if (field.length > 0 || current.length > 0) {
    current.push(field);
    rows.push(current);
  }
  return rows;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const response = await fetch(SHEET_CSV_URL, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `No se pudo leer la hoja (${response.status})` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const csv = await response.text();
    const rows = parseCsv(csv);
    if (rows.length < 2) {
      return new Response(
        JSON.stringify({ projects: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const headers = rows[0].map((h) => h.trim());

    const tituloIdx = headers.findIndex((h) => /t[íi]tulo\s+del\s+proyecto/i.test(h));
    const descIdx = headers.findIndex(
      (h) => /descripci[óo]n\s+o\s+resumen/i.test(h) || /descripci[óo]n/i.test(h),
    );
    const archivoIdx = headers.findIndex(
      (h) => /subir\s+archivos/i.test(h) || /archivos/i.test(h),
    );
    const publicadoIdx = headers.findIndex((h) => /publicado/i.test(h));

    if (tituloIdx === -1 || descIdx === -1 || archivoIdx === -1) {
      return new Response(
        JSON.stringify({ error: "No se encontraron las columnas necesarias en la hoja" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const projects: SheetProject[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length === 0) continue;
      const publicado = (row[publicadoIdx] ?? "").trim().toUpperCase();
      if (publicado !== "SI") continue;

      const titulo = (row[tituloIdx] ?? "").trim();
      const descripcion = (row[descIdx] ?? "").trim();
      const archivoUrl = (row[archivoIdx] ?? "").trim();

      if (!titulo) continue;
      projects.push({ titulo, descripcion, archivoUrl });
    }

    return new Response(
      JSON.stringify({ projects }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
