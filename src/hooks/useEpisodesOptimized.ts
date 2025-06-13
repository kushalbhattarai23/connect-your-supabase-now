
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Episode {
  id: string;
  title: string;
  episode_number: number;
  season_number: number;
  air_date: string | null;
  show_id: string;
  show_title?: string;
  is_watched: boolean;
}

interface EpisodeStats {
  total: number;
  watched: number;
  unwatched: number;
}

export const useEpisodesOptimized = (showId?: string) => {
  const { user } = useAuth();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [stats, setStats] = useState<EpisodeStats>({ total: 0, watched: 0, unwatched: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 100; // Larger page size for better performance

  const fetchEpisodes = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    if (!showId || isLoading) return;
    
    setIsLoading(true);
    
    try {
      // First get total count and stats
      if (pageNum === 1 || reset) {
        const { count } = await supabase
          .from('episodes')
          .select('*', { count: 'exact', head: true })
          .eq('show_id', showId);
        
        setStats(prev => ({ ...prev, total: count || 0 }));
        
        // Get watched count if user is logged in
        if (user) {
          const { count: watchedCount } = await supabase
            .from('user_episode_status')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'watched')
            .in('episode_id', 
              supabase
                .from('episodes')
                .select('id')
                .eq('show_id', showId)
            );
          
          setStats(prev => ({
            ...prev,
            watched: watchedCount || 0,
            unwatched: (count || 0) - (watchedCount || 0)
          }));
        }
      }

      // Fetch episodes for current page
      const from = (pageNum - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data: episodeData, error } = await supabase
        .from('episodes')
        .select('*')
        .eq('show_id', showId)
        .order('season_number', { ascending: true })
        .order('episode_number', { ascending: true })
        .range(from, to);

      if (error) throw error;

      let episodesWithStatus = episodeData?.map(ep => ({
        ...ep,
        is_watched: false
      })) || [];

      // Get watch status for this batch if user is logged in
      if (user && episodesWithStatus.length > 0) {
        const episodeIds = episodesWithStatus.map(ep => ep.id);
        
        const { data: watchStatus } = await supabase
          .from('user_episode_status')
          .select('episode_id')
          .eq('user_id', user.id)
          .eq('status', 'watched')
          .in('episode_id', episodeIds);

        const watchedSet = new Set(watchStatus?.map(ws => ws.episode_id) || []);
        
        episodesWithStatus = episodesWithStatus.map(ep => ({
          ...ep,
          is_watched: watchedSet.has(ep.id)
        }));
      }

      if (reset || pageNum === 1) {
        setEpisodes(episodesWithStatus);
      } else {
        setEpisodes(prev => [...prev, ...episodesWithStatus]);
      }

      setHasMore(episodesWithStatus.length === pageSize);
      
    } catch (error: any) {
      console.error('Error fetching episodes:', error);
      toast.error('Failed to load episodes');
    } finally {
      setIsLoading(false);
    }
  }, [showId, user, isLoading, pageSize]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchEpisodes(nextPage, false);
    }
  }, [page, hasMore, isLoading, fetchEpisodes]);

  const refresh = useCallback(() => {
    setPage(1);
    setEpisodes([]);
    setHasMore(true);
    fetchEpisodes(1, true);
  }, [fetchEpisodes]);

  useEffect(() => {
    if (showId) {
      refresh();
    }
  }, [showId, user]);

  return {
    episodes,
    stats,
    isLoading,
    hasMore,
    loadMore,
    refresh
  };
};
