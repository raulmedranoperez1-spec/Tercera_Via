import { createClient } from "npm:@supabase/supabase-js@2";
import JSZip from "npm:jszip@3.10.2";
import { extractText as extractPdfText, getDocumentProxy } from "npm:unpdf@1.9.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Admin-Token",
};

const INITIAL_USERNAME = "admin";
const INITIAL_PASSWORD = "LaTerceraVia2026";
const MIN_PASSWORD_LENGTH = 10;
const SESSION_HOURS = 12;
const PBKDF2_ITERATIONS = 210000;
const PROMPT_KEY = "style_audit_prompt";
const PROMPT_MIN_LENGTH = 200;
const PROMPT_MAX_LENGTH = 20000;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const CHUNK_TARGET_CHARS = 1200;
const INSERT_BATCH_SIZE = 200;
const ALLOWED_EXTENSIONS = ["pdf", "docx"];
const UNIQUE_VIOLATION = "23505";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

const encoder = new TextEncoder();

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface Session {
  username: string;
  tokenHash: string;
  mustChangePassword: boolean;
}

interface Account {
  username: string;
  password_hash: string;
  password_salt: string;
  must_change_password: boolean;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toHex(buffer: ArrayBuffer | Uint8Array): string {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function randomHex(bytes: number): string {
  return toHex(crypto.getRandomValues(new Uint8Array(bytes)));
}

async function sha256Hex(text: string): Promise<string> {
  return toHex(await crypto.subtle.digest("SHA-256", encoder.encode(text)));
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: encoder.encode(salt), iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    key,
    256,
  );
  return toHex(bits);
}

async function verifyPassword(password: string, account: Account): Promise<boolean> {
  const computed = await hashPassword(password, account.password_salt);
  if (computed.length !== account.password_hash.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ account.password_hash.charCodeAt(i);
  }
  return diff === 0;
}

async function loadAccount(username: string): Promise<Account | null> {
  const { data, error } = await supabase
    .from("admin_accounts")
    .select("username, password_hash, password_salt, must_change_password")
    .eq("username", username)
    .maybeSingle();
  if (error) throw error;
  return data as Account | null;
}

async function ensureInitialAccount(): Promise<void> {
  if (await loadAccount(INITIAL_USERNAME)) return;
  const salt = randomHex(16);
  const { error } = await supabase.from("admin_accounts").insert({
    username: INITIAL_USERNAME,
    password_salt: salt,
    password_hash: await hashPassword(INITIAL_PASSWORD, salt),
    must_change_password: true,
  });
  if (error && error.code !== UNIQUE_VIOLATION) throw error;
}

async function createSession(username: string): Promise<string> {
  const token = randomHex(32);
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000).toISOString();
  await supabase.from("admin_sessions").delete().lt("expires_at", new Date().toISOString());
  const { error } = await supabase.from("admin_sessions").insert({
    token_hash: await sha256Hex(token),
    username,
    expires_at: expiresAt,
  });
  if (error) throw error;
  return token;
}

async function requireSession(req: Request): Promise<Session> {
  const token = req.headers.get("x-admin-token");
  if (!token) throw new HttpError(401, "Tu sesión no es válida. Vuelve a iniciar sesión.");

  const tokenHash = await sha256Hex(token);
  const { data: session, error } = await supabase
    .from("admin_sessions")
    .select("username, expires_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();
  if (error) throw error;
  if (!session || new Date(session.expires_at).getTime() <= Date.now()) {
    throw new HttpError(401, "Tu sesión ha caducado. Vuelve a iniciar sesión.");
  }

  const account = await loadAccount(session.username);
  if (!account) throw new HttpError(401, "Tu sesión no es válida. Vuelve a iniciar sesión.");
  return { username: account.username, tokenHash, mustChangePassword: account.must_change_password };
}

async function login(body: Record<string, unknown>) {
  const username = str(body.username).trim();
  const password = str(body.password);
  if (!username || !password) throw new HttpError(400, "Introduce usuario y contraseña.");

  await ensureInitialAccount();
  const account = await loadAccount(username);
  if (!account || !(await verifyPassword(password, account))) {
    throw new HttpError(401, "Usuario o contraseña incorrectos.");
  }

  const token = await createSession(account.username);
  return { token, mustChangePassword: account.must_change_password };
}

async function changePassword(session: Session, body: Record<string, unknown>) {
  const currentPassword = str(body.currentPassword);
  const newPassword = str(body.newPassword);
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    throw new HttpError(400, `La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
  }
  if (newPassword === currentPassword) {
    throw new HttpError(400, "La nueva contraseña debe ser distinta de la actual.");
  }

  const account = await loadAccount(session.username);
  if (!account || !(await verifyPassword(currentPassword, account))) {
    throw new HttpError(401, "La contraseña actual no es correcta.");
  }

  const salt = randomHex(16);
  const { error } = await supabase
    .from("admin_accounts")
    .update({
      password_salt: salt,
      password_hash: await hashPassword(newPassword, salt),
      must_change_password: false,
      updated_at: new Date().toISOString(),
    })
    .eq("username", session.username);
  if (error) throw error;

  await supabase.from("admin_sessions").delete().eq("username", session.username);
  const token = await createSession(session.username);
  return { token, mustChangePassword: false };
}

async function getPrompt() {
  const { data, error } = await supabase
    .from("agent_settings")
    .select("value, updated_at")
    .eq("key", PROMPT_KEY)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new HttpError(404, "No hay un prompt configurado.");
  return { prompt: data.value, updatedAt: data.updated_at };
}

async function savePrompt(body: Record<string, unknown>) {
  const prompt = str(body.prompt).trim();
  if (prompt.length < PROMPT_MIN_LENGTH || prompt.length > PROMPT_MAX_LENGTH) {
    throw new HttpError(400, `El prompt debe tener entre ${PROMPT_MIN_LENGTH} y ${PROMPT_MAX_LENGTH} caracteres.`);
  }
  const updatedAt = new Date().toISOString();
  const { error } = await supabase
    .from("agent_settings")
    .upsert({ key: PROMPT_KEY, value: prompt, updated_at: updatedAt }, { onConflict: "key" });
  if (error) throw error;
  return { prompt, updatedAt };
}

async function listDocuments() {
  const { data, error } = await supabase
    .from("agent_documents")
    .select("id, file_name, status, error_message, chunk_count, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return { documents: data ?? [] };
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function docxXmlToText(xml: string): string {
  return xml
    .split(/<\/w:p>/)
    .map((paragraph) =>
      [...paragraph.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)]
        .map((match) => decodeXmlEntities(match[1]))
        .join("")
    )
    .join("\n");
}

async function extractDocumentText(bytes: Uint8Array, extension: string): Promise<string> {
  if (extension === "pdf") {
    const pdf = await getDocumentProxy(bytes);
    const { text } = await extractPdfText(pdf, { mergePages: true });
    return typeof text === "string" ? text : "";
  }
  const zip = await JSZip.loadAsync(bytes);
  const xml = await zip.file("word/document.xml")?.async("string");
  return xml ? docxXmlToText(xml) : "";
}

function splitOversized(text: string): string[] {
  const parts: string[] = [];
  for (let start = 0; start < text.length; start += CHUNK_TARGET_CHARS) {
    parts.push(text.slice(start, start + CHUNK_TARGET_CHARS));
  }
  return parts;
}

function chunkText(text: string): string[] {
  const paragraphs = text
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";
  for (const paragraph of paragraphs) {
    for (const piece of splitOversized(paragraph)) {
      if (current && current.length + piece.length + 1 > CHUNK_TARGET_CHARS) {
        chunks.push(current);
        current = piece;
      } else {
        current = current ? `${current} ${piece}` : piece;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function decodeBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function uploadDocument(body: Record<string, unknown>) {
  const fileName = str(body.fileName).trim().slice(0, 200);
  const contentBase64 = str(body.contentBase64);
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (!fileName || !ALLOWED_EXTENSIONS.includes(extension)) {
    throw new HttpError(400, "Solo se admiten documentos PDF o DOCX.");
  }
  if (!contentBase64) throw new HttpError(400, "El archivo está vacío.");

  let bytes: Uint8Array;
  try {
    bytes = decodeBase64(contentBase64);
  } catch {
    throw new HttpError(400, "No se pudo leer el archivo.");
  }
  if (bytes.length === 0) throw new HttpError(400, "El archivo está vacío.");
  if (bytes.length > MAX_FILE_BYTES) {
    throw new HttpError(400, "El archivo supera el tamaño máximo de 5 MB.");
  }

  const { data: document, error: insertError } = await supabase
    .from("agent_documents")
    .insert({ file_name: fileName, status: "procesando" })
    .select("id, file_name, status, error_message, chunk_count, created_at")
    .single();
  if (insertError) throw insertError;

  try {
    const chunks = chunkText(await extractDocumentText(bytes, extension));
    if (chunks.length === 0) {
      throw new Error("El documento no contiene texto extraíble (puede ser un escaneo de imágenes).");
    }

    const rows = chunks.map((content, position) => ({ document_id: document.id, position, content }));
    for (let start = 0; start < rows.length; start += INSERT_BATCH_SIZE) {
      const { error } = await supabase.from("agent_document_chunks").insert(rows.slice(start, start + INSERT_BATCH_SIZE));
      if (error) throw error;
    }

    const { data: ready, error: updateError } = await supabase
      .from("agent_documents")
      .update({ status: "listo", chunk_count: chunks.length, error_message: null })
      .eq("id", document.id)
      .select("id, file_name, status, error_message, chunk_count, created_at")
      .single();
    if (updateError) throw updateError;
    return { document: ready };
  } catch (err) {
    console.error("document processing error:", err);
    await supabase.from("agent_document_chunks").delete().eq("document_id", document.id);
    const message = err instanceof Error && err.message.startsWith("El documento")
      ? err.message
      : "No se pudo procesar el documento. Comprueba que el archivo no está protegido.";
    const { data: failed } = await supabase
      .from("agent_documents")
      .update({ status: "error", error_message: message, chunk_count: 0 })
      .eq("id", document.id)
      .select("id, file_name, status, error_message, chunk_count, created_at")
      .maybeSingle();
    return { document: failed ?? { ...document, status: "error", error_message: message } };
  }
}

async function deleteDocument(body: Record<string, unknown>) {
  const id = str(body.id);
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new HttpError(400, "Documento no válido.");
  const { error } = await supabase.from("agent_documents").delete().eq("id", id);
  if (error) throw error;
  return { ok: true };
}

async function handleAction(action: string, body: Record<string, unknown>, req: Request) {
  if (action === "login") return login(body);

  const session = await requireSession(req);
  if (action === "session") {
    return { username: session.username, mustChangePassword: session.mustChangePassword };
  }
  if (action === "logout") {
    await supabase.from("admin_sessions").delete().eq("token_hash", session.tokenHash);
    return { ok: true };
  }
  if (action === "change_password") return changePassword(session, body);

  if (session.mustChangePassword) {
    throw new HttpError(403, "Debes cambiar la contraseña provisional antes de continuar.");
  }

  switch (action) {
    case "get_prompt":
      return getPrompt();
    case "save_prompt":
      return savePrompt(body);
    case "list_documents":
      return listDocuments();
    case "upload_document":
      return uploadDocument(body);
    case "delete_document":
      return deleteDocument(body);
    default:
      throw new HttpError(400, "Acción no válida.");
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") throw new HttpError(405, "Método no permitido.");
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body || typeof body.action !== "string") throw new HttpError(400, "Petición no válida.");

    return json(await handleAction(body.action, body, req));
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.message }, err.status);
    console.error("admin error:", err);
    return json({ error: "No se pudo completar la operación." }, 500);
  }
});
