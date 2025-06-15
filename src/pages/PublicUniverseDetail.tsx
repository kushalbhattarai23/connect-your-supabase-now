import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Tv, ArrowLeft, Search, Filter, ArrowUpDown, Globe } from 'lucide-react';
import { useShowUniverseData } from '@/hooks/useShowUniverseData';

export const PublicUniverseDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = useShowUniverseData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  // Find the universe by slug
  const universeData = data.find(item => 
    item.universe_name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-') === slug
  );

  if (!universeData) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Universe Not Found</h1>
        <Link to="/public/universes" className="text-blue-600 hover:underline">
          Back to Universes
        </Link>
      </div>
    );
  }

  // Group data by universe
  const universeItems = data.filter(item => item.universe_id === universeData.universe_id);
  const shows = [...new Set(universeItems.map(item => item.show_id))].map(showId => {
    const showItem = universeItems.find(item => item.show_id === showId);
    return showItem;
  }).filter(Boolean);

  const allEpisodes = universeItems.sort((a, b) => {
    // Default sort by air date
    if (a.air_date && b.air_date) {
      return new Date(a.air_date).getTime() - new Date(b.air_date).getTime();
    }
    // Fallback to season/episode if air dates are missing
    if (a.season_number !== b.season_number) {
      return a.season_number - b.season_number;
    }
    return a.episode_number - b.episode_number;
  });

  // Get unique seasons for filter
  const seasons = [...new Set(allEpisodes.map(ep => ep.season_number))].sort((a, b) => a - b);

  // Filter and sort episodes
  const filteredAndSortedEpisodes = useMemo(() => {
    let filtered = allEpisodes.filter(episode => {
      const matchesSearch = episode.episode_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           episode.show_title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeason = selectedSeason === 'all' || episode.season_number.toString() === selectedSeason;
      return matchesSearch && matchesSeason;
    });

    // Sort by air date
    filtered.sort((a, b) => {
      if (a.air_date && b.air_date) {
        const dateA = new Date(a.air_date).getTime();
        const dateB = new Date(b.air_date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // Fallback to season/episode if air dates are missing
      const seasonA = a.season_number;
      const seasonB = b.season_number;
      const episodeA = a.episode_number;
      const episodeB = b.episode_number;

      if (seasonA !== seasonB) {
        return sortOrder === 'asc' ? seasonA - seasonB : seasonB - seasonA;
      }
      return sortOrder === 'asc' ? episodeA - episodeB : episodeB - episodeA;
    });

    return filtered;
  }, [allEpisodes, searchTerm, sortOrder, selectedSeason]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/public/universes" className="flex items-center text-blue-600 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Universes
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{universeData.universe_name}</h1>
        {universeData.universe_description && (
          <p className="text-muted-foreground">{universeData.universe_description}</p>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="border-blue-200 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{shows.length}</div>
            <div className="text-sm text-muted-foreground">Shows</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{allEpisodes.length}</div>
            <div className="text-sm text-muted-foreground">Episodes</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{filteredAndSortedEpisodes.length}</div>
            <div className="text-sm text-muted-foreground">Filtered</div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Shows in this Universe</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shows.map((show) => (
            <Card key={show?.show_id} className="border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-300">
              <CardHeader>
                <CardTitle className="text-lg">
                  <Link 
                    to={`/public/show/${show?.slug || show?.show_title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')}`}
                    className="text-blue-600 hover:underline"
                  >
                    {show?.show_title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {show?.show_description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {show.show_description}
                  </p>
                )}
                <div className="flex items-center text-sm text-muted-foreground">
                  <Tv className="h-4 w-4 mr-1" />
                  {allEpisodes.filter(ep => ep.show_id === show?.show_id).length} episodes
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Filter & Sort Episodes */}
      <Card className="border-blue-200 shadow-lg mb-6">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            Filter & Sort Episodes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Episodes */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-4 w-4" />
              <Input
                placeholder="Search episodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Air Date Sort */}
            <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
              <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                <ArrowUpDown className="h-4 w-4 mr-2 text-blue-500" />
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Oldest First</SelectItem>
                <SelectItem value="desc">Newest First</SelectItem>
              </SelectContent>
            </Select>

            {/* Season Filter */}
            <Select value={selectedSeason} onValueChange={setSelectedSeason}>
              <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="All Seasons" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Seasons</SelectItem>
                {seasons.map((season) => (
                  <SelectItem key={season} value={season.toString()}>
                    Season {season}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-semibold mb-4">All Episodes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedEpisodes.map((episode) => (
            <Card key={episode.episode_id} className="border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg text-blue-600">
                    {episode.episode_title}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                    S{episode.season_number}E{episode.episode_number}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{episode.show_title}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {episode.air_date && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(episode.air_date).toLocaleDateString()}
                  </div>
                )}
                <div className="flex items-center text-sm text-blue-600">
                  <Globe className="h-4 w-4 mr-1" />
                  {episode.universe_name}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PublicUniverseDetail;
