
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search, Tv, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Show } from '@/types';

export const TVShowPublicShows: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchPublicShows = async () => {
    try {
      let query = supabase
        .from('shows')
        .select('*')
        .eq('is_public', true)
        .order('title', { ascending: true });

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data as Show[];
    } catch (error: any) {
      toast({
        title: 'Error fetching shows',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    }
  };

  const { data: shows = [], isLoading, refetch } = useQuery({
    queryKey: ['publicShows', searchTerm],
    queryFn: fetchPublicShows
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Public Shows</h1>
          <p className="text-muted-foreground">Discover popular shows from the community</p>
        </div>

        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="text"
            placeholder="Search shows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="secondary">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : shows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No public shows found</p>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shows.map((show) => (
            <Link to={`/tv-shows/show/${show.slug || show.id}`} key={show.id}>
              <Card className="h-full transition-all hover:shadow-md overflow-hidden">
                {show.poster ? (
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={show.poster} 
                      alt={show.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-muted flex items-center justify-center">
                    <Tv className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-1">{show.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {show.genres?.length ? show.genres.join(', ') : 'No genres'}
                    </div>
                    <Button size="sm" variant="secondary">View Show</Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TVShowPublicShows;
