
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, Clock, CheckCircle, Plus, Star, Tv as TvIcon, HeartOff, Loader2 } from 'lucide-react';
import { useUserShows } from '@/hooks/useUserShows';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const TVShowMyShows: React.FC = () => {
  const { userShows, isLoading } = useUserShows();
  const [filter, setFilter] = useState<'all' | 'watching' | 'not_started' | 'completed'>('all');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const filteredShows = userShows.filter(show => {
    if (filter === 'all') return true;
    return show.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'watching': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'not_started': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'watching': return <Eye className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'not_started': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleShowClick = (showId: string) => {
    navigate(`/tv-shows/show/${showId}`);
  };

  const handleViewShows = () => {
    navigate('/tv-shows/public-shows');
  };

  // Untrack show mutation
  const { mutate: untrackShow } = useMutation({
    mutationFn: async (showId: string) => {
      if (!user) {
        throw new Error('You must be logged in to untrack shows');
      }
      
      const { error } = await supabase
        .from('user_show_tracking')
        .delete()
        .eq('user_id', user.id)
        .eq('show_id', showId);
        
      if (error) throw error;
      return { showId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-shows'] });
      toast({
        title: 'Show removed from your list',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error removing show',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-purple-700">My Shows</h1>
          <p className="text-muted-foreground">Track your personal TV show collection</p>
        </div>
        
        <Button 
          className="bg-purple-600 hover:bg-purple-700"
          onClick={handleViewShows}
        >
          <Plus className="mr-2 h-4 w-4" />
          Browse Shows
        </Button>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All Shows', count: userShows.length },
          { key: 'watching', label: 'Watching', count: userShows.filter(s => s.status === 'watching').length },
          { key: 'not_started', label: 'Not Started', count: userShows.filter(s => s.status === 'not_started').length },
          { key: 'completed', label: 'Completed', count: userShows.filter(s => s.status === 'completed').length }
        ].map(({ key, label, count }) => (
          <Button
            key={key}
            variant={filter === key ? 'default' : 'outline'}
            onClick={() => setFilter(key as any)}
            className="flex-1 sm:flex-none"
          >
            {label} ({count})
          </Button>
        ))}
      </div>

      {filteredShows.length === 0 ? (
        <Card className="border-purple-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Eye className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No shows found</p>
            <p className="text-muted-foreground mb-4">
              {filter === 'all' ? 'Start tracking shows to see them here' : `No ${filter.replace('_', ' ')} shows found`}
            </p>
            <Button onClick={handleViewShows} className="bg-purple-600 hover:bg-purple-700">
              Browse Shows
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShows.map((show) => {
            const progressPercentage = show.totalEpisodes > 0 ? (show.watchedEpisodes / show.totalEpisodes) * 100 : 0;
            
            return (
              <Card key={show.id} className="h-full transition-all hover:shadow-md overflow-hidden border-purple-200">
                <Link to={`/tv-shows/show/${show.id}`}>
                  {show.poster_url ? (
                    <div className="aspect-video w-full overflow-hidden">
                      <img 
                        src={show.poster_url} 
                        alt={show.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-muted flex items-center justify-center">
                      <TvIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </Link>
                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-1 text-purple-700">{show.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Status Badge */}
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className={`${getStatusColor(show.status)} text-white border-0 flex items-center gap-1`}>
                        {getStatusIcon(show.status)}
                        {show.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                    
                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">
                        {show.watchedEpisodes} / {show.totalEpisodes} episodes
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant={show.status === 'watching' ? "default" : "outline"}
                        onClick={(e) => {
                          e.preventDefault();
                          untrackShow(show.id);
                        }}
                        className={show.status === 'watching' ? "bg-purple-600 hover:bg-purple-700" : "border-purple-200 text-purple-700 hover:bg-purple-50"}
                      >
                        <HeartOff className="h-3 w-3 mr-1" />
                        Untrack
                      </Button>
                      <Link to={`/tv-shows/show/${show.id}`}>
                        <Button size="sm" variant="secondary" className="border-purple-200">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TVShowMyShows;
