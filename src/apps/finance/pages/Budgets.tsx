import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { useBudgets, CreateBudgetData } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { formatCurrency } from '@/lib/utils';

export const Budgets: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [budgetType, setBudgetType] = useState<'monthly' | 'category'>('monthly');

  const { budgets, isLoading, createBudget, updateBudget, deleteBudget } = useBudgets(selectedMonth, selectedYear);
  const { categories } = useCategories();
  const { transactions } = useTransactions();

  const [formData, setFormData] = useState<CreateBudgetData>({
    category_id: null,
    amount: 0,
    month: selectedMonth,
    year: selectedYear
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i - 5);

  const getSpentAmount = (categoryId?: string | null) => {
    if (categoryId) {
      return transactions
        .filter(t => 
          t.category_id === categoryId && 
          t.type === 'expense' &&
          new Date(t.date).getMonth() + 1 === selectedMonth &&
          new Date(t.date).getFullYear() === selectedYear
        )
        .reduce((sum, t) => sum + (t.expense || 0), 0);
    } else {
      // Total monthly spending
      return transactions
        .filter(t => 
          t.type === 'expense' &&
          new Date(t.date).getMonth() + 1 === selectedMonth &&
          new Date(t.date).getFullYear() === selectedYear
        )
        .reduce((sum, t) => sum + (t.expense || 0), 0);
    }
  };

  const resetForm = () => {
    setFormData({
      category_id: budgetType === 'category' ? '' : null,
      amount: 0,
      month: selectedMonth,
      year: selectedYear
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let data: CreateBudgetData = {
        ...formData,
        // Set category_id properly depending on budget type
        category_id:
          budgetType === 'category'
            ? formData.category_id
              ? formData.category_id
              : ''
            : null,
        month: formData.month,
        year: formData.year
      };
      if (editingBudget) {
        await updateBudget.mutateAsync({
          id: editingBudget.id,
          ...data
        });
        setIsEditOpen(false);
      } else {
        await createBudget.mutateAsync(data);
        setIsCreateOpen(false);
      }
      resetForm();
      setEditingBudget(null);
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const handleEdit = (budget: any) => {
    const hasCategory = !!budget.category_id;
    setEditingBudget(budget);
    setBudgetType(hasCategory ? 'category' : 'monthly');
    setFormData({
      category_id: hasCategory ? budget.category_id : '',
      amount: budget.amount,
      month: budget.month,
      year: budget.year
    });
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      await deleteBudget.mutateAsync(id);
    }
  };

  const handleMonthYearChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setFormData(prev => ({ ...prev, month, year }));
  };

  // Calculate total monthly budget and spending
  const totalMonthlyBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalMonthlySpent = getSpentAmount();
  const monthlyBudgetRemaining = totalMonthlyBudget - totalMonthlySpent;
  const monthlyProgressPercentage = totalMonthlyBudget > 0 ? (totalMonthlySpent / totalMonthlyBudget) * 100 : 0;

  // Helper to get category spending summary for current month/year
  const categorySpendingSummary = React.useMemo(() => {
    // Map: categoryId => { name, color, expense, income }
    const summary: { [id: string]: { name: string; color: string; expense: number; income: number } } = {};
    transactions
      .filter(
        (t) =>
          (t.type === 'expense' || t.type === 'income') &&
          new Date(t.date).getMonth() + 1 === selectedMonth &&
          new Date(t.date).getFullYear() === selectedYear
      )
      .forEach((t) => {
        // Use the categories from the transaction if available, otherwise from the categories list
        let categoryId = t.category_id || '__uncategorized__';
        let catObj =
          (t as any).categories ||
          categories.find((c) => c.id === t.category_id) ||
          undefined;

        const categoryName = catObj?.name || 'Uncategorized';
        const categoryColor = catObj?.color || '#9ca3af';

        if (!summary[categoryId]) {
          summary[categoryId] = { name: categoryName, color: categoryColor, expense: 0, income: 0 };
        }
        if (t.type === 'expense') {
          summary[categoryId].expense += t.expense || 0;
        }
        if (t.type === 'income') {
          summary[categoryId].income += t.income || 0;
        }
      });

    // Sort by total transaction amount (expense + income)
    return Object.values(summary).sort(
      (a, b) => (b.expense + b.income) - (a.expense + a.income)
    );
  }, [transactions, selectedMonth, selectedYear, categories]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading budgets...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-green-700">Budgets</h1>
          <p className="text-muted-foreground">Set and track monthly spending limits</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="budget-type">Budget Type</Label>
                <Select value={budgetType} onValueChange={(value: 'monthly' | 'category') => {
                  setBudgetType(value);
                  setFormData(f => ({
                    ...f,
                    category_id: value === 'category' ? '' : null
                  }));
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly Total Budget</SelectItem>
                    <SelectItem value="category">Category Budget</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {budgetType === 'category' && (
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={typeof formData.category_id === 'string' ? formData.category_id : ''}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div>
                <Label htmlFor="amount">Budget Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="month">Month</Label>
                  <Select value={formData.month.toString()} onValueChange={(value) => 
                    handleMonthYearChange(parseInt(value), formData.year)
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month, index) => (
                        <SelectItem key={index} value={(index + 1).toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Select value={formData.year.toString()} onValueChange={(value) => 
                    handleMonthYearChange(formData.month, parseInt(value))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                Create Budget
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 items-center">
        <Select value={selectedMonth.toString()} onValueChange={(value) => 
          handleMonthYearChange(parseInt(value), selectedYear)
        }>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((month, index) => (
              <SelectItem key={index} value={(index + 1).toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedYear.toString()} onValueChange={(value) => 
          handleMonthYearChange(selectedMonth, parseInt(value))
        }> 
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Monthly Budget Overview */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-700 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Monthly Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Budget</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(totalMonthlyBudget)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalMonthlySpent)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className={`text-2xl font-bold ${monthlyBudgetRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(monthlyBudgetRemaining)}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Monthly Progress</span>
              <span>{monthlyProgressPercentage.toFixed(1)}%</span>
            </div>
            <Progress 
              value={Math.min(monthlyProgressPercentage, 100)} 
              color={monthlyProgressPercentage > 100 ? "red" : "green"}
              className={`h-3 ${monthlyProgressPercentage > 100 ? 'bg-red-100' : 'bg-green-100'}`}
            />
          </div>
        </CardContent>
      </Card>

      {/* --- Monthly Category Transactions Table --- */}
      <div>
        <h2 className="text-xl font-bold text-green-700 mt-6 mb-2">Monthly Transactions by Category</h2>
        <div className="rounded-lg border border-green-100 shadow-sm overflow-x-auto bg-white">
          <table className="min-w-full divide-y divide-green-100">
            <thead className="bg-green-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-green-700">Category</th>
                <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider text-green-700">Expense</th>
                <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider text-green-700">Income</th>
              </tr>
            </thead>
            <tbody>
              {categorySpendingSummary.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-4 px-4 text-center text-muted-foreground">No transactions in this month.</td>
                </tr>
              ) : (
                categorySpendingSummary.map((cat) => (
                  <tr key={cat.name} className="border-b last:border-0 hover:bg-green-50 transition">
                    <td className="py-2 px-4 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                      <span>{cat.name}</span>
                    </td>
                    <td className="py-2 px-4 text-right font-mono font-medium text-red-600">
                      {cat.expense > 0 ? formatCurrency(cat.expense) : '-'}
                    </td>
                    <td className="py-2 px-4 text-right font-mono font-medium text-green-600">
                      {cat.income > 0 ? formatCurrency(cat.income) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => {
          const spent = getSpentAmount(budget.category_id);
          const remaining = budget.amount - spent;
          const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
          const isOverBudget = spent > budget.amount;

          return (
            <Card key={budget.id} className={`border-green-200 ${isOverBudget ? 'border-red-200' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-2" 
                      style={{ backgroundColor: budget.categories?.color || '#3B82F6' }}
                    />
                    <CardTitle className="text-green-700">
                      {budget.categories?.name || 'Monthly Total'}
                    </CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(budget)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(budget.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Spent</span>
                    <span className={isOverBudget ? 'text-red-600' : 'text-green-600'}>
                      {formatCurrency(spent)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Budget</span>
                    <span>{formatCurrency(budget.amount)}</span>
                  </div>
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    color={isOverBudget ? "red" : "green"}
                    className={`h-2 ${isOverBudget ? 'bg-red-100' : 'bg-green-100'}`}
                  />
                  <div className="flex justify-between text-sm">
                    <span className={isOverBudget ? 'text-red-600' : 'text-green-600'}>
                      {isOverBudget ? 'Over budget' : 'Remaining'}
                    </span>
                    <span className={isOverBudget ? 'text-red-600' : 'text-green-600'}>
                      {isOverBudget ? 
                        `-${formatCurrency(Math.abs(remaining))}` : 
                        formatCurrency(remaining)
                      }
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  {isOverBudget ? (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  )}
                  <span className={`text-sm ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                    {percentage.toFixed(1)}% used
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-budget-type">Budget Type</Label>
              <Select value={budgetType} onValueChange={(value: 'monthly' | 'category') => {
                setBudgetType(value);
                setFormData(f => ({
                  ...f,
                  category_id: value === 'category' ? (typeof f.category_id === 'string' ? f.category_id : '') : null
                }));
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly Total Budget</SelectItem>
                  <SelectItem value="category">Category Budget</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {budgetType === 'category' && (
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={typeof formData.category_id === 'string' ? formData.category_id : ''}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="edit-amount">Budget Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
              Update Budget
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Budgets;

// This file is now over 434 lines. Consider splitting it into smaller components for maintainability.
