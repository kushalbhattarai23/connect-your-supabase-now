
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
        // Use a single query with joins instead of multiple queries
        const offset = (page - 1) * pageSize;
        
        let query = supabase
          .from('episodes')
          .select(`
            id,
            title,
            season_number,
            episode_number,
            air_date,
            show_id,
            shows!inner(id, title, slug),
            show_universes!inner(universe_id),
            user_episode_status(status, watched_at)
          `, { count: 'exact' })
          .eq('show_universes.universe_id', universeId);

        if (user) {
          query = query.eq('user_episode_status.user_id', user.id);
        }

        const { data: episodesData, error, count } = await query
          .order('air_date', { ascending: true })
          .range(offset, offset + pageSize - 1);

        if (error) {
          console.error('Error fetching episodes:', error);
          return { episodes: [], totalCount: 0, hasMore: false };
        }

        if (!episodesData) {
          return { episodes: [], totalCount: 0, hasMore: false };
        }

        const episodes: UniverseEpisode[] = episodesData.map(episode => ({
          id: episode.id,
          title: episode.title,
          season_number: episode.season_number,
          episode_number: episode.episode_number,
          air_date: episode.air_date,
          show_id: episode.show_id,
          watched: episode.user_episode_status?.[0]?.status === 'watched' || false,
          watched_at: episode.user_episode_status?.[0]?.watched_at,
          show: episode.shows
        }));

        // Sort: not watched episodes first, then watched episodes
        const sortedEpisodes = episodes.sort((a, b) => {
          if (a.watched !== b.watched) {
            return a.watched ? 1 : -1;
          }
          
          if (a.air_date && b.air_date) {
            return new Date(a.air_date).getTime() - new Date(b.air_date).getTime();
          }
          
          return 0;
        });

        const totalCount = count || 0;
        const hasMore = offset + pageSize < totalCount;

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
    enabled: !!universeId && !!user,
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
