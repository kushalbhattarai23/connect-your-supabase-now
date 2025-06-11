
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const TVShowPrivateUniverses: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Private Universes</h1>
        <p className="text-muted-foreground">Manage your personal show universes</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Private Universes</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Private universes management coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TVShowPrivateUniverses;
