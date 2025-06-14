
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
      
      try {
        // Get user's tracked shows with pre-calculated episode counts
        const { data: trackedShows, error: trackingError } = await supabase
          .from('user_show_tracking')
          .select(`
            show_id,
            total_episodes,
            watched_episodes,
            shows (
              id,
              title,
              description,
              poster_url,
              slug
            )
          `)
          .eq('user_id', user.id);
          
        if (trackingError) throw trackingError;
        
        if (!trackedShows || trackedShows.length === 0) {
          return [];
        }

        // Transform the data using the pre-calculated values
        const showsWithProgress = trackedShows
          .map((item) => {
            const show = item.shows;
            if (!show) return null;

            const totalEpisodes = item.total_episodes || 0;
            const watchedEpisodes = item.watched_episodes || 0;

            // Determine status based on progress
            let status: 'watching' | 'completed' | 'not_started' = 'not_started';
            if (watchedEpisodes === totalEpisodes && totalEpisodes > 0) {
              status = 'completed';
            } else if (watchedEpisodes > 0) {
              status = 'watching';
            }

            return {
              id: show.id,
              title: show.title,
              description: show.description,
              poster_url: show.poster_url,
              totalEpisodes,
              watchedEpisodes,
              status
            } as UserShow;
          })
          .filter(Boolean) as UserShow[];

        return showsWithProgress;
        
      } catch (error) {
        console.error('Error fetching user shows:', error);
        return [];
      }
    },
    enabled: !!user
  });

  return {
    userShows,
    isLoading
  };
};
