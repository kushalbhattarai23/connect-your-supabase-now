
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const TVShowPublicShows: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Public Shows</h1>
        <p className="text-muted-foreground">Discover popular shows from the community</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Public Shows</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Public shows directory coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TVShowPublicShows;
