
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Calendar, User } from 'lucide-react';
import { usePublicUniverses } from '@/hooks/usePublicUniverses';
import { useNavigate } from 'react-router-dom';

export const PublicUniverses: React.FC = () => {
  const { publicUniverses, isLoading } = usePublicUniverses();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">Public Universes</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Discover and explore TV show universes created by the community
          </p>
        </div>
      </div>

      {publicUniverses.length === 0 ? (
        <Card className="border-blue-200">
          <CardContent className="text-center py-12">
            <Globe className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Public Universes Yet</h3>
            <p className="text-muted-foreground">
              Be the first to create a public universe for others to discover!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {publicUniverses.map((universe) => (
            <Card 
              key={universe.id} 
              className="border-blue-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/tv-shows/universe/${universe.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-blue-700 text-lg line-clamp-2">
                    {universe.name}
                  </CardTitle>
                  <Badge variant="outline" className="border-green-200 text-green-700 flex-shrink-0">
                    <Globe className="w-3 h-3 mr-1" />
                    Public
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {universe.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {universe.description}
                  </p>
                )}
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    <span>Creator</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{new Date(universe.created_at).toLocaleDateString()}</span>
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

export default PublicUniverses;
