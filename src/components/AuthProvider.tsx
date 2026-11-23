import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthContext, type Profile } from '@/lib/authContext';

const PROFILE_COLUMNS = 'id, email, role, display_name, is_socio, username, bio, avatar_url, academic_year, social_links';

function isUniversityEmail(addr: string): boolean {
  const clean = addr.trim().toLowerCase();
  return clean.endsWith('@alum.us.es') || clean.endsWith('@us.es');
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

async function ensureProfile(session: Session): Promise<Profile | null> {
  const userId = session.user.id;
  const email = session.user.email ?? '';

  const existing = await fetchProfile(userId);
  if (existing) return existing;

  const role = isUniversityEmail(email) ? 'redactor' : 'lector';
  const displayName =
    (session.user.user_metadata?.display_name as string | undefined) ||
    email.split('@')[0] ||
    'Usuario';

  const { data: inserted, error: insertError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      role,
      display_name: displayName,
      is_socio: false,
    })
    .select(PROFILE_COLUMNS)
    .maybeSingle();

  if (insertError) throw insertError;
  return inserted as Profile | null;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  const refreshProfile = useCallback(async () => {
    let currentSession: Session | null = null;
    try {
      const { data: { session: s } } = await supabase.auth.getSession();
      currentSession = s;
      setSession(s);
      setProfileError('');
      if (s?.user?.id) {
        const p = await ensureProfile(s);
        setProfile(p);
      } else {
        setProfile(null);
      }
    } catch {
      setSession(currentSession);
      setProfile(null);
      setProfileError('No se pudo cargar tu perfil. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      (async () => {
        try {
          setSession(newSession);
          setProfileError('');
          if (newSession?.user?.id) {
            const p = await ensureProfile(newSession);
            setProfile(p);
          } else {
            setProfile(null);
          }
        } catch {
          setProfile(null);
          setProfileError('No se pudo cargar tu perfil. Revisa tu conexión e inténtalo de nuevo.');
        } finally {
          setLoading(false);
        }
      })();
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [refreshProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setProfileError('');
  }, []);

  const value = useMemo(
    () => ({ session, profile, loading, profileError, refreshProfile, signOut }),
    [session, profile, loading, profileError, refreshProfile, signOut]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
