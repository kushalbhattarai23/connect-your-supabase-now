
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Globe, Lock, Plus, Search, Tv as TvIcon, Trash2, ArrowLeft, Users, LogIn } from 'lucide-react';
import { useUniverseShows } from '@/hooks/useUniverseShows';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Universe } from '@/hooks/useUniverses';
import { useAuth } from '@/hooks/useAuth';

export const UniverseDetail: React.FC = () => {
  const { universeId } = useParams<{ universeId: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShowId, setSelectedShowId] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: universe, isLoading: universeLoading } = useQuery({
    queryKey: ['universe', universeId],
    queryFn: async () => {
      if (!universeId) throw new Error('Universe ID is required');
      
      const { data, error } = await supabase
        .from('universes')
        .select('*')
        .eq('id', universeId)
        .single();
        
      if (error) throw error;
      return data as Universe;
    },
    enabled: !!universeId
  });

  const {
    universeShows,
    availableShows,
    isLoading: showsLoading,
    addShowToUniverse,
    removeShowFromUniverse
  } = useUniverseShows(universeId || '');

  // Check if current user is the creator
  const isCreator = user?.id === universe?.creator_id;
  const canManage = isCreator; // Can be extended for other permissions

  const filteredShows = universeShows.filter(universeShow =>
    !searchTerm || 
    universeShow.show?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddShow = () => {
    if (!selectedShowId) {
      toast({
        title: 'Please select a show',
        variant: 'destructive',
      });
      return;
    }

    addShowToUniverse.mutate(selectedShowId, {
      onSuccess: () => {
        setSelectedShowId('');
        setIsDialogOpen(false);
      }
    });
  };

  const handleRemoveShow = (showUniverseId: string) => {
    removeShowFromUniverse.mutate(showUniverseId);
  };

  if (universeLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!universe) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Universe not found</h2>
        <Link to="/tv-shows/public-universes">
          <Button>Back to Public Universes</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <Link to="/tv-shows/public-universes">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              {universe.is_public ? (
                <Globe className="h-6 w-6 text-green-600" />
              ) : (
                <Lock className="h-6 w-6 text-gray-600" />
              )}
              <h1 className="text-3xl font-bold text-blue-700">{universe.name}</h1>
            </div>
          </div>
          
          {universe.description && (
            <p className="text-muted-foreground">{universe.description}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Badge variant="outline" className={universe.is_public ? "border-green-200 text-green-700" : "border-gray-200"}>
              {universe.is_public ? 'Public' : 'Private'}
            </Badge>
            <span>Created {new Date(universe.created_at).toLocaleDateString()}</span>
          </div>

          {!user && (
            <p className="text-sm text-muted-foreground">
              <Link to="/login" className="text-blue-700 hover:underline">
                Sign in
              </Link> to create and manage universes
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="text"
              placeholder="Search shows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="button" variant="secondary" className="border-blue-200">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {canManage && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Show
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Show to Universe</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Select value={selectedShowId} onValueChange={setSelectedShowId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a show" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableShows
                        .filter(show => !universeShows.some(us => us.show_id === show.id))
                        .map((show) => (
                          <SelectItem key={show.id} value={show.id}>
                            {show.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddShow}>Add Show</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Shows Grid */}
      {showsLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredShows.length === 0 ? (
        <Card className="border-blue-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No shows in this universe</p>
            <p className="text-muted-foreground">
              {canManage ? 'Add some shows to get started!' : 'This universe doesn\'t have any shows yet.'}
            </p>
            {!user && (
              <Link to="/login" className="mt-4">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign in to Manage
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShows.map((universeShow) => (
            <Card key={universeShow.id} className="h-full transition-all hover:shadow-md overflow-hidden border-blue-200">
              {universeShow.show?.poster_url ? (
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={universeShow.show.poster_url} 
                    alt={universeShow.show.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video w-full bg-muted flex items-center justify-center">
                  <TvIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1 text-blue-700">
                  {universeShow.show?.title || 'Unknown Show'}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="flex justify-between items-center gap-2">
                  <div className="text-sm text-muted-foreground flex-1">
                    {universeShow.show?.description ? (
                      <p className="line-clamp-2">{universeShow.show.description}</p>
                    ) : (
                      'No description available'
                    )}
                  </div>
                  <div className="flex gap-2">
                    {canManage && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRemoveShow(universeShow.id)}
                        className="border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                    <Button size="sm" variant="secondary" className="border-blue-200">
                      View
                    </Button>
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

export default UniverseDetail;
