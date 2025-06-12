
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

export const useUniverseEpisodes = (universeId: string, page: number = 1, pageSize: number = 50) => {
  const { user } = useAuth();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['universe-episodes', universeId, user?.id, page, pageSize],
    queryFn: async () => {
      if (!universeId) return { episodes: [], totalCount: 0, hasMore: false };

      try {
        console.log('Fetching episodes for universe:', universeId, 'page:', page);
        
        // Step 1: Get show IDs in the universe
        const { data: showUniverses, error: showUniverseError } = await supabase
          .from('show_universes')
          .select('show_id')
          .eq('universe_id', universeId);

        if (showUniverseError) {
          console.error('Error fetching show universes:', showUniverseError);
          return { episodes: [], totalCount: 0, hasMore: false };
        }

        if (!showUniverses || showUniverses.length === 0) {
          console.log('No shows found in universe');
          return { episodes: [], totalCount: 0, hasMore: false };
        }

        const showIds = showUniverses.map(su => su.show_id);
        console.log('Found shows in universe:', showIds.length);

        // Step 2: Get episodes count for pagination
        const { count, error: countError } = await supabase
          .from('episodes')
          .select('*', { count: 'exact', head: true })
          .in('show_id', showIds);

        if (countError) {
          console.error('Error counting episodes:', countError);
          return { episodes: [], totalCount: 0, hasMore: false };
        }

        const totalCount = count || 0;
        console.log('Total episodes in universe:', totalCount);

        // Step 3: Get paginated episodes
        const offset = (page - 1) * pageSize;
        const { data: episodesData, error: episodesError } = await supabase
          .from('episodes')
          .select('*')
          .in('show_id', showIds)
          .order('air_date', { ascending: true })
          .range(offset, offset + pageSize - 1);

        if (episodesError) {
          console.error('Error fetching episodes:', episodesError);
          return { episodes: [], totalCount: 0, hasMore: false };
        }

        if (!episodesData || episodesData.length === 0) {
          console.log('No episodes found');
          return { episodes: [], totalCount: 0, hasMore: false };
        }

        console.log('Fetched episodes:', episodesData.length);

        // Step 4: Get show details
        const { data: showsData, error: showsError } = await supabase
          .from('shows')
          .select('id, title, slug')
          .in('id', showIds);

        if (showsError) {
          console.error('Error fetching shows:', showsError);
          return { episodes: [], totalCount: 0, hasMore: false };
        }

        const showsMap = new Map(showsData?.map(show => [show.id, show]) || []);

        // Step 5: Get watch status if user is logged in
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

        // Step 6: Combine all data
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

        // Step 7: Sort episodes (unwatched first, then watched)
        const sortedEpisodes = episodes.sort((a, b) => {
          if (a.watched !== b.watched) {
            return a.watched ? 1 : -1;
          }
          
          if (a.air_date && b.air_date) {
            return new Date(a.air_date).getTime() - new Date(b.air_date).getTime();
          }
          
          return 0;
        });

        const hasMore = offset + pageSize < totalCount;

        console.log('Returning episodes:', sortedEpisodes.length, 'hasMore:', hasMore);

        return {
          episodes: sortedEpisodes,
          totalCount,
          hasMore
        };
      } catch (error) {
        console.error('Error in useUniverseEpisodes:', error);
        return { episodes: [], totalCount: 0, hasMore: false };
      }
    },
    enabled: !!universeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    episodes: data?.episodes || [],
    totalCount: data?.totalCount || 0,
    hasMore: data?.hasMore || false,
    isLoading,
    refetch
  };
};
