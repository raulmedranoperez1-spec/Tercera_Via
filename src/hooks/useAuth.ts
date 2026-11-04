import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  email: string | null;
  role: string | null;
  isCollaborator: boolean;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async (uid: string, userEmail: string | undefined) => {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', uid)
        .maybeSingle();

      if (!mounted) return;
      setRole(data?.role ?? 'lector');
      setEmail(userEmail ?? null);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session?.user) {
        setUser(data.session.user);
        fetchProfile(data.session.user.id, data.session.user.email);
      } else {
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        setEmail(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    email,
    role,
    isCollaborator: role === 'creador' || role === 'editor' || role === 'admin',
    loading,
  };
}
