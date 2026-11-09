import { createContext, useContext } from 'react';
import type { Session } from '@supabase/supabase-js';

export type AppRole = 'lector' | 'redactor' | 'colaborador' | 'equipo_editorial';

export interface SocialLink {
  platform: string;
  url: string;
}

export interface Profile {
  id: string;
  email: string;
  role: AppRole;
  display_name: string | null;
  is_socio: boolean;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  academic_year: string | null;
  social_links: SocialLink[];
}

export interface AuthState {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
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
    case 'redactor':
      return 'Redactor / Alumno FCOM';
    case 'colaborador':
      return 'Colaborador';
    case 'equipo_editorial':
      return 'Equipo editorial';
    default:
      return 'Lector / Suscriptor';
  }
}
