
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Database } from '@/integrations/supabase/types';

export type Request = Database['public']['Tables']['requests']['Row'];
export type NewRequest = Database['public']['Tables']['requests']['Insert'];

export function useRequests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: requests, isLoading, error } = useQuery({
    queryKey: ['requests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      return data;
    },
    enabled: !!user,
  });

  const createRequestMutation = useMutation({
    mutationFn: async (newRequest: NewRequest) => {
      const { data, error } = await supabase
        .from('requests')
        .insert(newRequest)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests', user?.id] });
    },
  });

  return {
    requests,
    isLoading,
    error,
    createRequest: createRequestMutation.mutateAsync,
  };
}
