
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

  const { data: episodes = [], isLoading } = useQuery({
    queryKey: ['universe-episodes', universeId, user?.id],
    queryFn: async () => {
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

      // Get all episodes for these shows
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

      if (episodesError) throw episodesError;

      // Get user episode status for these episodes
      const episodeIds = episodesData?.map(ep => ep.id) || [];
      let userEpisodeStatus: any[] = [];

      if (user && episodeIds.length > 0) {
        const { data: statusData, error: statusError } = await supabase
          .from('user_episode_status')
          .select('episode_id, status, watched_at')
          .eq('user_id', user.id)
          .in('episode_id', episodeIds);

        if (statusError) throw statusError;
        userEpisodeStatus = statusData || [];
      }

      // Combine episodes with watch status and show info
      const episodesWithStatus: UniverseEpisode[] = (episodesData || []).map(episode => {
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
    },
    enabled: !!universeId && !!user
  });

  return {
    episodes,
    isLoading
  };
};
