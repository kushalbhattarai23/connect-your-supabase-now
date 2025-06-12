
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, ArrowUpRight, ArrowDownRight, ArrowLeftRight, Edit, Trash2, Wallet } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useTransfers } from '@/hooks/useTransfers';
import { useWallets } from '@/hooks/useWallets';
import { useCategories } from '@/hooks/useCategories';

export const AllTransactions: React.FC = () => {
  const navigate = useNavigate();
  const { transactions, createTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { transfers, createTransfer, updateTransfer, deleteTransfer } = useTransfers();
  const { wallets } = useWallets();
  const { categories } = useCategories();
  
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [editingTransfer, setEditingTransfer] = useState<any>(null);
  
  const [transactionFormData, setTransactionFormData] = useState({
    reason: '',
    type: 'expense' as 'income' | 'expense',
    amount: 0,
    wallet_id: '',
    category_id: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [transferFormData, setTransferFormData] = useState({
    from_wallet_id: '',
    to_wallet_id: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Combine and sort all transactions and transfers
  const allItems = [
    ...transactions.map(t => ({
      ...t,
      item_type: 'transaction' as const,
      display_amount: t.income || t.expense || 0,
      is_income: t.type === 'income'
    })),
    ...transfers.map(t => ({
      ...t,
      item_type: 'transfer' as const,
      display_amount: t.amount,
      reason: t.description || 'Transfer'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transactionData = {
      reason: transactionFormData.reason,
      type: transactionFormData.type,
      wallet_id: transactionFormData.wallet_id,
      category_id: transactionFormData.category_id || undefined,
      date: transactionFormData.date,
      income: transactionFormData.type === 'income' ? transactionFormData.amount : undefined,
      expense: transactionFormData.type === 'expense' ? transactionFormData.amount : undefined
    };
    
    if (editingTransaction) {
      updateTransaction.mutate({ id: editingTransaction.id, ...transactionData });
    } else {
      createTransaction.mutate(transactionData);
    }
    
    setIsTransactionDialogOpen(false);
    setEditingTransaction(null);
    setTransactionFormData({
      reason: '',
      type: 'expense',
      amount: 0,
      wallet_id: '',
      category_id: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTransfer) {
      updateTransfer.mutate({ id: editingTransfer.id, ...transferFormData });
    } else {
      createTransfer.mutate(transferFormData);
    }
    
    setIsTransferDialogOpen(false);
    setEditingTransfer(null);
    setTransferFormData({
      from_wallet_id: '',
      to_wallet_id: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  const handleTransactionEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setTransactionFormData({
      reason: transaction.reason,
      type: transaction.type,
      amount: transaction.income || transaction.expense || 0,
      wallet_id: transaction.wallet_id,
      category_id: transaction.category_id || '',
      date: transaction.date
    });
    setIsTransactionDialogOpen(true);
  };

  const handleTransferEdit = (transfer: any) => {
    setEditingTransfer(transfer);
    setTransferFormData({
      from_wallet_id: transfer.from_wallet_id,
      to_wallet_id: transfer.to_wallet_id,
      amount: transfer.amount,
      date: transfer.date,
      description: transfer.description || ''
    });
    setIsTransferDialogOpen(true);
  };

  const getWalletName = (walletId: string) => {
    const wallet = wallets.find(w => w.id === walletId);
    return wallet ? wallet.name : 'Unknown Wallet';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'No Category';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : '#6B7280';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-green-700">All Transactions</h1>
          <p className="text-muted-foreground">Manage your transactions and transfers</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingTransaction ? 'Edit Transaction' : 'Create New Transaction'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleTransactionSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="reason">Description</Label>
                  <Input
                    id="reason"
                    value={transactionFormData.reason}
                    onChange={(e) => setTransactionFormData({ ...transactionFormData, reason: e.target.value })}
                    placeholder="e.g., Groceries, Salary"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={transactionFormData.type} onValueChange={(value: 'income' | 'expense') => setTransactionFormData({ ...transactionFormData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={transactionFormData.amount}
                    onChange={(e) => setTransactionFormData({ ...transactionFormData, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="wallet">Wallet</Label>
                  <Select value={transactionFormData.wallet_id} onValueChange={(value) => setTransactionFormData({ ...transactionFormData, wallet_id: value })} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name} (रु {wallet.balance.toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Select value={transactionFormData.category_id} onValueChange={(value) => setTransactionFormData({ ...transactionFormData, category_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={transactionFormData.date}
                    onChange={(e) => setTransactionFormData({ ...transactionFormData, date: e.target.value })}
                    required
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 flex-1">
                    {editingTransaction ? 'Update' : 'Create'} Transaction
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsTransactionDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                Add Transfer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingTransfer ? 'Edit Transfer' : 'Create New Transfer'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleTransferSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="from_wallet">From Wallet</Label>
                  <Select value={transferFormData.from_wallet_id} onValueChange={(value) => setTransferFormData({ ...transferFormData, from_wallet_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name} (रु {wallet.balance.toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="to_wallet">To Wallet</Label>
                  <Select value={transferFormData.to_wallet_id} onValueChange={(value) => setTransferFormData({ ...transferFormData, to_wallet_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name} (रु {wallet.balance.toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={transferFormData.amount}
                    onChange={(e) => setTransferFormData({ ...transferFormData, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={transferFormData.date}
                    onChange={(e) => setTransferFormData({ ...transferFormData, date: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={transferFormData.description}
                    onChange={(e) => setTransferFormData({ ...transferFormData, description: e.target.value })}
                    placeholder="Transfer description"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 flex-1">
                    {editingTransfer ? 'Update' : 'Create'} Transfer
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsTransferDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-700">All Transactions & Transfers</CardTitle>
        </CardHeader>
        <CardContent>
          {allItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions or transfers found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allItems.map((item) => (
                <Card key={`${item.item_type}-${item.id}`} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full flex-shrink-0 ${
                          item.item_type === 'transfer' 
                            ? 'bg-blue-100' 
                            : item.is_income ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {item.item_type === 'transfer' ? (
                            <ArrowLeftRight className="h-6 w-6 text-blue-600" />
                          ) : item.is_income ? (
                            <ArrowUpRight className="h-6 w-6 text-green-600" />
                          ) : (
                            <ArrowDownRight className="h-6 w-6 text-red-600" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate">{item.reason}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <div className="flex items-center text-sm text-gray-500">
                              <Wallet className="h-4 w-4 mr-1" />
                              {item.item_type === 'transfer' 
                                ? `${getWalletName(item.from_wallet_id)} → ${getWalletName(item.to_wallet_id)}`
                                : getWalletName(item.wallet_id)
                              }
                            </div>
                            {item.item_type === 'transaction' && item.category_id && (
                              <Badge 
                                variant="outline" 
                                className="cursor-pointer text-xs" 
                                style={{ borderColor: getCategoryColor(item.category_id), color: getCategoryColor(item.category_id) }}
                                onClick={() => navigate(`/finance/category/${item.category_id}`)}
                              >
                                {getCategoryName(item.category_id)}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="text-right">
                          <p className={`text-xl font-bold ${
                            item.item_type === 'transfer'
                              ? 'text-blue-600'
                              : item.is_income ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {item.item_type === 'transaction' && !item.is_income ? '-' : ''}रु {item.display_amount.toLocaleString()}
                          </p>
                          <Badge variant="outline" className={`text-xs ${
                            item.item_type === 'transfer'
                              ? 'border-blue-200 text-blue-700'
                              : item.is_income ? 'border-green-200 text-green-700' : 'border-red-200 text-red-700'
                          }`}>
                            {item.item_type === 'transfer' ? 'transfer' : item.type}
                          </Badge>
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => item.item_type === 'transaction' ? handleTransactionEdit(item) : handleTransferEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete this ${item.item_type}?`)) {
                                if (item.item_type === 'transaction') {
                                  deleteTransaction.mutate(item.id);
                                } else {
                                  deleteTransfer.mutate(item.id);
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AllTransactions;
