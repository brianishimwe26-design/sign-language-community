import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { accountName, accountInitials } from '@/lib/account';

const AccountContext = createContext({ user: null as User | null, name: 'Guest', initials: 'G', avatarUrl: null as string | null, loading: true });

export function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const router = useRouter();
  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== 'INITIAL_SESSION' && event !== 'SIGNED_IN' && event !== 'SIGNED_OUT' && event !== 'USER_UPDATED') return;
      setUser(session?.user ?? null);
      setLoading(false);
      if (event !== 'INITIAL_SESSION') {
        void router.invalidate();
        if (event !== 'SIGNED_OUT') void queryClient.invalidateQueries();
      }
    });
    void supabase.auth.getUser().then(({ data }) => {
      if (active) { setUser(data.user); setLoading(false); }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [queryClient, router]);
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id], enabled: Boolean(user),
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.from('profiles').select('display_name, avatar_url').eq('id', user.id).single();
      if (error) throw error;
      return data;
    },
  });
  const name = accountName(profile?.display_name ?? user?.user_metadata['full_name'] ?? user?.user_metadata['name'], user?.email);
  return <AccountContext.Provider value={{ user, name, initials: accountInitials(name), avatarUrl: profile?.avatar_url ?? null, loading }}>{children}</AccountContext.Provider>;
}

export function useAccount() { return useContext(AccountContext); }