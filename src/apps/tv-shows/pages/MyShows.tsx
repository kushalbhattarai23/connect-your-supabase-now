
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye, Clock, CheckCircle, Plus, Star } from 'lucide-react';
import { useUserShows } from '@/hooks/useUserShows';
import { useNavigate } from 'react-router-dom';

export const TVShowMyShows: React.FC = () => {
  const { userShows, isLoading } = useUserShows();
  const [filter, setFilter] = useState<'all' | 'watching' | 'not_started' | 'completed'>('all');
  const navigate = useNavigate();

  const filteredShows = userShows.filter(show => {
    if (filter === 'all') return true;
    return show.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'watching': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'not_started': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'watching': return <Eye className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'not_started': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleShowClick = (showId: string) => {
    navigate(`/tv-shows/show/${showId}`);
  };

  const handleViewShows = () => {
    navigate('/tv-shows/public-shows');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-8">Loading your shows...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-purple-700">My Shows</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Track your personal TV show collection</p>
        </div>
        
        <Button 
          className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
          onClick={handleViewShows}
        >
          <Plus className="mr-2 h-4 w-4" />
          Browse Shows
        </Button>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All Shows', count: userShows.length },
          { key: 'watching', label: 'Watching', count: userShows.filter(s => s.status === 'watching').length },
          { key: 'not_started', label: 'Not Started', count: userShows.filter(s => s.status === 'not_started').length },
          { key: 'completed', label: 'Completed', count: userShows.filter(s => s.status === 'completed').length }
        ].map(({ key, label, count }) => (
          <Button
            key={key}
            variant={filter === key ? 'default' : 'outline'}
            onClick={() => setFilter(key as any)}
            className="flex-1 sm:flex-none"
          >
            {label} ({count})
          </Button>
        ))}
      </div>

      {filteredShows.length === 0 ? (
        <Card className="border-purple-200">
          <CardContent className="text-center py-12">
            <Eye className="h-16 w-16 text-purple-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Shows Found</h3>
            <p className="text-muted-foreground mb-4">
              {filter === 'all' ? 'Start tracking shows to see them here' : `No ${filter.replace('_', ' ')} shows found`}
            </p>
            <Button onClick={handleViewShows} className="bg-purple-600 hover:bg-purple-700">
              Browse Shows
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredShows.map((show) => {
            const progressPercentage = show.totalEpisodes > 0 ? (show.watchedEpisodes / show.totalEpisodes) * 100 : 0;
            
            return (
              <Card 
                key={show.id} 
                className="border-purple-200 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleShowClick(show.id)}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Show Image */}
                    <div className="w-full sm:w-24 h-32 sm:h-36 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {show.poster_url ? (
                        <img 
                          src={show.poster_url} 
                          alt={show.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Star className="h-8 w-8 text-purple-500" />
                      )}
                    </div>
                    
                    {/* Show Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-semibold text-purple-700 hover:underline">
                            {show.title}
                          </h3>
                          {show.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{show.description}</p>
                          )}
                        </div>
                        <Badge variant="outline" className={`${getStatusColor(show.status)} text-white border-0 flex items-center gap-1 whitespace-nowrap`}>
                          {getStatusIcon(show.status)}
                          {show.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{show.watchedEpisodes} / {show.totalEpisodes} episodes</span>
                          <span>{Math.round(progressPercentage)}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 sm:flex-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShowClick(show.id);
                          }}
                        >
                          View Details
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 sm:flex-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShowClick(show.id);
                          }}
                        >
                          Mark Episode
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 sm:flex-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Could add a status update modal here
                          }}
                        >
                          Update Status
                        </Button>
                      </div>
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

export default TVShowMyShows;
