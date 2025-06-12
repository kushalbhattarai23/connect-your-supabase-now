
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  month: number;
  year: number;
  created_at: string;
  updated_at: string;
  categories?: {
    name: string;
    color: string;
  };
}

export interface CreateBudgetData {
  category_id: string;
  amount: number;
  month: number;
  year: number;
}

export const useBudgets = (month?: number, year?: number) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const currentMonth = month || new Date().getMonth() + 1;
  const currentYear = year || new Date().getFullYear();

  const {
    data: budgets = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['budgets', user?.id, currentMonth, currentYear],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          categories(name, color)
        `)
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Budget[];
    },
    enabled: !!user
  });

  const createBudget = useMutation({
    mutationFn: async (budgetData: CreateBudgetData) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('budgets')
        .insert([{ ...budgetData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget created successfully');
    },
    onError: (error) => {
      console.error('Create budget error:', error);
      toast.error('Failed to create budget');
    }
  });

  const updateBudget = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Budget> & { id: string }) => {
      const { data, error } = await supabase
        .from('budgets')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget updated successfully');
    },
    onError: (error) => {
      console.error('Update budget error:', error);
      toast.error('Failed to update budget');
    }
  });

  const deleteBudget = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget deleted successfully');
    },
    onError: (error) => {
      console.error('Delete budget error:', error);
      toast.error('Failed to delete budget');
    }
  });

  return {
    budgets,
    isLoading,
    error,
    createBudget,
    updateBudget,
    deleteBudget
  };
};
