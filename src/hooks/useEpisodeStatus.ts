
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useEpisodeStatus = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const toggleWatchStatus = useMutation({
    mutationFn: async ({ episodeId, currentStatus }: { episodeId: string; currentStatus: boolean }) => {
      if (!user) throw new Error('User not authenticated');

      const newStatus = currentStatus ? 'not_watched' : 'watched';
      const watchedAt = currentStatus ? null : new Date().toISOString();

      // Check if record exists
      const { data: existingStatus } = await supabase
        .from('user_episode_status')
        .select('id')
        .eq('user_id', user.id)
        .eq('episode_id', episodeId)
        .single();

      if (existingStatus) {
        // Update existing record
        const { error } = await supabase
          .from('user_episode_status')
          .update({
            status: newStatus,
            watched_at: watchedAt,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('episode_id', episodeId);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('user_episode_status')
          .insert({
            user_id: user.id,
            episode_id: episodeId,
            status: newStatus,
            watched_at: watchedAt
          });

        if (error) throw error;
      }

      return { episodeId, newStatus: newStatus === 'watched' };
    },
    onSuccess: (data) => {
      // Invalidate and refetch universe episodes data
      queryClient.invalidateQueries({ queryKey: ['universe-episodes'] });
      console.log(`Episode ${data.episodeId} marked as ${data.newStatus ? 'watched' : 'not watched'}`);
    },
    onError: (error) => {
      console.error('Error updating episode status:', error);
    }
  });

  return {
    toggleWatchStatus: toggleWatchStatus.mutate,
    isUpdating: toggleWatchStatus.isPending
  };
};
