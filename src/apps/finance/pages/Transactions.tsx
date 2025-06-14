import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Plus, ArrowUpRight, ArrowDownRight, ArrowLeftRight, Edit, Trash2, Wallet } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useTransfers } from '@/hooks/useTransfers';
import { useWallets } from '@/hooks/useWallets';
import { useCategories } from '@/hooks/useCategories';
import { useCurrency } from '@/hooks/useCurrency';

interface UnifiedTransaction {
  id: string;
  type: 'transaction' | 'transfer';
  subtype?: 'income' | 'expense';
  reason?: string;
  description?: string;
  amount: number;
  wallet_id?: string;
  from_wallet_id?: string;
  to_wallet_id?: string;
  category_id?: string;
  date: string;
  created_at: string;
}

const ITEMS_PER_PAGE = 5;

export const FinanceTransactions: React.FC = () => {
  const navigate = useNavigate();
  const { currency, formatAmount } = useCurrency();
  const { transactions, isLoading: transactionsLoading, createTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { transfers, isLoading: transfersLoading, createTransfer, updateTransfer, deleteTransfer } = useTransfers();
  const { wallets } = useWallets();
  const { categories } = useCategories();
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [editingTransfer, setEditingTransfer] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
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

  const unifiedData = useMemo(() => {
    const transactionItems: UnifiedTransaction[] = transactions.map(t => ({
      id: t.id,
      type: 'transaction',
      subtype: t.type,
      reason: t.reason,
      amount: t.income || t.expense || 0,
      wallet_id: t.wallet_id,
      category_id: t.category_id,
      date: t.date,
      created_at: t.created_at
    }));

    const transferItems: UnifiedTransaction[] = transfers.map(t => ({
      id: t.id,
      type: 'transfer',
      description: t.description,
      amount: t.amount,
      from_wallet_id: t.from_wallet_id,
      to_wallet_id: t.to_wallet_id,
      date: t.date,
      created_at: t.created_at
    }));

    return [...transactionItems, ...transferItems].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [transactions, transfers]);

  const totalPages = Math.ceil(unifiedData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = unifiedData.slice(startIndex, endIndex);

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
    setTransferFormData({ from_wallet_id: '', to_wallet_id: '', amount: 0, date: new Date().toISOString().split('T')[0], description: '' });
  };

  const handleEditTransaction = (transaction: any) => {
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

  const handleEditTransfer = (transfer: any) => {
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

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction.mutate(id);
    }
  };

  const handleDeleteTransfer = (id: string) => {
    if (confirm('Are you sure you want to delete this transfer?')) {
      deleteTransfer.mutate(id);
    }
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

  const isLoading = transactionsLoading || transfersLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-green-700">Transactions & Transfers</h1>
          <p className="text-muted-foreground">Manage your income, expenses and transfers</p>
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
                          {wallet.name} ({formatAmount(wallet.balance)})
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
              <Button variant="outline">
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
                  <Select value={transferFormData.from_wallet_id} onValueChange={(value) => setTransferFormData({ ...transferFormData, from_wallet_id: value })} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name} ({formatAmount(wallet.balance)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="to_wallet">To Wallet</Label>
                  <Select value={transferFormData.to_wallet_id} onValueChange={(value) => setTransferFormData({ ...transferFormData, to_wallet_id: value })} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name} ({formatAmount(wallet.balance)})
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
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 flex-1">
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
      
      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : unifiedData.length === 0 ? (
        <Card className="border-green-200">
          <CardContent className="text-center py-12">
            <div className="flex justify-center space-x-4 mb-4">
              <ArrowUpRight className="h-8 w-8 text-green-500" />
              <ArrowLeftRight className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Transactions Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first transaction or transfer</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {currentItems.map((item) => (
            <Card key={`${item.type}-${item.id}`} className="border-green-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {item.type === 'transfer' ? (
                        <ArrowLeftRight className="h-8 w-8 text-blue-600" />
                      ) : item.subtype === 'income' ? (
                        <ArrowUpRight className="h-8 w-8 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-8 w-8 text-red-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant={
                          item.type === 'transfer' ? 'secondary' :
                          item.subtype === 'income' ? 'default' : 'destructive'
                        }>
                          {item.type === 'transfer' ? 'Transfer' : item.subtype}
                        </Badge>
                        {item.type === 'transaction' && (
                          <Badge variant="outline" className="cursor-pointer" onClick={() => navigate(`/finance/wallet/${item.wallet_id}`)}>
                            <Wallet className="h-3 w-3 mr-1" />
                            {getWalletName(item.wallet_id!)}
                          </Badge>
                        )}
                      </div>
                      <p className="font-semibold text-green-700 truncate">
                        {item.type === 'transfer' 
                          ? `${getWalletName(item.from_wallet_id!)} → ${getWalletName(item.to_wallet_id!)}`
                          : item.reason
                        }
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {item.type === 'transfer' ? item.description : ''}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                        {item.type === 'transaction' && item.category_id && (
                          <Badge 
                            variant="outline" 
                            className="cursor-pointer hover:bg-gray-100" 
                            style={{ borderColor: getCategoryColor(item.category_id), color: getCategoryColor(item.category_id) }}
                            onClick={() => navigate(`/finance/category/${item.category_id}`)}
                          >
                            {getCategoryName(item.category_id)}
                          </Badge>
                        )}
                        {item.type === 'transfer' && (
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="cursor-pointer" onClick={() => navigate(`/finance/wallet/${item.from_wallet_id}`)}>
                              <Wallet className="h-3 w-3 mr-1" />
                              {getWalletName(item.from_wallet_id!)}
                            </Badge>
                            <span>→</span>
                            <Badge variant="outline" className="cursor-pointer" onClick={() => navigate(`/finance/wallet/${item.to_wallet_id}`)}>
                              <Wallet className="h-3 w-3 mr-1" />
                              {getWalletName(item.to_wallet_id!)}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="text-left sm:text-right">
                      <p className={`text-xl font-bold ${
                        item.type === 'transfer' ? 'text-blue-700' :
                        item.subtype === 'income' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {item.type === 'transaction' && item.subtype === 'income' ? '+' : 
                         item.type === 'transaction' && item.subtype === 'expense' ? '-' : ''}
                        {formatAmount(item.amount)}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => item.type === 'transfer' ? handleEditTransfer(transfers.find(t => t.id === item.id)) : handleEditTransaction(transactions.find(t => t.id === item.id))}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => item.type === 'transfer' ? handleDeleteTransfer(item.id) : handleDeleteTransaction(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {totalPages > 1 && (
            <Card className="border-green-200">
              <CardContent className="p-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                        }}
                        className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default FinanceTransactions;
