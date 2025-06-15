
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Globe, Search, Tv } from 'lucide-react';
import { useShowUniverseData } from '@/hooks/useShowUniverseData';

export const PublicUniverses: React.FC = () => {
  const { data, isLoading } = useShowUniverseData();
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading universes...</p>
        </div>
      </div>
    );
  }

  // Get unique universes
  const universes = [...new Set(data.map(item => item.universe_id))].map(universeId => {
    const universeItem = data.find(item => item.universe_id === universeId);
    const universeEpisodes = data.filter(item => item.universe_id === universeId);
    const uniqueShows = [...new Set(universeEpisodes.map(item => item.show_id))];
    
    return {
      ...universeItem,
      episodeCount: universeEpisodes.length,
      showCount: uniqueShows.length
    };
  }).filter(Boolean);

  // Filter universes based on search term
  const filteredUniverses = universes.filter(universe =>
    universe?.universe_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    universe?.universe_description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="text-center mb-8">
        <Globe className="h-16 w-16 text-blue-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">All Universes</h1>
        <p className="text-muted-foreground">
          Explore different universes and discover the shows and episodes within each one
        </p>
      </div>

      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search universes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredUniverses.length === 0 ? (
        <div className="text-center py-12">
          <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Universes Found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try adjusting your search terms.' : 'No universes are available at the moment.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUniverses.map((universe) => (
            <Card key={universe?.universe_id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">
                  <Link 
                    to={`/public/universe/${universe?.universe_name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')}`}
                    className="text-blue-600 hover:underline"
                  >
                    {universe?.universe_name}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {universe?.universe_description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {universe.universe_description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Tv className="w-4 h-4 mr-1" />
                    <span>{universe?.showCount} shows</span>
                  </div>
                  <div className="flex items-center">
                    <span># {universe?.episodeCount} episodes</span>
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

export default PublicUniverses;
