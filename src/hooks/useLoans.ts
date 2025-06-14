
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
  person: string | null;
  description?: string | null;
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
      console.log('Fetching loans...');
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching loans:', error);
        throw error;
      }
      console.log('Loans fetched:', data);
      return data as Loan[];
    }
  });

  const createLoan = useMutation({
    mutationFn: async (loanData: CreateLoanData) => {
      console.log('Creating loan with data:', loanData);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        throw new Error('User not authenticated');
      }

      console.log('Authenticated user:', user.id);

      const insertData = {
        ...loanData,
        user_id: user.id,
        status: loanData.status || 'active'
      };
      
      console.log('Insert data:', insertData);

      const { data, error } = await supabase
        .from('loans')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Create loan error:', error);
        throw error;
      }
      
      console.log('Loan created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success('Loan created successfully');
    },
    onError: (error) => {
      console.error('Create loan error:', error);
      toast.error('Failed to create loan: ' + error.message);
    }
  });

  const updateLoan = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Loan> & { id: string }) => {
      console.log('Updating loan:', id, updateData);
      
      const { data, error } = await supabase
        .from('loans')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Update loan error:', error);
        throw error;
      }
      
      console.log('Loan updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success('Loan updated successfully');
    },
    onError: (error) => {
      console.error('Update loan error:', error);
      toast.error('Failed to update loan: ' + error.message);
    }
  });

  const deleteLoan = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting loan:', id);
      
      const { error } = await supabase
        .from('loans')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete loan error:', error);
        throw error;
      }
      
      console.log('Loan deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success('Loan deleted successfully');
    },
    onError: (error) => {
      console.error('Delete loan error:', error);
      toast.error('Failed to delete loan: ' + error.message);
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
