
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Play, Eye, Filter, Clock, CheckCircle } from 'lucide-react';
import { useUniverseEpisodes, UniverseEpisode } from '@/hooks/useUniverseEpisodes';
import { useNavigate } from 'react-router-dom';

interface UniverseEpisodesProps {
  universeId: string;
}

export const UniverseEpisodes: React.FC<UniverseEpisodesProps> = ({ universeId }) => {
  const [filter, setFilter] = useState<'all' | 'watched' | 'not-watched'>('all');
  const [showFilter, setShowFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;
  const navigate = useNavigate();

  const { episodes, totalCount, hasMore, isLoading, refetch } = useUniverseEpisodes(universeId, currentPage, pageSize);

  // Refresh episodes when universe changes
  React.useEffect(() => {
    refetch();
    setCurrentPage(1);
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

    return filtered;
  }, [episodes, filter, showFilter]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleShowClick = (episode: UniverseEpisode) => {
    if (episode.show?.slug) {
      navigate(`/tv-shows/show/${episode.show.slug}`);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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

      {filteredEpisodes.length === 0 ? (
        <Card className="border-blue-200">
          <CardContent className="text-center py-12">
            <Play className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Episodes Found</h3>
            <p className="text-muted-foreground">
              {episodes.length === 0 
                ? "No episodes are available in this universe yet."
                : "No episodes match your current filters."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Show</TableHead>
                  <TableHead>Season</TableHead>
                  <TableHead>Episode</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Air Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEpisodes.map((episode) => (
                  <TableRow key={episode.id} className={episode.watched ? 'bg-green-50' : ''}>
                    <TableCell 
                      className="font-medium cursor-pointer text-blue-600 hover:underline"
                      onClick={() => handleShowClick(episode)}
                    >
                      {episode.show?.title}
                    </TableCell>
                    <TableCell>S{episode.season_number}</TableCell>
                    <TableCell>E{episode.episode_number}</TableCell>
                    <TableCell>{episode.title}</TableCell>
                    <TableCell>
                      {episode.air_date ? new Date(episode.air_date).toLocaleDateString() : 'TBA'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={episode.watched ? "default" : "outline"}>
                        {episode.watched ? (
                          <>
                            <Eye className="w-3 h-3 mr-1" />
                            Watched
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            Unwatched
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={episode.watched ? "outline" : "default"}
                        onClick={() => handleShowClick(episode)}
                      >
                        {episode.watched ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Watched
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            Mark Watched
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNumber > totalPages) return null;
                  
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNumber)}
                        isActive={currentPage === pageNumber}
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}

          <div className="text-center text-sm text-muted-foreground">
            Showing {filteredEpisodes.length} episodes on page {currentPage} of {totalPages}
            {episodes.length !== filteredEpisodes.length && (
              <span> (filtered from {episodes.length} total on this page)</span>
            )}
          </div>
        </>
      )}
    </div>
  );
};
