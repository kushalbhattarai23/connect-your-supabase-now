import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useOrganizationContext } from '@/contexts/OrganizationContext';

export interface Category {
  id: string;
  name: string;
  color: string;
  user_id: string;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

export const useCategories = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentOrganization, isPersonalMode } = useOrganizationContext();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories', user?.id, currentOrganization?.id],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase.from('categories').select('*');
      
      if (isPersonalMode) {
        query = query.is('organization_id', null);
      } else if (currentOrganization) {
        query = query.eq('organization_id', currentOrganization.id);
      }
      
      const { data, error } = await query.order('name', { ascending: true });
        
      if (error) throw error;
      return data as Category[];
    },
    enabled: !!user
  });

  const createCategory = useMutation({
    mutationFn: async (category: Omit<Category, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'organization_id'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...category,
          user_id: user.id,
          organization_id: isPersonalMode ? null : currentOrganization?.id
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Category created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating category', description: error.message, variant: 'destructive' });
    }
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Category> & { id: string }) => {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Category updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating category', description: error.message, variant: 'destructive' });
    }
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Category deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting category', description: error.message, variant: 'destructive' });
    }
  });

  return {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory
  };
};
