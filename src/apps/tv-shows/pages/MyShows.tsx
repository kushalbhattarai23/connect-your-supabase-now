
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const TVShowMyShows: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Shows</h1>
        <p className="text-muted-foreground">Manage your personal TV show collection</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>My Shows</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Show management interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TVShowMyShows;
