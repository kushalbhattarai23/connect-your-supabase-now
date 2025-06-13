

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, DollarSign, Download, Upload } from 'lucide-react';
import { useLoans, CreateLoanData } from '@/hooks/useLoans';
import { formatCurrency } from '@/lib/utils';
import { convertToCSV, downloadCSV, parseCSV } from '@/utils/csvUtils';
import { toast } from 'sonner';

const loanTypes = ['Personal', 'Mortgage', 'Car', 'Student', 'Business', 'Other'] as const;
const loanStatuses = ['active', 'paid_off', 'defaulted'] as const;

export const Loans: React.FC = () => {
  const { loans, isLoading, createLoan, updateLoan, deleteLoan } = useLoans();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<any>(null);

  const [formData, setFormData] = useState<CreateLoanData>({
    name: '',
    type: 'Personal',
    amount: 0,
    remaining_amount: 0,
    status: 'active',
    person: '',
    description: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'Personal',
      amount: 0,
      remaining_amount: 0,
      status: 'active',
      person: '',
      description: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLoan) {
        await updateLoan.mutateAsync({
          id: editingLoan.id,
          ...formData,
          type: formData.type as 'Personal' | 'Mortgage' | 'Car' | 'Student' | 'Business' | 'Other',
          status: formData.status as 'active' | 'paid_off' | 'defaulted'
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
      person: loan.person || '',
      description: loan.description || ''
    });
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this loan?')) {
      await deleteLoan.mutateAsync(id);
    }
  };

  const handleExportCSV = () => {
    const exportHeaders = ['name', 'type', 'amount', 'remaining_amount', 'status', 'person', 'description'];
    const exportData = loans.map(loan => ({
      name: loan.name,
      type: loan.type,
      amount: loan.amount,
      remaining_amount: loan.remaining_amount,
      status: loan.status,
      person: loan.person || '',
      description: loan.description || ''
    }));
    
    const csvContent = convertToCSV(exportData, exportHeaders);
    downloadCSV(csvContent, 'loans');
    toast.success('Loans exported successfully');
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csvText = e.target?.result as string;
        const importedData = parseCSV(csvText);
        
        for (const row of importedData) {
          if (row.name && row.type && row.amount && row.remaining_amount && row.person) {
            await createLoan.mutateAsync({
              name: row.name,
              type: row.type,
              amount: parseFloat(row.amount) || 0,
              remaining_amount: parseFloat(row.remaining_amount) || 0,
              status: row.status || 'active',
              person: row.person,
              description: row.description || ''
            });
          }
        }
        toast.success(`Imported ${importedData.length} loans successfully`);
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Failed to import loans');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
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
                  <Label htmlFor="person">Person</Label>
                  <Input
                    id="person"
                    value={formData.person}
                    onChange={(e) => setFormData({ ...formData, person: e.target.value })}
                    placeholder="Who took this loan?"
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
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Loan Amount</Label>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loans.map((loan) => (
          <Card key={loan.id} className="border-green-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-green-700">{loan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mb-2">Borrower: {loan.person}</p>
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
              <div className="text-xs text-muted-foreground">
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
              <Label htmlFor="edit-person">Person</Label>
              <Input
                id="edit-person"
                value={formData.person}
                onChange={(e) => setFormData({ ...formData, person: e.target.value })}
                placeholder="Who took this loan?"
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
                      {type}
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
                <Label htmlFor="edit-amount">Loan Amount</Label>
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
