import { createContext, useContext } from 'react';
import type { Session } from '@supabase/supabase-js';

export type AppRole = 'lector' | 'creador' | 'editor' | 'admin';

export interface Profile {
  id: string;
  email: string;
  role: AppRole;
  display_name: string | null;
  is_socio: boolean;
}

export interface AuthState {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  setDemoProfile: (role: 'lector' | 'creador', socio: boolean) => Promise<string | null>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}

export function roleLabel(role: AppRole): string {
  switch (role) {
    case 'creador':
      return 'Alumno / Creador';
    case 'editor':
      return 'Editor';
    case 'admin':
      return 'Administrador';
    default:
      return 'Lector / Suscriptor';
  }
}
