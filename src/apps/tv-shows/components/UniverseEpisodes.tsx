import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Play, Filter, RefreshCw } from 'lucide-react';
import { useUniverseEpisodes } from '@/hooks/useUniverseEpisodes';
import { EpisodeTableRow } from './EpisodeTableRow';

interface UniverseEpisodesProps {
  universeId: string;
}

const BATCH_SIZE = 50;

export const UniverseEpisodes: React.FC<UniverseEpisodesProps> = ({ universeId }) => {
  const [filter, setFilter] = useState<'all' | 'watched' | 'not-watched'>('all');
  const [showFilter, setShowFilter] = useState<string>('all');
  const [displayCount, setDisplayCount] = useState(BATCH_SIZE);

  const { episodes, isLoading, refetch } = useUniverseEpisodes(universeId);

  React.useEffect(() => {
    console.log('Universe changed, refreshing episodes');
    setDisplayCount(BATCH_SIZE);
    refetch();
  }, [universeId, refetch]);

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

    if (filter === 'watched') {
      filtered = filtered.filter(ep => ep.watched);
    } else if (filter === 'not-watched') {
      filtered = filtered.filter(ep => !ep.watched);
    }

    if (showFilter !== 'all') {
      filtered = filtered.filter(ep => ep.show_id === showFilter);
    }

    return filtered;
  }, [episodes, filter, showFilter]);

  const displayedEpisodes = useMemo(() => {
    return filteredEpisodes.slice(0, displayCount);
  }, [filteredEpisodes, displayCount]);

  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    setDisplayCount(BATCH_SIZE);
    refetch();
  };

  const handleLoadMore = () => {
    setDisplayCount(prev => Math.min(prev + BATCH_SIZE, filteredEpisodes.length));
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
      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Episodes</SelectItem>
                <SelectItem value="not-watched">Unwatched</SelectItem>
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

        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Episode Statistics */}
      {filteredEpisodes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">{filteredEpisodes.length}</div>
              <p className="text-sm text-muted-foreground">Total Episodes</p>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-700">
                {filteredEpisodes.filter(ep => ep.watched).length}
              </div>
              <p className="text-sm text-muted-foreground">Watched</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-700">
                {filteredEpisodes.filter(ep => !ep.watched).length}
              </div>
              <p className="text-sm text-muted-foreground">Unwatched</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Episodes Table */}
      {episodes.length === 0 ? (
        <Card className="border-blue-200">
          <CardContent className="text-center py-12">
            <Play className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Episodes Found</h3>
            <p className="text-muted-foreground mb-4">
              No episodes are available in this universe yet.
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : filteredEpisodes.length === 0 ? (
        <Card className="border-blue-200">
          <CardContent className="text-center py-12">
            <Play className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Episodes Match Filters</h3>
            <p className="text-muted-foreground">
              No episodes match your current filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left font-semibold text-blue-600">Show</TableHead>
                  <TableHead className="text-center font-semibold text-blue-600">Season</TableHead>
                  <TableHead className="text-center font-semibold text-blue-600">Episode</TableHead>
                  <TableHead className="text-left font-semibold text-blue-600">Title</TableHead>
                  <TableHead className="text-center font-semibold text-blue-600">Air Date</TableHead>
                  <TableHead className="text-center font-semibold text-blue-600">Watched</TableHead>
                  <TableHead className="text-center font-semibold text-blue-600">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedEpisodes.map((episode) => (
                  <EpisodeTableRow key={episode.id} episode={episode} />
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Load More Button */}
          {displayedEpisodes.length < filteredEpisodes.length && (
            <div className="text-center">
              <Button onClick={handleLoadMore} variant="outline">
                Load More Episodes ({filteredEpisodes.length - displayedEpisodes.length} remaining)
              </Button>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            Showing {displayedEpisodes.length} of {filteredEpisodes.length} episodes
            {filteredEpisodes.length !== episodes.length && (
              <span> (filtered from {episodes.length} total)</span>
            )}
          </div>
        </>
      )}
    </div>
  );
};
