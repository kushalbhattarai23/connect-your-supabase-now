import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, DollarSign, Phone, Mail, CreditCard } from 'lucide-react';
import { useCredits, CreateCreditData } from '@/hooks/useCredits';
import { useCurrency } from '@/hooks/useCurrency';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableCaption,
} from "@/components/ui/table";

export const Credits: React.FC = () => {
  const { credits, isLoading, createCredit, updateCredit, deleteCredit } = useCredits();
  const { formatAmount } = useCurrency();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCredit, setEditingCredit] = useState<any>(null);

  const [formData, setFormData] = useState<CreateCreditData>({
    name: '',
    person: '',
    phone: '',
    email: '',
    total_amount: 0,
    remaining_amount: 0,
    description: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      person: '',
      phone: '',
      email: '',
      total_amount: 0,
      remaining_amount: 0,
      description: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCredit) {
        await updateCredit.mutateAsync({
          id: editingCredit.id,
          ...formData
        });
        setIsEditOpen(false);
      } else {
        await createCredit.mutateAsync(formData);
        setIsCreateOpen(false);
      }
      resetForm();
      setEditingCredit(null);
    } catch (error) {
      console.error('Error saving credit:', error);
    }
  };

  const handleEdit = (credit: any) => {
    setEditingCredit(credit);
    setFormData({
      name: credit.name,
      person: credit.person,
      phone: credit.phone || '',
      email: credit.email || '',
      total_amount: credit.total_amount,
      remaining_amount: credit.remaining_amount,
      description: credit.description || ''
    });
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this credit?')) {
      await deleteCredit.mutateAsync(id);
    }
  };

  const sendEmail = (email: string, creditName: string) => {
    const subject = encodeURIComponent(`Credit Payment Reminder - ${creditName}`);
    const body = encodeURIComponent('Hello, this is a friendly reminder about your credit payment. Please let me know when you can make the payment. Thank you!');
    window.open(`mailto:${email}?subject=${subject}&body=${body}`);
  };

  const callPhone = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading credits...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-green-700">Credits</h1>
          <p className="text-muted-foreground">Manage credits you've given to others</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Credit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Credit</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Credit Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Emergency loan to John"
                  required
                />
              </div>
              <div>
                <Label htmlFor="person">Person</Label>
                <Input
                  id="person"
                  value={formData.person}
                  onChange={(e) => setFormData({ ...formData, person: e.target.value })}
                  placeholder="Who received this credit?"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="person@example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="total_amount">Total Amount</Label>
                  <Input
                    id="total_amount"
                    type="number"
                    step="0.01"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({ ...formData, total_amount: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="remaining_amount">Remaining Amount</Label>
                  <Input
                    id="remaining_amount"
                    type="number"
                    step="0.01"
                    value={formData.remaining_amount}
                    onChange={(e) => setFormData({ ...formData, remaining_amount: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional notes about this credit"
                />
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                Create Credit
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {credits.map((credit) => (
          <Card key={credit.id} className="border-green-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-green-700">{credit.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mb-2">To: {credit.person}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(credit)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(credit.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                <span className="text-sm">
                  {formatAmount(credit.remaining_amount)} / {formatAmount(credit.total_amount)}
                </span>
              </div>
              
              <div className="flex gap-2">
                {credit.phone && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => callPhone(credit.phone!)}
                    className="flex-1"
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                )}
                {credit.email && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendEmail(credit.email!, credit.name)}
                    className="flex-1"
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </Button>
                )}
              </div>
              
              {credit.description && (
                <p className="text-sm text-muted-foreground">{credit.description}</p>
              )}
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ 
                    width: `${((credit.total_amount - credit.remaining_amount) / credit.total_amount) * 100}%` 
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {Math.round(((credit.total_amount - credit.remaining_amount) / credit.total_amount) * 100)}% paid
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Credit</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Credit Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-person">Person</Label>
              <Input
                id="edit-person"
                value={formData.person}
                onChange={(e) => setFormData({ ...formData, person: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-total">Total Amount</Label>
                <Input
                  id="edit-total"
                  type="number"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={(e) => setFormData({ ...formData, total_amount: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-remaining">Remaining Amount</Label>
                <Input
                  id="edit-remaining"
                  type="number"
                  step="0.01"
                  value={formData.remaining_amount}
                  onChange={(e) => setFormData({ ...formData, remaining_amount: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
              Update Credit
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Loan Transactions Section */}
      <LoanTransactionsSection />

      {/* Loan Categories Section */}
      <LoanCategoriesSection />
    </div>
  );
};

const LoanTransactionsSection: React.FC = () => {
  const { transactions, isLoading: txLoading } = useTransactions();
  const { categories, isLoading: catLoading } = useCategories();
  const { formatAmount } = useCurrency();

  if (txLoading || catLoading) return <div className="text-muted-foreground py-4">Loading transactions...</div>;

  // Find category ids whose name includes 'loan' (case-insensitive)
  const loanCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes('loan')
  );
  const loanCategoryIds = loanCategories.map(cat => cat.id);

  // Filter transactions with those category ids
  const loanTxs = transactions.filter(tx =>
    tx.category_id && loanCategoryIds.includes(tx.category_id)
  );

  if (!loanTxs.length) {
    return (
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-2 text-green-700">Loan Transactions</h2>
        <div className="text-muted-foreground py-4">No transactions found for loan categories.</div>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold mb-2 text-green-700">Loan Transactions</h2>
      <div className="bg-background border rounded-lg overflow-x-auto">
        <Table>
          <TableCaption>All your transactions in "Loan" categories.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loanTxs.map(tx => {
              const cat = categories.find(c => c.id === tx.category_id);
              return (
                <TableRow key={tx.id}>
                  <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span
                      className="inline-block w-4 h-4 rounded-full align-middle mr-2"
                      style={{ backgroundColor: cat?.color }}
                      aria-label={`Category color for ${cat?.name}`}
                    />
                    <span className="text-xs">{cat?.name}</span>
                  </TableCell>
                  <TableCell>{tx.reason}</TableCell>
                  <TableCell>
                    <span
                      className={
                        tx.type === 'income'
                          ? 'text-green-700 font-medium'
                          : 'text-red-700 font-medium'
                      }
                    >
                      {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span>
                      {tx.type === 'income' && tx.income
                        ? formatAmount(tx.income)
                        : tx.type === 'expense' && tx.expense
                        ? formatAmount(tx.expense)
                        : '-'}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

const LoanCategoriesSection: React.FC = () => {
  const { categories, isLoading } = useCategories();

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold mb-2 text-green-700">Loan Categories</h2>
      {isLoading ? (
        <div className="text-muted-foreground py-4">Loading categories...</div>
      ) : categories && categories.length > 0 ? (
        <div className="bg-background border rounded-lg overflow-x-auto">
          <Table>
            <TableCaption>A list of all your loan categories.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Color</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>{cat.name}</TableCell>
                  <TableCell>
                    <span
                      className="inline-block w-4 h-4 rounded-full align-middle mr-2"
                      style={{ backgroundColor: cat.color }}
                      aria-label={`Category color for ${cat.name}`}
                    />
                    <span className="text-xs text-muted-foreground">{cat.color}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-muted-foreground py-4">No loan categories found.</div>
      )}
    </section>
  );
};

export default Credits;
