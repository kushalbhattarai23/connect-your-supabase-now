
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserShow {
  id: string;
  title: string;
  description?: string;
  poster_url?: string;
  totalEpisodes: number;
  watchedEpisodes: number;
  status: 'watching' | 'completed' | 'not_started';
}

export const useUserShows = () => {
  const { user } = useAuth();

  const { data: userShows = [], isLoading } = useQuery({
    queryKey: ['user-shows', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_show_tracking')
        .select(`
          *,
          shows (
            id,
            title,
            description,
            poster_url
          )
        `)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Transform the data to match UserShow interface
      return data.map(item => ({
        id: item.shows.id,
        title: item.shows.title,
        description: item.shows.description,
        poster_url: item.shows.poster_url,
        totalEpisodes: Math.floor(Math.random() * 100) + 10, // Mock data
        watchedEpisodes: Math.floor(Math.random() * 50), // Mock data
        status: ['watching', 'completed', 'not_started'][Math.floor(Math.random() * 3)] as any
      })) as UserShow[];
    },
    enabled: !!user
  });

  return {
    userShows,
    isLoading
  };
};
