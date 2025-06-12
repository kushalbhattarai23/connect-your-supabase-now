
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
      
      // Start a transaction to handle wallet balance updates
      const { data: fromWallet, error: fromWalletError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('id', transfer.from_wallet_id)
        .single();
      
      if (fromWalletError) throw fromWalletError;
      
      if (fromWallet.balance < transfer.amount) {
        throw new Error('Insufficient balance in source wallet');
      }
      
      // Create the transfer
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
      
      // Update wallet balances
      await Promise.all([
        supabase
          .from('wallets')
          .update({ balance: fromWallet.balance - transfer.amount })
          .eq('id', transfer.from_wallet_id),
        supabase
          .from('wallets')
          .update({ balance: supabase.rpc('increment', { amount: transfer.amount }) })
          .eq('id', transfer.to_wallet_id)
      ]);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast({ title: 'Transfer completed successfully - wallet balances updated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating transfer', description: error.message, variant: 'destructive' });
    }
  });

  const updateTransfer = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Transfer> & { id: string }) => {
      // Get the original transfer to reverse its effect
      const { data: originalTransfer, error: originalError } = await supabase
        .from('transfers')
        .select('*')
        .eq('id', id)
        .single();
        
      if (originalError) throw originalError;
      
      // Reverse the original transfer's effect on wallet balances
      await Promise.all([
        supabase
          .from('wallets')
          .update({ balance: supabase.rpc('increment', { amount: originalTransfer.amount }) })
          .eq('id', originalTransfer.from_wallet_id),
        supabase
          .from('wallets')
          .update({ balance: supabase.rpc('increment', { amount: -originalTransfer.amount }) })
          .eq('id', originalTransfer.to_wallet_id)
      ]);
      
      // Update the transfer
      const { data, error } = await supabase
        .from('transfers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Apply the new transfer's effect on wallet balances
      if (updates.amount && updates.from_wallet_id && updates.to_wallet_id) {
        await Promise.all([
          supabase
            .from('wallets')
            .update({ balance: supabase.rpc('increment', { amount: -updates.amount }) })
            .eq('id', updates.from_wallet_id),
          supabase
            .from('wallets')
            .update({ balance: supabase.rpc('increment', { amount: updates.amount }) })
            .eq('id', updates.to_wallet_id)
        ]);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast({ title: 'Transfer updated successfully - wallet balances updated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating transfer', description: error.message, variant: 'destructive' });
    }
  });

  const deleteTransfer = useMutation({
    mutationFn: async (id: string) => {
      // Get the transfer to reverse its effect
      const { data: transfer, error: transferError } = await supabase
        .from('transfers')
        .select('*')
        .eq('id', id)
        .single();
        
      if (transferError) throw transferError;
      
      // Reverse the transfer's effect on wallet balances
      await Promise.all([
        supabase
          .from('wallets')
          .update({ balance: supabase.rpc('increment', { amount: transfer.amount }) })
          .eq('id', transfer.from_wallet_id),
        supabase
          .from('wallets')
          .update({ balance: supabase.rpc('increment', { amount: -transfer.amount }) })
          .eq('id', transfer.to_wallet_id)
      ]);
      
      // Delete the transfer
      const { error } = await supabase
        .from('transfers')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast({ title: 'Transfer deleted successfully - wallet balances updated' });
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
