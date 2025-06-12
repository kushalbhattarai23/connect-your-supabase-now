
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag, TrendingUp, TrendingDown, Calendar, ArrowUp, ArrowDown, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { useWallets } from '@/hooks/useWallets';

export const CategoryDetail: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { categories } = useCategories();
  const { transactions } = useTransactions();
  const { wallets } = useWallets();

  const category = categories.find(c => c.id === categoryId);
  const categoryTransactions = transactions.filter(t => t.category_id === categoryId);

  const getWalletName = (walletId: string) => {
    const wallet = wallets.find(w => w.id === walletId);
    return wallet ? wallet.name : 'Unknown Wallet';
  };

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="border-red-200">
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Category Not Found</h3>
            <p className="text-muted-foreground">The category you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalAmount = categoryTransactions.reduce((sum, t) => sum + (t.income || t.expense || 0), 0);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Category Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-green-700 flex items-center gap-2">
            <Tag className="h-8 w-8" style={{ color: category.color }} />
            {category.name}
          </h1>
          <p className="text-muted-foreground">Category transactions and analytics</p>
        </div>
      </div>

      {/* Category Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: category.color }}>
              रु {totalAmount.toLocaleString()}
            </div>
            <Badge variant="outline" style={{ borderColor: category.color, color: category.color }}>
              {category.name}
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {categoryTransactions.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Amount</CardTitle>
            <Tag className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              रु {categoryTransactions.length > 0 ? Math.round(totalAmount / categoryTransactions.length).toLocaleString() : '0'}
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
          {categoryTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found for this category
            </div>
          ) : (
            <div className="space-y-4">
              {categoryTransactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full" style={{ backgroundColor: `${category.color}20` }}>
                      {transaction.type === 'income' ? 
                        <ArrowUp className="h-4 w-4" style={{ color: category.color }} /> : 
                        <ArrowDown className="h-4 w-4" style={{ color: category.color }} />
                      }
                    </div>
                    <div>
                      <p className="font-medium">{transaction.reason}</p>
                      <p className="text-sm text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">{getWalletName(transaction.wallet_id)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{ color: category.color }}>
                      {transaction.type === 'income' ? '+' : '-'}रु {(transaction.income || transaction.expense || 0).toLocaleString()}
                    </p>
                    <Badge variant="outline" style={{ borderColor: category.color, color: category.color }}>
                      {category.name}
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

export default CategoryDetail;
