
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

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['universe-episodes', universeId, user?.id],
    queryFn: async () => {
      if (!universeId) return { episodes: [] };

      try {
        console.log('Fetching all episodes for universe:', universeId);
        
        // Step 1: Get show IDs in the universe
        const { data: showUniverses, error: showUniverseError } = await supabase
          .from('show_universes')
          .select('show_id')
          .eq('universe_id', universeId);

        if (showUniverseError) {
          console.error('Error fetching show universes:', showUniverseError);
          return { episodes: [] };
        }

        if (!showUniverses || showUniverses.length === 0) {
          console.log('No shows found in universe');
          return { episodes: [] };
        }

        const showIds = showUniverses.map(su => su.show_id);
        console.log('Found shows in universe:', showIds.length);

        // Step 2: Get all episodes
        const { data: episodesData, error: episodesError } = await supabase
          .from('episodes')
          .select('*')
          .in('show_id', showIds)
          .order('air_date', { ascending: true });

        if (episodesError) {
          console.error('Error fetching episodes:', episodesError);
          return { episodes: [] };
        }

        if (!episodesData || episodesData.length === 0) {
          console.log('No episodes found');
          return { episodes: [] };
        }

        console.log('Fetched episodes:', episodesData.length);

        // Step 3: Get show details
        const { data: showsData, error: showsError } = await supabase
          .from('shows')
          .select('id, title, slug')
          .in('id', showIds);

        if (showsError) {
          console.error('Error fetching shows:', showsError);
          return { episodes: [] };
        }

        const showsMap = new Map(showsData?.map(show => [show.id, show]) || []);

        // Step 4: Get watch status if user is logged in
        let watchedEpisodeIds = new Set<string>();
        let watchStatusMap = new Map<string, string>();

        if (user) {
          const episodeIds = episodesData.map(ep => ep.id);
          const { data: watchStatus, error: watchError } = await supabase
            .from('user_episode_status')
            .select('episode_id, status, watched_at')
            .eq('user_id', user.id)
            .in('episode_id', episodeIds);

          if (watchError) {
            console.error('Error fetching watch status:', watchError);
          } else if (watchStatus) {
            watchStatus.forEach(ws => {
              if (ws.status === 'watched') {
                watchedEpisodeIds.add(ws.episode_id);
                watchStatusMap.set(ws.episode_id, ws.watched_at);
              }
            });
            console.log('Found watched episodes:', watchedEpisodeIds.size);
          }
        }

        // Step 5: Combine all data
        const episodes: UniverseEpisode[] = episodesData.map(episode => ({
          id: episode.id,
          title: episode.title,
          season_number: episode.season_number,
          episode_number: episode.episode_number,
          air_date: episode.air_date,
          show_id: episode.show_id,
          watched: watchedEpisodeIds.has(episode.id),
          watched_at: watchStatusMap.get(episode.id),
          show: showsMap.get(episode.show_id)
        }));

        // Step 6: Sort episodes (unwatched first, then watched)
        const sortedEpisodes = episodes.sort((a, b) => {
          if (a.watched !== b.watched) {
            return a.watched ? 1 : -1;
          }
          
          if (a.air_date && b.air_date) {
            return new Date(a.air_date).getTime() - new Date(b.air_date).getTime();
          }
          
          return 0;
        });

        console.log('Returning episodes:', sortedEpisodes.length);

        return {
          episodes: sortedEpisodes
        };
      } catch (error) {
        console.error('Error in useUniverseEpisodes:', error);
        return { episodes: [] };
      }
    },
    enabled: !!universeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    episodes: data?.episodes || [],
    isLoading,
    refetch
  };
};
