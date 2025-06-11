
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tv, Play, CheckCircle, Clock, Globe, Eye } from 'lucide-react';
import { useUserShows } from '@/hooks/useUserShows';

// Mock data - replace with actual data from your store
const dashboardData = {
  trackedShows: 50,
  totalEpisodes: 5347,
  watchedEpisodes: 2821,
  universes: 7,
  showsByStatus: {
    all: 50,
    watching: 24,
    notStarted: 8,
    completed: 18
  }
};

export const TVShowDashboard: React.FC = () => {
  const { userShows } = useUserShows();
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'watching' | 'not_started' | 'completed' | null>(null);
  
  const progressPercentage = Math.round((dashboardData.watchedEpisodes / dashboardData.totalEpisodes) * 100);
  const remainingEpisodes = dashboardData.totalEpisodes - dashboardData.watchedEpisodes;

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
            <h1 className="text-2xl sm:text-3xl font-bold">
              {selectedStatus === 'all' ? 'All Shows' : 
               selectedStatus === 'not_started' ? 'Not Started Shows' :
               selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1) + ' Shows'}
            </h1>
            <p className="text-muted-foreground">
              {selectedStatus === 'all' ? 'All your tracked shows' :
               `Shows with ${selectedStatus.replace('_', ' ')} status`}
            </p>
          </div>
          <Button variant="outline" onClick={() => setSelectedStatus(null)}>
            Back to Dashboard
          </Button>
        </div>

        {filteredShows.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Tv className="h-16 w-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Shows Found</h3>
              <p className="text-muted-foreground">
                No shows found with {selectedStatus.replace('_', ' ')} status
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredShows.map((show) => {
              const progressPercentage = show.totalEpisodes > 0 ? (show.watchedEpisodes / show.totalEpisodes) * 100 : 0;
              
              return (
                <Card key={show.id} className="border-purple-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-20 h-24 sm:h-28 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Tv className="h-6 w-6 text-purple-500" />
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-semibold text-purple-700">{show.title}</h3>
                            {show.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">{show.description}</p>
                            )}
                          </div>
                          <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 whitespace-nowrap">
                            {show.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{show.watchedEpisodes} / {show.totalEpisodes} episodes</span>
                            <span>{Math.round(progressPercentage)}%</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
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
          <h1 className="text-2xl sm:text-3xl font-bold">TV Show Dashboard</h1>
          <p className="text-muted-foreground">Track your viewing progress and manage your shows</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto">
          <Tv className="mr-2 h-4 w-4" />
          Add New Show
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tracked Shows</CardTitle>
            <Tv className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.trackedShows}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Episodes</CardTitle>
            <Play className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalEpisodes.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Watched Episodes</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.watchedEpisodes.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Universes</CardTitle>
            <Globe className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.universes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>
            {dashboardData.watchedEpisodes} of {dashboardData.totalEpisodes} episodes watched
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progressPercentage} className="h-3" />
          <div className="flex flex-col sm:flex-row justify-between text-sm text-muted-foreground gap-2">
            <span>{progressPercentage}% complete</span>
            <span>{remainingEpisodes.toLocaleString()} episodes left</span>
          </div>
        </CardContent>
      </Card>

      {/* Show Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Show Progress</CardTitle>
            <CardDescription>Shows organized by status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col space-y-2 cursor-pointer hover:bg-gray-50"
                onClick={() => handleStatusClick('all')}
              >
                <span className="text-2xl font-bold">{dashboardData.showsByStatus.all}</span>
                <span className="text-sm">All Shows</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col space-y-2 cursor-pointer hover:bg-blue-50"
                onClick={() => handleStatusClick('watching')}
              >
                <span className="text-2xl font-bold text-blue-600">{dashboardData.showsByStatus.watching}</span>
                <span className="text-sm">Watching</span>
                <Eye className="h-4 w-4 text-blue-500" />
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col space-y-2 cursor-pointer hover:bg-gray-50"
                onClick={() => handleStatusClick('not_started')}
              >
                <span className="text-2xl font-bold text-gray-600">{dashboardData.showsByStatus.notStarted}</span>
                <span className="text-sm">Not Started</span>
                <Clock className="h-4 w-4 text-gray-500" />
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col space-y-2 cursor-pointer hover:bg-green-50"
                onClick={() => handleStatusClick('completed')}
              >
                <span className="text-2xl font-bold text-green-600">{dashboardData.showsByStatus.completed}</span>
                <span className="text-sm">Completed</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest viewing activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Watched "The Boys S04E08 - Assassination Run"</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Completed "Breaking Bad S05E16 - Felina"</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Started watching "Better Call Saul S01E01"</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Added "Stranger Things" to Crime Drama universe</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TVShowDashboard;
