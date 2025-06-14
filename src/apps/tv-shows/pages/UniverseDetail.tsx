
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Play, Eye, Globe, Lock, Calendar, ArrowLeft } from 'lucide-react';
import { useUniverses } from '@/hooks/useUniverses';
import { useUniverseShows } from '@/hooks/useUniverseShows';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { UniverseEpisodes } from '@/apps/tv-shows/components/UniverseEpisodes';
import { Link } from 'react-router-dom';

export const UniverseDetail: React.FC = () => {
  const { universeId } = useParams<{ universeId: string }>();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { universes } = useUniverses();
  const { universeShows, availableShows, addShowToUniverse, removeShowFromUniverse } = useUniverseShows(universeId || '');
  const [selectedShow, setSelectedShow] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [episodeKey, setEpisodeKey] = useState(0);

  const universe = universes.find(u => u.id === universeId);
  const isOwner = user?.id === universe?.creator_id;

  if (!universe) {
    return (
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 max-w-7xl">
        <Card className="border-red-200">
          <CardContent className="text-center py-8 sm:py-12">
            <h3 className="text-base sm:text-lg font-semibold mb-2">Universe Not Found</h3>
            <p className="text-sm sm:text-base text-muted-foreground px-4">
              The universe you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link to="/tv-shows/universes" className="mt-4 inline-block">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Universes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAddShow = () => {
    if (selectedShow) {
      addShowToUniverse.mutate(selectedShow, {
        onSuccess: () => {
          setEpisodeKey(prev => prev + 1);
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
          setEpisodeKey(prev => prev + 1);
        }
      });
    }
  };

  const availableShowsToAdd = availableShows.filter(
    show => !universeShows.some(us => us.show_id === show.id)
  );

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-7xl">
      {/* Back Navigation */}
      <div className="mb-4">
        <Link to="/tv-shows/universes" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Universes
        </Link>
      </div>

      {/* Universe Header */}
      <div className="space-y-4">
        <div className="flex flex-col space-y-3 lg:flex-row lg:items-start lg:justify-between lg:space-y-0 lg:space-x-4">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex flex-col space-y-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-700 break-words">
                {universe.name}
              </h1>
              <div className="flex flex-wrap gap-2 items-center">
                <Badge 
                  variant="outline" 
                  className={`${universe.is_public ? "border-green-200 text-green-700" : "border-yellow-200 text-yellow-700"} text-xs sm:text-sm`}
                >
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
                <Badge variant="outline" className="text-xs sm:text-sm border-blue-200 text-blue-700">
                  <Calendar className="w-3 h-3 mr-1" />
                  Created {new Date(universe.created_at).getFullYear()}
                </Badge>
              </div>
            </div>
            {universe.description && (
              <p className="text-muted-foreground text-sm sm:text-base break-words">
                {universe.description}
              </p>
            )}
          </div>

          {isOwner && (
            <div className="flex-shrink-0 w-full lg:w-auto">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 w-full lg:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Add Show</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md mx-3 sm:mx-4">
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
                    <div className="flex flex-col sm:flex-row gap-2">
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
            </div>
          )}
        </div>

        {/* Universe Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-blue-200">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-700">{universeShows.length}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Shows</p>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-700">
                {universeShows.filter(us => us.show?.is_public).length}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Public</p>
            </CardContent>
          </Card>
          <Card className="border-purple-200">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-700">
                {universeShows.filter(us => !us.show?.is_public).length}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Private</p>
            </CardContent>
          </Card>
          <Card className="border-orange-200">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-700">
                {new Date(universe.created_at).getFullYear()}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Created</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="shows" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-9 sm:h-10">
          <TabsTrigger value="shows" className="text-xs sm:text-sm">Shows</TabsTrigger>
          <TabsTrigger value="episodes" className="text-xs sm:text-sm">Episodes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="shows" className="space-y-4 mt-4 sm:mt-6">
          <div>
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-blue-700 mb-4">Shows in this Universe</h2>
            
            {universeShows.length === 0 ? (
              <Card className="border-blue-200">
                <CardContent className="text-center py-8 sm:py-12">
                  <Play className="h-12 sm:h-16 w-12 sm:w-16 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">No Shows Yet</h3>
                  <p className="text-muted-foreground text-sm sm:text-base px-4">
                    {isOwner ? 'Add some shows to get started!' : 'No shows have been added to this universe yet.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {universeShows.map((universeShow) => (
                  <Card key={universeShow.id} className="border-blue-200 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-blue-700 text-sm sm:text-base lg:text-lg line-clamp-2 leading-tight break-words">
                          {universeShow.show?.title || 'Unknown Show'}
                        </CardTitle>
                        {isOwner && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveShow(universeShow.id)}
                            className="text-red-500 hover:text-red-700 flex-shrink-0 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3 pt-0">
                      {universeShow.show?.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 break-words">
                          {universeShow.show.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <Badge 
                          variant="outline" 
                          className={`${universeShow.show?.is_public ? "border-green-200 text-green-700" : "border-yellow-200 text-yellow-700"} text-xs`}
                        >
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
                        
                        <Button size="sm" variant="outline" className="text-xs">
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
        
        <TabsContent value="episodes" className="space-y-4 mt-4 sm:mt-6">
          <div>
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-blue-700 mb-4">Episodes in this Universe</h2>
            <UniverseEpisodes key={episodeKey} universeId={universeId || ''} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UniverseDetail; universe detail page fix. ge. 
