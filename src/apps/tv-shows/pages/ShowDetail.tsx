import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Heart, HeartOff, Eye, CheckCircle, Calendar, Clock, Tv as TvIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Show, Episode } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { adaptDbShowToShow, adaptDbEpisodeToEpisode } from '@/utils/type-adapters';

interface EpisodesBySeasonMap {
  [key: number]: {
    episodes: Episode[];
    watchedCount: number;
  };
}

export const ShowDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  // Fetch show details
  const { data: show, isLoading: isLoadingShow } = useQuery({
    queryKey: ['show', slug],
    queryFn: async () => {
      try {
        // Try to get by slug first
        let { data, error } = await supabase
          .from('shows')
          .select('*')
          .eq('slug', slug)
          .single();
        
        // If not found by slug, try by id
        if (error || !data) {
          ({ data, error } = await supabase
            .from('shows')
            .select('*')
            .eq('id', slug)
            .single());
        }
        
        if (error) throw error;
        if (!data) throw new Error('Show not found');
        
        return adaptDbShowToShow(data);
      } catch (error: any) {
        toast({
          title: 'Error fetching show',
          description: error.message,
          variant: 'destructive',
        });
        // Redirect back to shows list on error
        navigate('/tv-shows/public-shows');
        return null;
      }
    },
    enabled: !!slug
  });
  
  // Fetch episodes data for this show
  const { data: episodesData, isLoading: isLoadingEpisodes } = useQuery({
    queryKey: ['showEpisodes', show?.id],
    queryFn: async () => {
      try {
        // Fetch episodes
        const { data: episodes, error: episodesError } = await supabase
          .from('episodes')
          .select('*')
          .eq('show_id', show?.id)
          .order('season_number', { ascending: true })
          .order('episode_number', { ascending: true });
          
        if (episodesError) throw episodesError;
        
        // Fetch watch status if user is logged in
        let watchedStatus: Record<string, boolean> = {};
        
        if (user) {
          const { data: statusData, error: statusError } = await supabase
            .from('user_episode_status')
            .select('episode_id, status')
            .eq('user_id', user.id);
            
          if (!statusError && statusData) {
            watchedStatus = statusData.reduce((acc: Record<string, boolean>, curr) => {
              acc[curr.episode_id] = curr.status === 'watched';
              return acc;
            }, {});
          }
        }
        
        // Add watched status to episodes using our adapter
        const adaptedEpisodes = episodes ? episodes.map(ep => 
          adaptDbEpisodeToEpisode(ep, !!watchedStatus[ep.id])
        ) : [];
        
        return adaptedEpisodes;
      } catch (error: any) {
        toast({
          title: 'Error fetching episodes',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
    },
    enabled: !!show?.id
  });
  
  // Track show mutation
  const { mutate: toggleTracking } = useMutation({
    mutationFn: async () => {
      if (!user || !show?.id) {
        throw new Error('You must be logged in to track shows');
      }
      
      // Check if already tracking
      const { data, error } = await supabase
        .from('user_show_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('show_id', show.id);
        
      if (error) throw error;
      
      // If tracking, delete it, otherwise insert it
      if (data && data.length > 0) {
        const { error: deleteError } = await supabase
          .from('user_show_tracking')
          .delete()
          .eq('user_id', user.id)
          .eq('show_id', show.id);
          
        if (deleteError) throw deleteError;
        
        return { isTracking: false };
      } else {
        const { error: insertError } = await supabase
          .from('user_show_tracking')
          .insert({ user_id: user.id, show_id: show.id });
          
        if (insertError) throw insertError;
        
        return { isTracking: true };
      }
    },
    onSuccess: (data) => {
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
  
  // Toggle episode watch status
  const { mutate: toggleWatchStatus } = useMutation({
    mutationFn: async ({ episodeId, watched }: { episodeId: string, watched: boolean }) => {
      if (!user) {
        throw new Error('You must be logged in to track episodes');
      }
      
      // Check if status already exists
      const { data, error } = await supabase
        .from('user_episode_status')
        .select('*')
        .eq('user_id', user.id)
        .eq('episode_id', episodeId);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Update existing status
        const { error: updateError } = await supabase
          .from('user_episode_status')
          .update({ 
            status: watched ? 'watched' : 'not_watched',
            watched_at: watched ? new Date().toISOString() : null 
          })
          .eq('user_id', user.id)
          .eq('episode_id', episodeId);
          
        if (updateError) throw updateError;
      } else {
        // Insert new status
        const { error: insertError } = await supabase
          .from('user_episode_status')
          .insert({ 
            user_id: user.id, 
            episode_id: episodeId, 
            status: watched ? 'watched' : 'not_watched',
            watched_at: watched ? new Date().toISOString() : null 
          });
          
        if (insertError) throw insertError;
      }
      
      return { episodeId, watched };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['showEpisodes', show?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating episode status',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Mark all episodes in a season as watched
  const { mutate: markSeasonWatched } = useMutation({
    mutationFn: async (seasonNumber: number) => {
      if (!user || !episodesData) {
        throw new Error('You must be logged in to mark episodes');
      }

      const seasonEpisodes = episodesData.filter(ep => ep.season === seasonNumber);
      
      for (const episode of seasonEpisodes) {
        await toggleWatchStatus({ episodeId: episode.id, watched: true });
      }
    },
    onSuccess: () => {
      toast({ title: 'Season marked as watched' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error marking season as watched',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mark all episodes as watched
  const { mutate: markAllWatched } = useMutation({
    mutationFn: async () => {
      if (!user || !episodesData) {
        throw new Error('You must be logged in to mark episodes');
      }

      for (const episode of episodesData) {
        await toggleWatchStatus({ episodeId: episode.id, watched: true });
      }
    },
    onSuccess: () => {
      toast({ title: 'All episodes marked as watched' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error marking all episodes as watched',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Check if user is tracking this show
  const { data: isTracking = false } = useQuery({
    queryKey: ['isTrackingShow', show?.id, user?.id],
    queryFn: async () => {
      if (!user || !show?.id) return false;
      
      const { data, error } = await supabase
        .from('user_show_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('show_id', show.id);
        
      if (error) throw error;
      
      return data && data.length > 0;
    },
    enabled: !!user && !!show?.id
  });
  
  // Organize episodes by season with current season first
  const episodesBySeason: EpisodesBySeasonMap = {};
  
  if (episodesData) {
    episodesData.forEach(episode => {
      if (!episodesBySeason[episode.season]) {
        episodesBySeason[episode.season] = {
          episodes: [],
          watchedCount: 0
        };
      }
      
      episodesBySeason[episode.season].episodes.push(episode);
      
      if (episode.watched) {
        episodesBySeason[episode.season].watchedCount += 1;
      }
    });
  }

  // Sort seasons to show currently watching first, then completed ones
  const sortedSeasons = Object.entries(episodesBySeason).sort(([, a], [, b]) => {
    const aCompleted = a.watchedCount === a.episodes.length;
    const bCompleted = b.watchedCount === b.episodes.length;
    
    if (aCompleted !== bCompleted) {
      return aCompleted ? 1 : -1; // Currently watching first
    }
    
    return parseInt(a.episodes[0]?.season?.toString() || '0') - parseInt(b.episodes[0]?.season?.toString() || '0');
  });
  
  // Calculate total watched progress
  const totalEpisodes = episodesData?.length || 0;
  const watchedEpisodes = episodesData?.filter(ep => ep.watched)?.length || 0;
  const progressPercentage = totalEpisodes > 0 
    ? Math.round((watchedEpisodes / totalEpisodes) * 100) 
    : 0;
  
  if (isLoadingShow) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!show) {
    return null; // Navigation handled in the query error callback
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Show Poster/Details */}
          <div className="lg:w-1/3 xl:w-1/4">
            <Card className="overflow-hidden bg-card border-border">
              {show.poster ? (
                <div className="aspect-[2/3] w-full">
                  <img 
                    src={show.poster} 
                    alt={show.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[2/3] w-full bg-muted flex items-center justify-center">
                  <TvIcon className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              
              <CardContent className="p-4 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{show.name}</h2>
                  {show.airDate && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {show.airDate}
                    </div>
                  )}
                </div>
                
                {show.genres && show.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {show.genres.map((genre, i) => (
                      <Badge key={i} variant="outline">{genre}</Badge>
                    ))}
                  </div>
                )}
                
                {user && (
                  <>
                    <Button 
                      onClick={() => toggleTracking()} 
                      variant={isTracking ? "default" : "outline"}
                      className="w-full"
                    >
                      {isTracking ? (
                        <>
                          <HeartOff className="h-4 w-4 mr-2" />
                          Remove from My Shows
                        </>
                      ) : (
                        <>
                          <Heart className="h-4 w-4 mr-2" />
                          Add to My Shows
                        </>
                      )}
                    </Button>
                    
                    {isTracking && totalEpisodes > 0 && (
                      <Button 
                        onClick={() => markAllWatched()}
                        variant="outline"
                        className="w-full"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark All Watched
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Show Content */}
          <div className="flex-1">
            <Tabs 
              defaultValue="overview" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="mb-4 w-full bg-muted">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="episodes">Episodes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                {/* Description */}
                {show.description && (
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-foreground">Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground">{show.description}</p>
                    </CardContent>
                  </Card>
                )}
                
                {/* Progress */}
                {user && isTracking && (
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-foreground">Your Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground">Watched {watchedEpisodes} of {totalEpisodes} episodes</span>
                        <span className="text-foreground">{progressPercentage}% complete</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="episodes" className="space-y-6">
                {isLoadingEpisodes ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : sortedSeasons.length === 0 ? (
                  <Card className="bg-card border-border">
                    <CardContent className="py-8 text-center">
                      <p className="text-foreground">No episodes available for this show.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Accordion type="multiple" className="space-y-4">
                    {sortedSeasons.map(([season, data]) => {
                      const isCompleted = data.watchedCount === data.episodes.length;
                      return (
                        <AccordionItem key={season} value={season} className="border border-border rounded-lg bg-card">
                          <AccordionTrigger className="px-4 hover:no-underline">
                            <div className="flex justify-between items-center w-full">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">Season {season}</span>
                                <Badge variant={isCompleted ? "default" : "outline"}>
                                  {data.watchedCount}/{data.episodes.length} watched
                                </Badge>
                              </div>
                              {user && !isCompleted && (
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markSeasonWatched(parseInt(season));
                                  }}
                                  className="mr-2"
                                >
                                  Mark Season Watched
                                </Button>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-2">
                              {/* Unwatched Episodes First */}
                              {data.episodes
                                .filter(ep => !ep.watched)
                                .map(episode => (
                                  <div key={episode.id} className="p-3 border border-border rounded flex items-center justify-between bg-background">
                                    <div className="flex-1">
                                      <div className="flex items-start gap-3">
                                        <div className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-medium">
                                          S{episode.season.toString().padStart(2, '0')}E{episode.episode.toString().padStart(2, '0')}
                                        </div>
                                        <div>
                                          <div className="font-medium text-foreground">{episode.title}</div>
                                          {episode.airDate && (
                                            <div className="text-xs text-muted-foreground">
                                              {new Date(episode.airDate).toLocaleDateString()}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    {user && (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => toggleWatchStatus({ 
                                          episodeId: episode.id, 
                                          watched: !episode.watched 
                                        })}
                                      >
                                        <Clock className="h-4 w-4 mr-2" />
                                        Mark Watched
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              
                              {/* Watched Episodes Below */}
                              {data.episodes
                                .filter(ep => ep.watched)
                                .map(episode => (
                                  <div key={episode.id} className="p-3 border border-border rounded flex items-center justify-between bg-muted/50">
                                    <div className="flex-1">
                                      <div className="flex items-start gap-3">
                                        <div className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-medium">
                                          S{episode.season.toString().padStart(2, '0')}E{episode.episode.toString().padStart(2, '0')}
                                        </div>
                                        <div>
                                          <div className="font-medium text-foreground">{episode.title}</div>
                                          {episode.airDate && (
                                            <div className="text-xs text-muted-foreground">
                                              {new Date(episode.airDate).toLocaleDateString()}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    {user && (
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="text-green-600"
                                        onClick={() => toggleWatchStatus({ 
                                          episodeId: episode.id, 
                                          watched: !episode.watched 
                                        })}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Watched
                                      </Button>
                                    )}
                                  </div>
                                ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowDetail;
