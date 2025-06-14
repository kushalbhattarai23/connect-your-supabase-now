
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tv, Play, CheckCircle, Clock, Globe, Eye } from 'lucide-react';
import { useUserShows } from '@/hooks/useUserShows';

// Mock data for overall stats - replace with actual data from your store
const dashboardData = {
  universes: 7,
};

export const TVShowDashboard: React.FC = () => {
  const { userShows } = useUserShows();
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'watching' | 'not_started' | 'completed' | null>(null);
  
  // Calculate real stats from user shows
  const trackedShows = userShows.length;
  const totalEpisodes = userShows.reduce((sum, show) => sum + show.totalEpisodes, 0);
  const watchedEpisodes = userShows.reduce((sum, show) => sum + show.watchedEpisodes, 0);
  
  const showsByStatus = {
    all: trackedShows,
    watching: userShows.filter(show => show.status === 'watching').length,
    not_started: userShows.filter(show => show.status === 'not_started').length,
    completed: userShows.filter(show => show.status === 'completed').length
  };

  const progressPercentage = totalEpisodes > 0 ? Math.round((watchedEpisodes / totalEpisodes) * 100) : 0;
  const remainingEpisodes = totalEpisodes - watchedEpisodes;

  const handleStatusClick = (status: 'all' | 'watching' | 'not_started' | 'completed') => {
    setSelectedStatus(status);
  };

  const filteredShows = selectedStatus && selectedStatus !== 'all' 
    ? userShows.filter(show => show.status === selectedStatus)
    : userShows;

  if (selectedStatus) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-purple-800">
              {selectedStatus === 'all' ? 'All Shows' : 
               selectedStatus === 'not_started' ? 'Not Started Shows' :
               selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1) + ' Shows'}
            </h1>
            <p className="text-purple-600">
              {selectedStatus === 'all' ? 'All your tracked shows' :
               `Shows with ${selectedStatus.replace('_', ' ')} status`}
            </p>
          </div>
          <Button variant="outline" onClick={() => setSelectedStatus(null)} className="border-purple-300 text-purple-700 hover:bg-purple-50">
            Back to Dashboard
          </Button>
        </div>

        {filteredShows.length === 0 ? (
          <Card className="border-purple-200">
            <CardContent className="text-center py-12">
              <Tv className="h-16 w-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-purple-800">No Shows Found</h3>
              <p className="text-purple-600">
                No shows found with {selectedStatus.replace('_', ' ')} status
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredShows.map((show) => {
              const progressPercentage = show.totalEpisodes > 0 ? (show.watchedEpisodes / show.totalEpisodes) * 100 : 0;
              
              return (
                <Card key={show.id} className="border-purple-200 hover:shadow-lg transition-shadow hover:border-purple-300">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-20 h-24 sm:h-28 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {show.poster_url ? (
                          <img src={show.poster_url} alt={show.title} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Tv className="h-6 w-6 text-purple-500" />
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-semibold text-purple-700">{show.title}</h3>
                            {show.description && (
                              <p className="text-sm text-purple-600 line-clamp-2">{show.description}</p>
                            )}
                          </div>
                          <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 whitespace-nowrap">
                            {show.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-purple-700">
                            <span>{show.watchedEpisodes} / {show.totalEpisodes} episodes</span>
                            <span>{Math.round(progressPercentage)}%</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2 bg-purple-100" />
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
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-purple-800">TV Show Dashboard</h1>
          <p className="text-purple-600">Track your viewing progress and manage your shows</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto">
          <Tv className="mr-2 h-4 w-4" />
          Add New Show
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-purple-200 hover:border-purple-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Tracked Shows</CardTitle>
            <Tv className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{trackedShows}</div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 hover:border-purple-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Total Episodes</CardTitle>
            <Play className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{totalEpisodes.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 hover:border-purple-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Watched Episodes</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{watchedEpisodes.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 hover:border-purple-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Universes</CardTitle>
            <Globe className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{dashboardData.universes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-800">Overall Progress</CardTitle>
          <CardDescription className="text-purple-600">
            {watchedEpisodes} of {totalEpisodes} episodes watched
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progressPercentage} className="h-3 bg-purple-100" />
          <div className="flex flex-col sm:flex-row justify-between text-sm text-purple-700 gap-2">
            <span>{progressPercentage}% complete</span>
            <span>{remainingEpisodes.toLocaleString()} episodes left</span>
          </div>
        </CardContent>
      </Card>

      {/* Show Progress */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-800">Show Progress</CardTitle>
          <CardDescription className="text-purple-600">Shows organized by status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col space-y-2 cursor-pointer hover:bg-purple-50 border-purple-200 text-purple-700"
              onClick={() => handleStatusClick('all')}
            >
              <span className="text-2xl font-bold">{showsByStatus.all}</span>
              <span className="text-sm">All Shows</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col space-y-2 cursor-pointer hover:bg-blue-50 border-purple-200"
              onClick={() => handleStatusClick('watching')}
            >
              <span className="text-2xl font-bold text-blue-600">{showsByStatus.watching}</span>
              <span className="text-sm text-purple-700">Watching</span>
              <Eye className="h-4 w-4 text-blue-500" />
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col space-y-2 cursor-pointer hover:bg-gray-50 border-purple-200"
              onClick={() => handleStatusClick('not_started')}
            >
              <span className="text-2xl font-bold text-gray-600">{showsByStatus.not_started}</span>
              <span className="text-sm text-purple-700">Not Started</span>
              <Clock className="h-4 w-4 text-gray-500" />
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col space-y-2 cursor-pointer hover:bg-green-50 border-purple-200"
              onClick={() => handleStatusClick('completed')}
            >
              <span className="text-2xl font-bold text-green-600">{showsByStatus.completed}</span>
              <span className="text-sm text-purple-700">Completed</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TVShowDashboard;
