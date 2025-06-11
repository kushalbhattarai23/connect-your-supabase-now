
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tv, Play, CheckCircle, Clock, Globe, Lock, Eye } from 'lucide-react';

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
  const progressPercentage = Math.round((dashboardData.watchedEpisodes / dashboardData.totalEpisodes) * 100);
  const remainingEpisodes = dashboardData.totalEpisodes - dashboardData.watchedEpisodes;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">TV Show Dashboard</h1>
          <p className="text-muted-foreground">Track your viewing progress and manage your shows</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Tv className="mr-2 h-4 w-4" />
          Add New Show
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <div className="flex justify-between text-sm text-muted-foreground">
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
              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <span className="text-2xl font-bold">{dashboardData.showsByStatus.all}</span>
                <span className="text-sm">All Shows</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <span className="text-2xl font-bold text-blue-600">{dashboardData.showsByStatus.watching}</span>
                <span className="text-sm">Watching</span>
                <Eye className="h-4 w-4 text-blue-500" />
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <span className="text-2xl font-bold text-gray-600">{dashboardData.showsByStatus.notStarted}</span>
                <span className="text-sm">Not Started</span>
                <Clock className="h-4 w-4 text-gray-500" />
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2">
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
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Completed "Breaking Bad S05E16"</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Started watching "Better Call Saul"</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Added to "Crime Drama" universe</p>
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
