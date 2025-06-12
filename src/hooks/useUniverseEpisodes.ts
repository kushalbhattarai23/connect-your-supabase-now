
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UniverseEpisode {
  id: string;
  title: string;
  season_number: number;
  episode_number: number;
  air_date: string | null;
  show_id: string;
  watched: boolean;
  watched_at?: string;
  show?: {
    id: string;
    title: string;
    slug?: string;
  };
}

export const useUniverseEpisodes = (universeId: string) => {
  const { user } = useAuth();

  const { data: episodes = [], isLoading, refetch } = useQuery({
    queryKey: ['universe-episodes', universeId, user?.id],
    queryFn: async () => {
      if (!universeId) return [];

      try {
        // First get all shows in the universe
        const { data: universeShows, error: universeError } = await supabase
          .from('show_universes')
          .select('show_id, show:shows(id, title, slug)')
          .eq('universe_id', universeId);

        if (universeError) throw universeError;

        if (!universeShows || universeShows.length === 0) {
          return [];
        }

        const showIds = universeShows.map(us => us.show_id);

        // Get all episodes for these shows with better error handling
        const { data: episodesData, error: episodesError } = await supabase
          .from('episodes')
          .select(`
            id,
            title,
            season_number,
            episode_number,
            air_date,
            show_id
          `)
          .in('show_id', showIds)
          .order('air_date', { ascending: true });

        if (episodesError) {
          console.error('Error fetching episodes:', episodesError);
          return [];
        }

        if (!episodesData || episodesData.length === 0) {
          return [];
        }

        // Get user episode status for these episodes
        const episodeIds = episodesData.map(ep => ep.id);
        let userEpisodeStatus: any[] = [];

        if (user && episodeIds.length > 0) {
          // Use batch processing for large episode counts
          const batchSize = 1000;
          const batches = [];
          
          for (let i = 0; i < episodeIds.length; i += batchSize) {
            const batch = episodeIds.slice(i, i + batchSize);
            batches.push(batch);
          }

          for (const batch of batches) {
            const { data: statusData, error: statusError } = await supabase
              .from('user_episode_status')
              .select('episode_id, status, watched_at')
              .eq('user_id', user.id)
              .in('episode_id', batch);

            if (statusError) {
              console.error('Error fetching episode status:', statusError);
            } else if (statusData) {
              userEpisodeStatus.push(...statusData);
            }
          }
        }

        // Combine episodes with watch status and show info
        const episodesWithStatus: UniverseEpisode[] = episodesData.map(episode => {
          const status = userEpisodeStatus.find(s => s.episode_id === episode.id);
          const show = universeShows.find(us => us.show_id === episode.show_id)?.show;
          
          return {
            ...episode,
            watched: status?.status === 'watched',
            watched_at: status?.watched_at,
            show
          };
        });

        return episodesWithStatus;
      } catch (error) {
        console.error('Error in useUniverseEpisodes:', error);
        return [];
      }
    },
    enabled: !!universeId && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    episodes,
    isLoading,
    refetch
  };
};
