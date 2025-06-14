
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
      if (!user) {
        console.log('useUserShows: No user authenticated');
        return [];
      }
      
      try {
        console.log('useUserShows: Fetching shows for user:', user.id);
        
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
          
        if (trackingError) {
          console.error('useUserShows: Error fetching tracked shows:', trackingError);
          throw trackingError;
        }
        
        console.log('useUserShows: Raw tracked shows data:', trackedShows);
        
        if (!trackedShows || trackedShows.length === 0) {
          console.log('useUserShows: No tracked shows found');
          return [];
        }

        // Transform the data using the pre-calculated values
        const showsWithProgress = trackedShows
          .map((item) => {
            const show = item.shows;
            if (!show) {
              console.warn('useUserShows: Missing show data for item:', item);
              return null;
            }

            const totalEpisodes = item.total_episodes || 0;
            const watchedEpisodes = item.watched_episodes || 0;

            console.log(`useUserShows: Show "${show.title}" - Total: ${totalEpisodes}, Watched: ${watchedEpisodes}`);

            // Determine status based on progress
            let status: 'watching' | 'completed' | 'not_started' = 'not_started';
            if (totalEpisodes > 0 && watchedEpisodes === totalEpisodes) {
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

        console.log('useUserShows: Final shows with progress:', showsWithProgress);
        return showsWithProgress;
        
      } catch (error) {
        console.error('useUserShows: Error fetching user shows:', error);
        return [];
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });

  console.log('useUserShows: Returning data:', { userShowsCount: userShows.length, isLoading });

  return {
    userShows,
    isLoading
  };
};
