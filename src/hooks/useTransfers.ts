
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Transfer {
  id: string;
  from_wallet_id: string;
  to_wallet_id: string;
  amount: number;
  date: string;
  description?: string;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  from_wallet?: { name: string };
  to_wallet?: { name: string };
}

export const useTransfers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transfers = [], isLoading } = useQuery({
    queryKey: ['transfers', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('transfers')
        .select(`
          *,
          from_wallet:wallets!from_wallet_id(name),
          to_wallet:wallets!to_wallet_id(name)
        `)
        .order('date', { ascending: false });
        
      if (error) throw error;
      return data as Transfer[];
    },
    enabled: !!user
  });

  const createTransfer = useMutation({
    mutationFn: async (transfer: Omit<Transfer, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'status'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('transfers')
        .insert({
          ...transfer,
          user_id: user.id,
          status: 'completed'
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast({ title: 'Transfer completed successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating transfer', description: error.message, variant: 'destructive' });
    }
  });

  const updateTransfer = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Transfer> & { id: string }) => {
      const { data, error } = await supabase
        .from('transfers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast({ title: 'Transfer updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating transfer', description: error.message, variant: 'destructive' });
    }
  });

  const deleteTransfer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transfers')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast({ title: 'Transfer deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting transfer', description: error.message, variant: 'destructive' });
    }
  });

  return {
    transfers,
    isLoading,
    createTransfer,
    updateTransfer,
    deleteTransfer
  };
};
