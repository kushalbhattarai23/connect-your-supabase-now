
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tv, Search, Calendar, Globe } from 'lucide-react';
import { useShowUniverseData } from '@/hooks/useShowUniverseData';

export const PublicShows: React.FC = () => {
  const { data, isLoading } = useShowUniverseData();
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading shows...</p>
        </div>
      </div>
    );
  }

  // Get unique shows
  const shows = [...new Set(data.map(item => item.show_id))].map(showId => {
    const showItem = data.find(item => item.show_id === showId);
    const showEpisodes = data.filter(item => item.show_id === showId);
    const uniqueUniverses = [...new Set(showEpisodes.map(item => item.universe_id))];
    const seasons = [...new Set(showEpisodes.map(item => item.season_number))];
    
    return {
      ...showItem,
      episodeCount: showEpisodes.length,
      universeCount: uniqueUniverses.length,
      seasonCount: seasons.length
    };
  }).filter(Boolean);

  // Filter shows based on search term
  const filteredShows = shows.filter(show =>
    show?.show_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    show?.show_description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="text-center mb-8">
        <Tv className="h-16 w-16 text-blue-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">All Shows</h1>
        <p className="text-muted-foreground">
          Explore all TV shows across different universes and track your viewing progress
        </p>
      </div>

      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search shows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredShows.length === 0 ? (
        <div className="text-center py-12">
          <Tv className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Shows Found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try adjusting your search terms.' : 'No shows are available at the moment.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShows.map((show) => (
            <Card key={show?.show_id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">
                    <Link 
                      to={`/public/show/${show?.slug || show?.show_title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')}`}
                      className="text-blue-600 hover:underline"
                    >
                      {show?.show_title}
                    </Link>
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {show?.universeCount} universe{show?.universeCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {show?.show_description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {show.show_description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{show?.seasonCount} seasons</span>
                  </div>
                  <div className="flex items-center">
                    <span># {show?.episodeCount} episodes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicShows;
