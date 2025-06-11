
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Transaction {
  id: string;
  reason: string;
  type: 'income' | 'expense';
  income?: number;
  expense?: number;
  wallet_id: string;
  category_id?: string;
  date: string;
  user_id: string;
  created_at: string;
}

export const useTransactions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          wallets(name),
          categories(name, color)
        `)
        .order('date', { ascending: false });
        
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user
  });

  const createTransaction = useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id' | 'created_at' | 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transaction,
          user_id: user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast({ title: 'Transaction created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating transaction', description: error.message, variant: 'destructive' });
    }
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Transaction> & { id: string }) => {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast({ title: 'Transaction updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating transaction', description: error.message, variant: 'destructive' });
    }
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast({ title: 'Transaction deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting transaction', description: error.message, variant: 'destructive' });
    }
  });

  return {
    transactions,
    isLoading,
    createTransaction,
    updateTransaction,
    deleteTransaction
  };
};
