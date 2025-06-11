
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const TVShowPublicUniverses: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Public Universes</h1>
        <p className="text-muted-foreground">Explore universes created by the community</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Public Universes</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Public universes directory coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TVShowPublicUniverses;
