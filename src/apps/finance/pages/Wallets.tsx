
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Wallet, Edit, Trash2 } from 'lucide-react';
import { useWallets } from '@/hooks/useWallets';

export const FinanceWallets: React.FC = () => {
  const { wallets, isLoading, createWallet, updateWallet, deleteWallet } = useWallets();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    balance: 0,
    currency: 'NPR',
    color: '#22C55E',
    icon: 'wallet'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingWallet) {
      updateWallet.mutate({ id: editingWallet.id, ...formData });
    } else {
      createWallet.mutate(formData);
    }
    
    setIsDialogOpen(false);
    setEditingWallet(null);
    setFormData({ name: '', balance: 0, currency: 'NPR', color: '#22C55E', icon: 'wallet' });
  };

  const handleEdit = (wallet: any) => {
    setEditingWallet(wallet);
    setFormData({
      name: wallet.name,
      balance: wallet.balance,
      currency: wallet.currency,
      color: wallet.color || '#22C55E',
      icon: wallet.icon || 'wallet'
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this wallet?')) {
      deleteWallet.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-700">Wallets</h1>
          <p className="text-muted-foreground">Manage your accounts and balances</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Wallet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingWallet ? 'Edit Wallet' : 'Create New Wallet'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Wallet Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Cash, Bank Account"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="balance">Initial Balance</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NPR">NPR (रु)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-4">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingWallet ? 'Update' : 'Create'} Wallet
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">Loading wallets...</div>
      ) : wallets.length === 0 ? (
        <Card className="border-green-200">
          <CardContent className="text-center py-8">
            <Wallet className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Wallets Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first wallet to start tracking your finances</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallets.map((wallet) => (
            <Card key={wallet.id} className="border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <Wallet className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-green-700">{wallet.name}</CardTitle>
                </div>
                <div className="flex space-x-1">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(wallet)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(wallet.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700 mb-2">
                  रु {wallet.balance.toLocaleString()}
                </div>
                <Badge variant="outline" className="border-green-200 text-green-700">
                  {wallet.currency}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FinanceWallets;
