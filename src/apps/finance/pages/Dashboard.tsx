
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus
} from 'lucide-react';

// Mock data - replace with actual data from your store
const dashboardData = {
  totalBalance: 150000,
  monthlyIncome: 45000,
  monthlyExpenses: 32000,
  savings: 13000,
  currency: 'NPR',
  currencySymbol: 'रु',
  wallets: [
    { name: 'Cash', balance: 25000, color: 'green' },
    { name: 'Bank Account', balance: 125000, color: 'blue' },
  ],
  recentTransactions: [
    { title: 'Salary', amount: 45000, type: 'income', date: '2024-01-15' },
    { title: 'Groceries', amount: -2500, type: 'expense', date: '2024-01-14' },
    { title: 'Utilities', amount: -3200, type: 'expense', date: '2024-01-13' },
  ]
};

export const FinanceDashboard: React.FC = () => {
  const savingsRate = Math.round((dashboardData.savings / dashboardData.monthlyIncome) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Finance Dashboard</h1>
          <p className="text-muted-foreground">Track your financial health and manage your money</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.currencySymbol} {dashboardData.totalBalance.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dashboardData.currencySymbol} {dashboardData.monthlyIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {dashboardData.currencySymbol} {dashboardData.monthlyExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {dashboardData.currencySymbol} {dashboardData.savings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {savingsRate}% savings rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Savings Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Savings Progress</CardTitle>
          <CardDescription>
            Saved {dashboardData.currencySymbol} {dashboardData.savings.toLocaleString()} out of {dashboardData.currencySymbol} {dashboardData.monthlyIncome.toLocaleString()} income
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={savingsRate} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{savingsRate}% saved</span>
            <span>Target: 30%</span>
          </div>
        </CardContent>
      </Card>

      {/* Wallets and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Wallets</CardTitle>
            <CardDescription>Your account balances</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.wallets.map((wallet, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 bg-${wallet.color}-500 rounded-full`} />
                  <span className="font-medium">{wallet.name}</span>
                </div>
                <span className="font-semibold">
                  {dashboardData.currencySymbol} {wallet.balance.toLocaleString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentTransactions.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{transaction.title}</p>
                      <p className="text-xs text-muted-foreground">{transaction.date}</p>
                    </div>
                  </div>
                  <span className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : ''}
                    {dashboardData.currencySymbol} {Math.abs(transaction.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinanceDashboard;
