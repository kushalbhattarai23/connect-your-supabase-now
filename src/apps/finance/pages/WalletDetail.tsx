
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Calendar, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useWallets } from '@/hooks/useWallets';
import { useTransactions } from '@/hooks/useTransactions';

export const WalletDetail: React.FC = () => {
  const { walletId } = useParams<{ walletId: string }>();
  const { wallets } = useWallets();
  const { transactions } = useTransactions();

  const wallet = wallets.find(w => w.id === walletId);
  const walletTransactions = transactions.filter(t => t.wallet_id === walletId);

  if (!wallet) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="border-red-200">
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Wallet Not Found</h3>
            <p className="text-muted-foreground">The wallet you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalIncome = walletTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.income || 0), 0);

  const totalExpense = walletTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.expense || 0), 0);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Wallet Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-green-700 flex items-center gap-2">
            <Wallet className="h-8 w-8" />
            {wallet.name}
          </h1>
          <p className="text-muted-foreground">Wallet details and transaction history</p>
        </div>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <Wallet className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              रु {wallet.balance.toLocaleString()}
            </div>
            <Badge variant="outline" className="border-green-200 text-green-700 mt-1">
              {wallet.currency}
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              रु {totalIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              रु {totalExpense.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {walletTransactions.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-700">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {walletTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found for this wallet
            </div>
          ) : (
            <div className="space-y-4">
              {walletTransactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {transaction.type === 'income' ? 
                        <ArrowUp className="h-4 w-4 text-green-600" /> : 
                        <ArrowDown className="h-4 w-4 text-red-600" />
                      }
                    </div>
                    <div>
                      <p className="font-medium">{transaction.reason}</p>
                      <p className="text-sm text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}रु {(transaction.income || transaction.expense || 0).toLocaleString()}
                    </p>
                    <Badge variant="outline" className={`${transaction.type === 'income' ? 'border-green-200 text-green-700' : 'border-red-200 text-red-700'}`}>
                      {transaction.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletDetail;
