import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Play, Eye, Globe, Lock, Calendar } from 'lucide-react';
import { useUniverses } from '@/hooks/useUniverses';
import { useUniverseShows } from '@/hooks/useUniverseShows';
import { useAuth } from '@/hooks/useAuth';
import { UniverseEpisodes } from '@/apps/tv-shows/components/UniverseEpisodes';

export const UniverseDetail: React.FC = () => {
  const { universeId } = useParams<{ universeId: string }>();
  const { user } = useAuth();
  const { universes } = useUniverses();
  const { universeShows, availableShows, addShowToUniverse, removeShowFromUniverse } = useUniverseShows(universeId || '');
  const [selectedShow, setSelectedShow] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [episodeKey, setEpisodeKey] = useState(0); // Key to force episode refresh

  const universe = universes.find(u => u.id === universeId);
  const isOwner = user?.id === universe?.creator_id;

  if (!universe) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="border-red-200">
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Universe Not Found</h3>
            <p className="text-muted-foreground">
              The universe you're looking for doesn't exist or you don't have access to it.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAddShow = () => {
    if (selectedShow) {
      addShowToUniverse.mutate(selectedShow, {
        onSuccess: () => {
          setEpisodeKey(prev => prev + 1); // Force episode refresh
        }
      });
      setSelectedShow('');
      setIsDialogOpen(false);
    }
  };

  const handleRemoveShow = (showUniverseId: string) => {
    if (confirm('Are you sure you want to remove this show from the universe?')) {
      removeShowFromUniverse.mutate(showUniverseId, {
        onSuccess: () => {
          setEpisodeKey(prev => prev + 1); // Force episode refresh
        }
      });
    }
  };

  const availableShowsToAdd = availableShows.filter(
    show => !universeShows.some(us => us.show_id === show.id)
  );

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Universe Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">
              {universe.name}
            </h1>
            <Badge variant="outline" className={universe.is_public ? "border-green-200 text-green-700" : "border-yellow-200 text-yellow-700"}>
              {universe.is_public ? (
                <>
                  <Globe className="w-3 h-3 mr-1" />
                  Public
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 mr-1" />
                  Private
                </>
              )}
            </Badge>
          </div>
          {universe.description && (
            <p className="text-muted-foreground text-sm sm:text-base">
              {universe.description}
            </p>
          )}
        </div>

        {isOwner && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Show
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Show to Universe</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={selectedShow} onValueChange={setSelectedShow}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a show" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableShowsToAdd.map((show) => (
                      <SelectItem key={show.id} value={show.id}>
                        {show.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button onClick={handleAddShow} disabled={!selectedShow} className="flex-1">
                    Add Show
                  </Button>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Universe Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{universeShows.length}</div>
            <p className="text-sm text-muted-foreground">Total Shows</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">
              {universeShows.filter(us => us.show?.is_public).length}
            </div>
            <p className="text-sm text-muted-foreground">Public Shows</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">
              {new Date(universe.created_at).getFullYear()}
            </div>
            <p className="text-sm text-muted-foreground">Created</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="shows" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="shows">Shows</TabsTrigger>
          <TabsTrigger value="episodes">Episodes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="shows" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-blue-700 mb-4">Shows in this Universe</h2>
            
            {universeShows.length === 0 ? (
              <Card className="border-blue-200">
                <CardContent className="text-center py-12">
                  <Play className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Shows Yet</h3>
                  <p className="text-muted-foreground">
                    {isOwner ? 'Add some shows to get started!' : 'No shows have been added to this universe yet.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {universeShows.map((universeShow) => (
                  <Card key={universeShow.id} className="border-blue-200 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-blue-700 text-lg line-clamp-2">
                          {universeShow.show?.title || 'Unknown Show'}
                        </CardTitle>
                        {isOwner && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveShow(universeShow.id)}
                            className="text-red-500 hover:text-red-700 flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      {universeShow.show?.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {universeShow.show.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={universeShow.show?.is_public ? "border-green-200 text-green-700" : "border-yellow-200 text-yellow-700"}>
                          {universeShow.show?.is_public ? (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              Public
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3 mr-1" />
                              Private
                            </>
                          )}
                        </Badge>
                        
                        <Button size="sm" variant="outline">
                          <Play className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="episodes" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-blue-700 mb-4">Episodes in this Universe</h2>
            <UniverseEpisodes key={episodeKey} universeId={universeId || ''} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UniverseDetail;
