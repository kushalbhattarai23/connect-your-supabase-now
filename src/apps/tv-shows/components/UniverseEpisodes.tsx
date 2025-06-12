
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Calendar, Tv, LayoutGrid, List } from 'lucide-react';
import { useUniverseEpisodes } from '@/hooks/useUniverseEpisodes';
import { useIsMobile } from '@/hooks/use-mobile';
import { EpisodeTableRow } from './EpisodeTableRow';
import { EpisodeCard } from './EpisodeCard';

interface UniverseEpisodesProps {
  universeId: string;
}

export const UniverseEpisodes: React.FC<UniverseEpisodesProps> = ({ universeId }) => {
  const { episodes, isLoading } = useUniverseEpisodes(universeId);
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'watched' | 'unwatched'>('all');
  const [showFilter, setShowFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const filteredEpisodes = episodes.filter(episode => {
    const matchesSearch = episode.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         episode.show?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'watched' && episode.watched) ||
                         (statusFilter === 'unwatched' && !episode.watched);
    
    const matchesShow = showFilter === 'all' || episode.show_id === showFilter;
    
    return matchesSearch && matchesStatus && matchesShow;
  });

  const uniqueShows = episodes.reduce((acc, episode) => {
    if (episode.show && !acc.find(s => s.id === episode.show!.id)) {
      acc.push(episode.show);
    }
    return acc;
  }, [] as Array<{ id: string; title: string }>);

  const watchedCount = episodes.filter(e => e.watched).length;
  const totalCount = episodes.length;
  const progressPercentage = totalCount > 0 ? (watchedCount / totalCount) * 100 : 0;

  if (isLoading) {
    return (
      <Card className="border-blue-200">
        <CardContent className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading episodes...</p>
        </CardContent>
      </Card>
    );
  }

  if (episodes.length === 0) {
    return (
      <Card className="border-blue-200">
        <CardContent className="text-center py-12">
          <Tv className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Episodes Found</h3>
          <p className="text-muted-foreground">
            Add some shows to this universe to see their episodes here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-blue-200">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-700">{totalCount}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Total Episodes</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-700">{watchedCount}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Watched</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-orange-700">{totalCount - watchedCount}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Remaining</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="border-blue-200">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Watch Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Controls */}
      <Card className="border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Episodes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and View Toggle */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search episodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* View Mode Toggle - only show on desktop */}
            {!isMobile && (
              <div className="flex border rounded-lg p-1">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className="px-3"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Episodes</SelectItem>
                <SelectItem value="watched">Watched</SelectItem>
                <SelectItem value="unwatched">Unwatched</SelectItem>
              </SelectContent>
            </Select>

            <Select value={showFilter} onValueChange={setShowFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by show" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Shows</SelectItem>
                {uniqueShows.map((show) => (
                  <SelectItem key={show.id} value={show.id}>
                    {show.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredEpisodes.length} of {totalCount} episodes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Episodes Display */}
      {filteredEpisodes.length === 0 ? (
        <Card className="border-orange-200">
          <CardContent className="text-center py-8">
            <Filter className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Episodes Match Your Filters</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters to find more episodes.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile: Always show cards */}
          {isMobile ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredEpisodes.map((episode) => (
                <EpisodeCard key={episode.id} episode={episode} />
              ))}
            </div>
          ) : (
            /* Desktop: Show based on view mode */
            viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEpisodes.map((episode) => (
                  <EpisodeCard key={episode.id} episode={episode} />
                ))}
              </div>
            ) : (
              <Card className="border-blue-200">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-blue-50/50">
                          <TableHead className="font-semibold text-blue-700">Show</TableHead>
                          <TableHead className="text-center font-semibold text-blue-700">Season</TableHead>
                          <TableHead className="text-center font-semibold text-blue-700">Episode</TableHead>
                          <TableHead className="font-semibold text-blue-700">Title</TableHead>
                          <TableHead className="text-center font-semibold text-blue-700">Air Date</TableHead>
                          <TableHead className="text-center font-semibold text-blue-700">Status</TableHead>
                          <TableHead className="text-center font-semibold text-blue-700">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEpisodes.map((episode) => (
                          <EpisodeTableRow key={episode.id} episode={episode} />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </>
      )}
    </div>
  );
};
