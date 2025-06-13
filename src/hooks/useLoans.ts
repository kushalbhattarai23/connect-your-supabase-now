
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Loan {
  id: string;
  name: string;
  type: 'Personal' | 'Mortgage' | 'Car' | 'Student' | 'Business' | 'Other';
  amount: number;
  remaining_amount: number;
  status: 'active' | 'paid_off' | 'defaulted';
  person: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLoanData {
  name: string;
  type: string;
  amount: number;
  remaining_amount: number;
  status?: string;
  person: string;
  description?: string;
}

export const useLoans = () => {
  const queryClient = useQueryClient();

  const {
    data: loans = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans')
        .select('id, name, type, amount, remaining_amount, status, person, description, user_id, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Loan[];
    }
  });

  const createLoan = useMutation({
    mutationFn: async (loanData: CreateLoanData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('loans')
        .insert([{ ...loanData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success('Loan created successfully');
    },
    onError: (error) => {
      console.error('Create loan error:', error);
      toast.error('Failed to create loan');
    }
  });

  const updateLoan = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Loan> & { id: string }) => {
      const { data, error } = await supabase
        .from('loans')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success('Loan updated successfully');
    },
    onError: (error) => {
      console.error('Update loan error:', error);
      toast.error('Failed to update loan');
    }
  });

  const deleteLoan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('loans')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success('Loan deleted successfully');
    },
    onError: (error) => {
      console.error('Delete loan error:', error);
      toast.error('Failed to delete loan');
    }
  });

  return {
    loans,
    isLoading,
    error,
    createLoan,
    updateLoan,
    deleteLoan
  };
};
