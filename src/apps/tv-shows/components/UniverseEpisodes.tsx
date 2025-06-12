
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Eye, Calendar, Filter } from 'lucide-react';
import { useUniverseEpisodes, UniverseEpisode } from '@/hooks/useUniverseEpisodes';
import { useNavigate } from 'react-router-dom';

interface UniverseEpisodesProps {
  universeId: string;
}

export const UniverseEpisodes: React.FC<UniverseEpisodesProps> = ({ universeId }) => {
  const { episodes, isLoading } = useUniverseEpisodes(universeId);
  const [filter, setFilter] = useState<'all' | 'watched' | 'not-watched'>('all');
  const [showFilter, setShowFilter] = useState<string>('all');
  const [batchSize] = useState(20);
  const [displayedCount, setDisplayedCount] = useState(batchSize);
  const navigate = useNavigate();

  const uniqueShows = useMemo(() => {
    const shows = episodes
      .map(ep => ep.show)
      .filter((show, index, self) => 
        show && self.findIndex(s => s?.id === show.id) === index
      );
    return shows.filter(Boolean);
  }, [episodes]);

  const filteredEpisodes = useMemo(() => {
    let filtered = episodes;

    // Filter by watch status
    if (filter === 'watched') {
      filtered = filtered.filter(ep => ep.watched);
    } else if (filter === 'not-watched') {
      filtered = filtered.filter(ep => !ep.watched);
    }

    // Filter by show
    if (showFilter !== 'all') {
      filtered = filtered.filter(ep => ep.show_id === showFilter);
    }

    // Sort: not watched episodes by air date first, then watched episodes
    return filtered.sort((a, b) => {
      if (a.watched !== b.watched) {
        return a.watched ? 1 : -1; // Not watched first
      }
      
      if (a.air_date && b.air_date) {
        return new Date(a.air_date).getTime() - new Date(b.air_date).getTime();
      }
      
      if (a.air_date && !b.air_date) return -1;
      if (!a.air_date && b.air_date) return 1;
      
      return 0;
    });
  }, [episodes, filter, showFilter]);

  const displayedEpisodes = filteredEpisodes.slice(0, displayedCount);
  const hasMore = displayedCount < filteredEpisodes.length;

  const loadMore = () => {
    setDisplayedCount(prev => Math.min(prev + batchSize, filteredEpisodes.length));
  };

  const handleEpisodeClick = (episode: UniverseEpisode) => {
    if (episode.show?.slug) {
      navigate(`/tv-shows/show/${episode.show.slug}`);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-blue-200">
        <CardContent className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading episodes...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Episodes</SelectItem>
              <SelectItem value="not-watched">Not Watched</SelectItem>
              <SelectItem value="watched">Watched</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={showFilter} onValueChange={setShowFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by show" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Shows</SelectItem>
            {uniqueShows.map((show) => (
              <SelectItem key={show?.id} value={show?.id || ''}>
                {show?.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {displayedEpisodes.length === 0 ? (
        <Card className="border-blue-200">
          <CardContent className="text-center py-12">
            <Play className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Episodes Found</h3>
            <p className="text-muted-foreground">
              No episodes match your current filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedEpisodes.map((episode) => (
              <Card 
                key={episode.id} 
                className={`border-blue-200 hover:shadow-lg transition-all cursor-pointer ${
                  episode.watched ? 'bg-green-50' : 'bg-white'
                }`}
                onClick={() => handleEpisodeClick(episode)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-blue-700 text-sm line-clamp-2">
                      {episode.show?.title}
                    </CardTitle>
                    <Badge variant={episode.watched ? "default" : "outline"} className="flex-shrink-0">
                      {episode.watched ? (
                        <>
                          <Eye className="w-3 h-3 mr-1" />
                          Watched
                        </>
                      ) : (
                        'Not Watched'
                      )}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-gray-600">
                    S{episode.season_number}E{episode.episode_number}: {episode.title}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-2">
                  {episode.air_date && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(episode.air_date).toLocaleDateString()}
                    </div>
                  )}
                  
                  {episode.watched && episode.watched_at && (
                    <div className="text-xs text-green-600">
                      Watched: {new Date(episode.watched_at).toLocaleDateString()}
                    </div>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEpisodeClick(episode);
                    }}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    View Show
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {hasMore && (
            <div className="text-center">
              <Button onClick={loadMore} variant="outline">
                Load More Episodes ({filteredEpisodes.length - displayedCount} remaining)
              </Button>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            Showing {displayedEpisodes.length} of {filteredEpisodes.length} episodes
          </div>
        </>
      )}
    </div>
  );
};
