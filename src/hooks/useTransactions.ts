
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useOrganizationContext } from '@/contexts/OrganizationContext';

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
  organization_id?: string;
  created_at: string;
}

export const useTransactions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentOrganization, isPersonalMode } = useOrganizationContext();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', user?.id, currentOrganization?.id],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase.from('transactions').select(`
        *,
        wallets(name),
        categories(name, color)
      `);
      
      if (isPersonalMode) {
        query = query.eq('user_id', user.id).is('organization_id', null);
      } else if (currentOrganization) {
        query = query.eq('organization_id', currentOrganization.id);
      }
      
      const { data, error } = await query.order('date', { ascending: false });
        
      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }
      return data as Transaction[];
    },
    enabled: !!user
  });

  const createTransaction = useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id' | 'created_at' | 'user_id' | 'organization_id'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const transactionData = {
        ...transaction,
        user_id: user.id,
        organization_id: isPersonalMode ? null : currentOrganization?.id || null
      };
      
      console.log('Creating transaction with data:', transactionData);
      
      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();
        
      if (error) {
        console.error('Error creating transaction:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast({ title: 'Transaction created successfully' });
    },
    onError: (error: Error) => {
      console.error('Transaction creation error:', error);
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
