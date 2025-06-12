
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

        // Step 2: Batch fetch episodes with proper ordering
        const { data: episodesData, error: episodesError } = await supabase
          .from('episodes')
          .select('*')
          .in('show_id', showIds)
          .order('air_date', { ascending: true, nullsFirst: false })
          .order('season_number', { ascending: true })
          .order('episode_number', { ascending: true });

        if (episodesError) {
          console.error('Error fetching episodes:', episodesError);
          return { episodes: [] };
        }

        if (!episodesData || episodesData.length === 0) {
          console.log('No episodes found');
          return { episodes: [] };
        }

        console.log('Fetched episodes:', episodesData.length);

        // Step 3: Batch fetch show details
        const { data: showsData, error: showsError } = await supabase
          .from('shows')
          .select('id, title, slug')
          .in('id', showIds);

        if (showsError) {
          console.error('Error fetching shows:', showsError);
          return { episodes: [] };
        }

        const showsMap = new Map(showsData?.map(show => [show.id, show]) || []);

        // Step 4: Batch fetch watch status if user is logged in
        let watchedEpisodeIds = new Set<string>();
        let watchStatusMap = new Map<string, string>();

        if (user && episodesData.length > 0) {
          // Process episodes in batches of 1000 to avoid query limits
          const batchSize = 1000;
          const episodeIds = episodesData.map(ep => ep.id);
          
          for (let i = 0; i < episodeIds.length; i += batchSize) {
            const batch = episodeIds.slice(i, i + batchSize);
            
            const { data: watchStatus, error: watchError } = await supabase
              .from('user_episode_status')
              .select('episode_id, status, watched_at')
              .eq('user_id', user.id)
              .in('episode_id', batch);

            if (watchError) {
              console.error('Error fetching watch status for batch:', watchError);
            } else if (watchStatus) {
              watchStatus.forEach(ws => {
                if (ws.status === 'watched') {
                  watchedEpisodeIds.add(ws.episode_id);
                  if (ws.watched_at) {
                    watchStatusMap.set(ws.episode_id, ws.watched_at);
                  }
                }
              });
            }
          }
          
          console.log('Found watched episodes:', watchedEpisodeIds.size);
        }

        // Step 5: Combine all data and create episodes array
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

        // Step 6: Sort episodes properly - unwatched first by air date, then watched by air date
        const sortedEpisodes = episodes.sort((a, b) => {
          // Primary sort: unwatched episodes first
          if (a.watched !== b.watched) {
            return a.watched ? 1 : -1;
          }
          
          // Secondary sort: by air date (ascending)
          if (a.air_date && b.air_date) {
            const dateA = new Date(a.air_date).getTime();
            const dateB = new Date(b.air_date).getTime();
            if (dateA !== dateB) {
              return dateA - dateB;
            }
          }
          
          // Handle null air dates (put them at the end)
          if (a.air_date && !b.air_date) return -1;
          if (!a.air_date && b.air_date) return 1;
          
          // Tertiary sort: by season and episode number
          if (a.season_number !== b.season_number) {
            return a.season_number - b.season_number;
          }
          
          return a.episode_number - b.episode_number;
        });

        console.log('Returning sorted episodes:', sortedEpisodes.length);
        console.log('Unwatched episodes:', sortedEpisodes.filter(e => !e.watched).length);
        console.log('Watched episodes:', sortedEpisodes.filter(e => e.watched).length);

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
