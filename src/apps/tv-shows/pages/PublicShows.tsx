
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Search, Tv as TvIcon, Globe, Heart, HeartOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Show } from '@/types';
import { adaptDbShowToShow } from '@/utils/type-adapters';
import { useAuth } from '@/hooks/useAuth';

export const TVShowPublicShows: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchPublicShows = async () => {
    try {
      let query = supabase
        .from('shows')
        .select('*')
        .eq('is_public', true)
        .order('title', { ascending: true });

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data ? data.map(adaptDbShowToShow) : [];
    } catch (error: any) {
      toast({
        title: 'Error fetching shows',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    }
  };

  const { data: shows = [], isLoading, refetch } = useQuery({
    queryKey: ['publicShows', searchTerm],
    queryFn: fetchPublicShows
  });

  // Fetch user's tracked shows
  const { data: trackedShows = [] } = useQuery({
    queryKey: ['trackedShows', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_show_tracking')
        .select('show_id')
        .eq('user_id', user.id);
        
      if (error) throw error;
      return data.map(item => item.show_id);
    },
    enabled: !!user
  });

  // Track/untrack show mutation
  const { mutate: toggleTracking } = useMutation({
    mutationFn: async (showId: string) => {
      if (!user) {
        throw new Error('You must be logged in to track shows');
      }
      
      const isTracked = trackedShows.includes(showId);
      
      if (isTracked) {
        const { error } = await supabase
          .from('user_show_tracking')
          .delete()
          .eq('user_id', user.id)
          .eq('show_id', showId);
          
        if (error) throw error;
        return { showId, isTracking: false };
      } else {
        const { error } = await supabase
          .from('user_show_tracking')
          .insert({ user_id: user.id, show_id: showId });
          
        if (error) throw error;
        return { showId, isTracking: true };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trackedShows'] });
      toast({
        title: data.isTracking ? 'Show added to your list' : 'Show removed from your list',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating tracking',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-purple-700">Public Shows</h1>
          <p className="text-muted-foreground">Discover popular shows from the community</p>
        </div>

        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="text"
            placeholder="Search shows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="secondary" className="border-purple-200">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : shows.length === 0 ? (
        <Card className="border-purple-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No public shows found</p>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shows.map((show) => {
            const isTracked = trackedShows.includes(show.id);
            
            return (
              <Card key={show.id} className="h-full transition-all hover:shadow-md overflow-hidden border-purple-200">
                <Link to={`/tv-shows/show/${show.slug || show.id}`}>
                  {show.poster ? (
                    <div className="aspect-video w-full overflow-hidden">
                      <img 
                        src={show.poster} 
                        alt={show.name} 
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
                  <CardTitle className="line-clamp-1 text-purple-700">{show.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center gap-2">
                    <div className="text-sm text-muted-foreground flex-1">
                      {show.genres?.length ? show.genres.join(', ') : 'No genres'}
                    </div>
                    <div className="flex gap-2">
                      {user && (
                        <Button 
                          size="sm" 
                          variant={isTracked ? "default" : "outline"}
                          onClick={(e) => {
                            e.preventDefault();
                            toggleTracking(show.id);
                          }}
                          className={isTracked ? "bg-purple-600 hover:bg-purple-700" : "border-purple-200 text-purple-700 hover:bg-purple-50"}
                        >
                          {isTracked ? (
                            <>
                              <HeartOff className="h-3 w-3 mr-1" />
                              Untrack
                            </>
                          ) : (
                            <>
                              <Heart className="h-3 w-3 mr-1" />
                              Track
                            </>
                          )}
                        </Button>
                      )}
                      <Link to={`/tv-shows/show/${show.slug || show.id}`}>
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

export default TVShowPublicShows;
