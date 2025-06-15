
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Budget {
  id: string;
  user_id: string;
  category_id: string | null;
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

// category_id now nullable
export interface CreateBudgetData {
  category_id: string | null;
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
      // Fix: send category_id as null, not empty string
      const safeData = {
        ...budgetData,
        user_id: user.id,
        category_id: budgetData.category_id === '' ? null : budgetData.category_id,
      };

      const { data, error } = await supabase
        .from('budgets')
        .insert([safeData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget created successfully');
    },
    onError: (error: any) => {
      console.error('Create budget error:', error);
      // Improve error toast for unique violation
      if (error?.message?.includes('duplicate key value')) {
        toast.error('Budget for this type/category/month/year already exists');
      } else {
        toast.error('Failed to create budget');
      }
    }
  });

  const updateBudget = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Budget> & { id: string }) => {
      // Fix: handle empty string case
      const safeUpdateData = {
        ...updateData,
        category_id: updateData.category_id === '' ? null : updateData.category_id,
      };

      const { data, error } = await supabase
        .from('budgets')
        .update(safeUpdateData)
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
    onError: (error: any) => {
      console.error('Update budget error:', error);
      if (error?.message?.includes('duplicate key value')) {
        toast.error('Budget for this type/category/month/year already exists');
      } else {
        toast.error('Failed to update budget');
      }
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
