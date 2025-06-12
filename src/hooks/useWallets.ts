import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: string;
  user_id: string;
  created_at: string;
}

export const useWallets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wallets = [], isLoading } = useQuery({
    queryKey: ['wallets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as Wallet[];
    },
    enabled: !!user
  });

  const createWallet = useMutation({
    mutationFn: async (wallet: Omit<Wallet, 'id' | 'created_at' | 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('wallets')
        .insert({
          ...wallet,
          user_id: user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast({ title: 'Wallet created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating wallet', description: error.message, variant: 'destructive' });
    }
  });

  const updateWallet = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Wallet> & { id: string }) => {
      const { data, error } = await supabase
        .from('wallets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast({ title: 'Wallet updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating wallet', description: error.message, variant: 'destructive' });
    }
  });

  const deleteWallet = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('wallets')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast({ title: 'Wallet deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting wallet', description: error.message, variant: 'destructive' });
    }
  });

  return {
    wallets,
    isLoading,
    createWallet,
    updateWallet,
    deleteWallet
  };
};
