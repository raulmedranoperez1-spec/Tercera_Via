const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export class EdgeFunctionError extends Error {}

export async function callEdgeFunction<T>(
  name: string,
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        ...headers,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new EdgeFunctionError('No hay conexión con el servidor. Inténtalo de nuevo.');
  }

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = (data as { error?: unknown } | null)?.error;
    throw new EdgeFunctionError(typeof message === 'string' ? message : 'Ha ocurrido un error inesperado.');
  }
  if (data === null || typeof data !== 'object') {
    throw new EdgeFunctionError('La respuesta del servidor no es válida.');
  }
  return data as T;
}

export function describeError(error: unknown): string {
  return error instanceof Error && error.message ? error.message : 'Ha ocurrido un error inesperado.';
}
