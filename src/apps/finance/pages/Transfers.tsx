
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const FinanceTransfers: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transfers</h1>
        <p className="text-muted-foreground">Transfer money between wallets</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Transfers</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Transfer management interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceTransfers;
