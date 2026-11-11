import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthContext, type Profile } from '@/lib/authContext';

const PROFILE_COLUMNS = 'id, email, role, display_name, is_socio, username, bio, avatar_url, academic_year, social_links';

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<any>({ user: { id: 'admin-1', email: 'raumedper@alum.us.es' } });
  const [profile, setProfile] = useState<any>({
    id: 'admin-1',
    email: 'raumedper@alum.us.es',
    role: 'admin',
    display_name: 'Raúl Medrano',
    username: 'raulmedrano',
    is_socio: true
  });
  const [loading, setLoading] = useState(false);

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_COLUMNS)
      .eq('id', userId)
      .maybeSingle();
   // setProfile(error ? null : (data as Profile | null));
  }, []);

  useEffect(() => {
    let active = true;
    return;
    
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session) await loadProfile(data.session.user.id);
      if (active) setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next) {
        void loadProfile(next.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (session) await loadProfile(session.user.id);
  }, [session, loadProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({ session, profile, loading, refreshProfile, signOut }),
    [session, profile, loading, refreshProfile, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
