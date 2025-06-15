
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Tv, ArrowLeft } from 'lucide-react';
import { useShowUniverseData } from '@/hooks/useShowUniverseData';

export const PublicUniverseDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = useShowUniverseData();

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

  const episodes = universeItems.sort((a, b) => {
    if (a.season_number !== b.season_number) {
      return a.season_number - b.season_number;
    }
    return a.episode_number - b.episode_number;
  });

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

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Shows in this Universe</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shows.map((show) => (
            <Card key={show?.show_id} className="hover:shadow-lg transition-shadow">
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
                  {episodes.filter(ep => ep.show_id === show?.show_id).length} episodes
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">All Episodes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {episodes.map((episode) => (
            <Card key={episode.episode_id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg text-blue-600">
                    {episode.episode_title}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    S{episode.season_number}E{episode.episode_number}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{episode.show_title}</p>
              </CardHeader>
              <CardContent>
                {episode.air_date && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(episode.air_date).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PublicUniverseDetail;
