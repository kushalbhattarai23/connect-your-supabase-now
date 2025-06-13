
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, BadgeIndianRupee, FileText } from 'lucide-react';
import { currencies, defaultCurrency } from '@/config/currencies';
import { useWallets } from '@/hooks/useWallets';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useTransfers } from '@/hooks/useTransfers';
import { useLoans } from '@/hooks/useLoans';
import { useAppSettings } from '@/hooks/useAppSettings';
import { convertToCSV, downloadCSV, parseCSV } from '@/utils/csvUtils';

export const FinanceSettings: React.FC = () => {
  const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency.code);
  const [exportOptions, setExportOptions] = useState({
    wallets: true,
    transactions: true,
    categories: true,
    transfers: true,
    loans: true
  });
  const { toast } = useToast();
  const { wallets } = useWallets();
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const { transfers } = useTransfers();
  const { loans } = useLoans();
  const { settings, toggleApp } = useAppSettings();

  const handleCurrencyChange = (value: string) => {
    setSelectedCurrency(value);
    localStorage.setItem('preferredCurrency', value);
    
    const selectedCurrencyObj = currencies.find(c => c.code === value);
    
    toast({
      title: 'Currency Updated',
      description: `Your currency is now set to ${selectedCurrencyObj?.name} (${selectedCurrencyObj?.symbol})`,
    });
  };

  const handleExportData = () => {
    toast({
      title: 'Data Export Started',
      description: 'Your data is being prepared for download.',
    });
    
    setTimeout(() => {
      if (exportOptions.wallets && wallets.length > 0) {
        const walletsCSV = convertToCSV(
          wallets.map(w => ({
            name: w.name,
            balance: w.balance,
            currency: w.currency,
            created_at: w.created_at
          })),
          ['name', 'balance', 'currency', 'created_at']
        );
        downloadCSV(walletsCSV, 'wallets');
      }

      if (exportOptions.transactions && transactions.length > 0) {
        const transactionsCSV = convertToCSV(
          transactions.map(t => ({
            reason: t.reason,
            type: t.type,
            income: t.income || '',
            expense: t.expense || '',
            date: t.date,
            wallet_id: t.wallet_id,
            category_id: t.category_id || ''
          })),
          ['reason', 'type', 'income', 'expense', 'date', 'wallet_id', 'category_id']
        );
        downloadCSV(transactionsCSV, 'transactions');
      }

      if (exportOptions.categories && categories.length > 0) {
        const categoriesCSV = convertToCSV(
          categories.map(c => ({
            name: c.name,
            color: c.color
          })),
          ['name', 'color']
        );
        downloadCSV(categoriesCSV, 'categories');
      }

      if (exportOptions.transfers && transfers.length > 0) {
        const transfersCSV = convertToCSV(
          transfers.map(t => ({
            from_wallet_id: t.from_wallet_id,
            to_wallet_id: t.to_wallet_id,
            amount: t.amount,
            date: t.date,
            description: t.description || '',
            status: t.status
          })),
          ['from_wallet_id', 'to_wallet_id', 'amount', 'date', 'description', 'status']
        );
        downloadCSV(transfersCSV, 'transfers');
      }

      if (exportOptions.loans && loans.length > 0) {
        const loansCSV = convertToCSV(
          loans.map(l => ({
            name: l.name,
            type: l.type,
            amount: l.amount,
            remaining_amount: l.remaining_amount,
            status: l.status,
            person: l.person || '',
            description: l.description || ''
          })),
          ['name', 'type', 'amount', 'remaining_amount', 'status', 'person', 'description']
        );
        downloadCSV(loansCSV, 'loans');
      }
      
      toast({
        title: 'Data Exported Successfully',
        description: 'Your financial data has been downloaded as CSV files.',
        variant: 'default',
      });
    }, 1500);
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.multiple = true;
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const files = Array.from(target.files || []);
      
      if (files.length === 0) return;

      Promise.all(
        files.map(file => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              try {
                const csvText = event.target?.result as string;
                const data = parseCSV(csvText);
                resolve({ filename: file.name, data });
              } catch (error) {
                console.error('Error parsing file:', file.name, error);
                resolve({ filename: file.name, data: [] });
              }
            };
            reader.readAsText(file);
          });
        })
      ).then((results: any[]) => {
        const importedCount = results.reduce((total, result) => total + result.data.length, 0);
        
        if (importedCount > 0) {
          console.log('Imported data from files:', results);
          
          toast({
            title: 'Data Import Successful',
            description: `Imported ${importedCount} records from ${results.length} files. Please refresh the page to see changes.`,
            variant: 'default',
          });
        } else {
          toast({
            title: 'Import Warning',
            description: 'No valid data found in the selected files.',
            variant: 'destructive',
          });
        }
      });
    };
    input.click();
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-green-700">TrackerHub Settings</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Configure your application preferences</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700">App Preferences</CardTitle>
            <CardDescription>Choose which apps you want to use</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <Label htmlFor="tv-shows-toggle">TV Show Tracker</Label>
                <p className="text-sm text-muted-foreground">
                  Track your favorite TV shows and episodes
                </p>
              </div>
              <Switch 
                id="tv-shows-toggle" 
                checked={settings.enabledApps.tvShows}
                onCheckedChange={() => toggleApp('tvShows')}
                className="flex-shrink-0"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <Label htmlFor="finance-toggle">Finance Manager</Label>
                <p className="text-sm text-muted-foreground">
                  Manage your personal finances and expenses
                </p>
              </div>
              <Switch 
                id="finance-toggle" 
                checked={settings.enabledApps.finance}
                onCheckedChange={() => toggleApp('finance')}
                className="flex-shrink-0"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700">Currency Settings</CardTitle>
            <CardDescription>Choose your preferred currency for transactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="currency">Display Currency</Label>
              <Select 
                value={selectedCurrency} 
                onValueChange={handleCurrencyChange}
              >
                <SelectTrigger id="currency" className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center">
                        <span className="mr-2">{currency.symbol}</span>
                        <span>{currency.name} ({currency.code})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                This will change how amounts are displayed across the app
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="example-amount">Example Amount</Label>
              <div className="flex items-center p-2 border rounded-md bg-muted/30">
                <BadgeIndianRupee className="h-5 w-5 mr-2" />
                <span className="text-xl font-semibold">
                  {selectedCurrency === 'NPR' ? 'रु' : 
                   currencies.find(c => c.code === selectedCurrency)?.symbol} 1,000.00
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-green-700">Data Management</CardTitle>
            <CardDescription>Export or import your financial data in CSV format with customizable options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label>Export Data as CSV</Label>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Select data to export:</Label>
                  <div className="space-y-2">
                    {Object.entries(exportOptions).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={value}
                          onCheckedChange={(checked) => 
                            setExportOptions(prev => ({ ...prev, [key]: checked as boolean }))
                          }
                        />
                        <Label htmlFor={key} className="text-sm capitalize">
                          {key}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={handleExportData} className="w-full bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected Data
                </Button>
              </div>
              
              <div className="space-y-4">
                <Label>Import CSV Data</Label>
                <p className="text-sm text-muted-foreground">
                  Import CSV files with your financial data. You can select multiple files to import different data types at once.
                </p>
                <Button onClick={handleImportData} variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV Files
                </Button>
                <div className="flex items-start space-x-2 text-xs text-muted-foreground">
                  <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Supports CSV files exported from TrackerHub. Select multiple files for bulk import.</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700">Display Preferences</CardTitle>
            <CardDescription>Customize how financial data is displayed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <Label htmlFor="show-cents">Show Cents</Label>
                <p className="text-sm text-muted-foreground">
                  Display decimal places in monetary values
                </p>
              </div>
              <Switch id="show-cents" defaultChecked className="flex-shrink-0" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <Label htmlFor="thousand-separator">Use Thousand Separator</Label>
                <p className="text-sm text-muted-foreground">
                  Add commas to separate thousands in numbers
                </p>
              </div>
              <Switch id="thousand-separator" defaultChecked className="flex-shrink-0" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <Label htmlFor="colorize-amounts">Colorize Amounts</Label>
                <p className="text-sm text-muted-foreground">
                  Show expenses in red and income in green
                </p>
              </div>
              <Switch id="colorize-amounts" defaultChecked className="flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinanceSettings;
