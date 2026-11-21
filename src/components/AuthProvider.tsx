import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AuthContext, type Profile } from '@/lib/authContext';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const syncLocalAuth = useCallback(() => {
    try {
      const raw = localStorage.getItem('tercera_via_user');
      if (!raw) {
        setSession(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      const parsed = JSON.parse(raw) as {
        name?: string;
        email?: string;
        role?: string;
      };

      const email = parsed.email ?? '';
      const displayName = parsed.name || email.split('@')[0] || 'Usuario';
      const userId = `local-${email || 'demo'}`;

      const demoProfile = {
        id: userId,
        email,
        role: parsed.role ?? 'Lector',
        display_name: displayName,
        is_socio: false,
        username: email.split('@')[0] || 'usuario',
        bio: null,
        avatar_url: null,
        academic_year: null,
        social_links: null,
      } as unknown as Profile;

      const demoSession = {
        access_token: 'local-demo-token',
        refresh_token: 'local-demo-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: userId,
          email,
          aud: 'authenticated',
          role: 'authenticated',
          app_metadata: {},
          user_metadata: { display_name: displayName },
          created_at: new Date().toISOString(),
        },
      } as unknown as Session;

      setProfile(demoProfile);
      setSession(demoSession);
    } catch {
      setSession(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncLocalAuth();
    window.addEventListener('storage', syncLocalAuth);
    return () => {
      window.removeEventListener('storage', syncLocalAuth);
    };
  }, [syncLocalAuth]);

  const value = useMemo(
    () => ({
      session,
      profile,
      loading,
      refreshProfile: async () => {
        syncLocalAuth();
      },
    }),
    [session, profile, loading, syncLocalAuth]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
