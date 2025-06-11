
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const FinanceSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Finance Settings</h1>
        <p className="text-muted-foreground">Configure your finance preferences</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Settings interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceSettings;
