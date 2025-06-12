import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Calendar, DollarSign } from 'lucide-react';
import { useLoans, CreateLoanData } from '@/hooks/useLoans';
import { formatCurrency } from '@/lib/utils';

const loanTypes = ['personal', 'mortgage', 'car', 'student', 'business', 'other'] as const;
const loanStatuses = ['active', 'paid_off', 'defaulted'] as const;

export const Loans: React.FC = () => {
  const { loans, isLoading, createLoan, updateLoan, deleteLoan } = useLoans();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<any>(null);

  const [formData, setFormData] = useState<CreateLoanData>({
    name: '',
    type: 'personal',
    amount: 0,
    remaining_amount: 0,
    status: 'active',
    due_date: '',
    description: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'personal',
      amount: 0,
      remaining_amount: 0,
      status: 'active',
      due_date: '',
      description: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLoan) {
        await updateLoan.mutateAsync({
          id: editingLoan.id,
          ...formData
        });
        setIsEditOpen(false);
      } else {
        await createLoan.mutateAsync(formData);
        setIsCreateOpen(false);
      }
      resetForm();
      setEditingLoan(null);
    } catch (error) {
      console.error('Error saving loan:', error);
    }
  };

  const handleEdit = (loan: any) => {
    setEditingLoan(loan);
    setFormData({
      name: loan.name,
      type: loan.type as any,
      amount: loan.amount,
      remaining_amount: loan.remaining_amount,
      status: loan.status,
      due_date: loan.due_date || '',
      description: loan.description || ''
    });
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this loan?')) {
      await deleteLoan.mutateAsync(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-yellow-100 text-yellow-800';
      case 'paid_off': return 'bg-green-100 text-green-800';
      case 'defaulted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading loans...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-green-700">Loans</h1>
          <p className="text-muted-foreground">Manage your loans and track payments</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Loan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Loan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Loan Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Loan Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select loan type" />
                  </SelectTrigger>
                  <SelectContent>
                    {loanTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Total Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="remaining_amount">Remaining Amount</Label>
                  <Input
                    id="remaining_amount"
                    type="number"
                    value={formData.remaining_amount}
                    onChange={(e) => setFormData({ ...formData, remaining_amount: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                Create Loan
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loans.map((loan) => (
          <Card key={loan.id} className="border-green-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-green-700">{loan.name}</CardTitle>
                  <Badge className={getStatusColor(loan.status)}>
                    {loan.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(loan)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(loan.id)}
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
                  {formatCurrency(loan.remaining_amount)} / {formatCurrency(loan.amount)}
                </span>
              </div>
              {loan.due_date && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-green-600" />
                  <span className="text-sm">Due: {new Date(loan.due_date).toLocaleDateString()}</span>
                </div>
              )}
              <div className="text-xs text-muted-foreground capitalize">
                {loan.type} loan
              </div>
              {loan.description && (
                <p className="text-sm text-muted-foreground">{loan.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Loan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <Label htmlFor="edit-name">Loan Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-type">Loan Type</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select loan type" />
                </SelectTrigger>
                <SelectContent>
                  {loanTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {loanStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-amount">Total Amount</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-remaining">Remaining Amount</Label>
                <Input
                  id="edit-remaining"
                  type="number"
                  value={formData.remaining_amount}
                  onChange={(e) => setFormData({ ...formData, remaining_amount: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-due-date">Due Date</Label>
              <Input
                id="edit-due-date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
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
              Update Loan
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Loans;
