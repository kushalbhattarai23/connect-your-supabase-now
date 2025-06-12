
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
        // Get user's tracked shows
        const { data: trackedShows, error: trackingError } = await supabase
          .from('user_show_tracking')
          .select(`
            show_id,
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

        // Get episode counts and watch status for each show
        const showsWithProgress = await Promise.all(
          trackedShows.map(async (item) => {
            const show = item.shows;
            if (!show) return null;

            // Get total episodes for this show
            const { data: episodes, error: episodesError } = await supabase
              .from('episodes')
              .select('id')
              .eq('show_id', show.id);

            if (episodesError) {
              console.error('Error fetching episodes:', episodesError);
              return null;
            }

            const totalEpisodes = episodes?.length || 0;

            // Get watched episodes count
            let watchedEpisodes = 0;
            if (totalEpisodes > 0) {
              const episodeIds = episodes?.map(ep => ep.id) || [];
              
              const { data: watchedData, error: watchedError } = await supabase
                .from('user_episode_status')
                .select('episode_id')
                .eq('user_id', user.id)
                .eq('status', 'watched')
                .in('episode_id', episodeIds);

              if (!watchedError && watchedData) {
                watchedEpisodes = watchedData.length;
              }
            }

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
        );

        // Filter out null results and return
        return showsWithProgress.filter(Boolean) as UserShow[];
        
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
