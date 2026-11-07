import { callEdgeFunction } from '@/lib/edgeFunctions';

export const ADMIN_TOKEN_STORAGE_KEY = 'tv-admin-token';

export type DocumentStatus = 'procesando' | 'listo' | 'error';

export interface AdminDocument {
  id: string;
  file_name: string;
  status: DocumentStatus;
  error_message: string | null;
  chunk_count: number;
  created_at: string;
}

export interface AdminSession {
  username: string;
  mustChangePassword: boolean;
}

interface LoginResponse {
  token: string;
  mustChangePassword: boolean;
}

interface PromptResponse {
  prompt: string;
  updatedAt: string;
}

interface DocumentsResponse {
  documents: AdminDocument[];
}

interface DocumentResponse {
  document: AdminDocument;
}

function call<T>(action: string, body: Record<string, unknown>, token?: string): Promise<T> {
  return callEdgeFunction<T>('admin', { action, ...body }, token ? { 'x-admin-token': token } : {});
}

export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsDataURL(file);
  });
}

export const adminApi = {
  login: (username: string, password: string) =>
    call<LoginResponse>('login', { username, password }),

  session: (token: string) => call<AdminSession>('session', {}, token),

  logout: (token: string) => call<{ ok: boolean }>('logout', {}, token),

  changePassword: (token: string, currentPassword: string, newPassword: string) =>
    call<LoginResponse>('change_password', { currentPassword, newPassword }, token),

  getPrompt: (token: string) => call<PromptResponse>('get_prompt', {}, token),

  savePrompt: (token: string, prompt: string) =>
    call<PromptResponse>('save_prompt', { prompt }, token),

  listDocuments: (token: string) => call<DocumentsResponse>('list_documents', {}, token),

  uploadDocument: async (token: string, file: File) => {
    const contentBase64 = await readFileAsBase64(file);
    return call<DocumentResponse>('upload_document', { fileName: file.name, contentBase64 }, token);
  },

  deleteDocument: (token: string, id: string) => call<{ ok: boolean }>('delete_document', { id }, token),
};
