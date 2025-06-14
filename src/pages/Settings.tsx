import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, BadgeIndianRupee, FileText } from 'lucide-react';
import { currencies } from '@/config/currencies';
import { useWallets } from '@/hooks/useWallets';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useTransfers } from '@/hooks/useTransfers';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useCurrency } from '@/hooks/useCurrency';
import { convertToCSV, downloadCSV, parseCSV } from '@/utils/csvUtils';
import { supabase } from '@/integrations/supabase/client';

export const FinanceSettings: React.FC = () => {
  const { currency, updateCurrency } = useCurrency();
  const [exportOptions, setExportOptions] = useState({
    wallets: true,
    transactions: true,
    categories: true,
    transfers: true
  });
  const { toast } = useToast();
  const { wallets } = useWallets();
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const { transfers } = useTransfers();
  const { settings, toggleApp } = useAppSettings();

  const handleCurrencyChange = (value: string) => {
    updateCurrency(value);
    
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
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const files = Array.from(target.files || []);
      
      if (files.length === 0) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: 'Authentication Error',
            description: 'You must be logged in to import data.',
            variant: 'destructive',
          });
          return;
        }

        let totalImported = 0;
        let totalErrors = 0;

        for (const file of files) {
          try {
            const text = await file.text();
            const data = parseCSV(text);
            
            if (data.length === 0) {
              console.log(`No data found in file: ${file.name}`);
              continue;
            }

            const fileName = file.name.toLowerCase();
            
            if (fileName.includes('wallet')) {
              // Import wallets
              for (const row of data) {
                try {
                  const { error } = await supabase.from('wallets').insert({
                    name: row.name || 'Imported Wallet',
                    balance: parseFloat(row.balance) || 0,
                    currency: row.currency || 'USD',
                    user_id: user.id
                  });
                  if (error) {
                    console.error('Error importing wallet:', error);
                    totalErrors++;
                  } else {
                    totalImported++;
                  }
                } catch (err) {
                  console.error('Error processing wallet row:', err);
                  totalErrors++;
                }
              }
            } else if (fileName.includes('transaction')) {
              // Import transactions
              for (const row of data) {
                try {
                  const { error } = await supabase.from('transactions').insert({
                    reason: row.reason || 'Imported Transaction',
                    type: row.type || 'expense',
                    income: row.income ? parseFloat(row.income) : null,
                    expense: row.expense ? parseFloat(row.expense) : null,
                    date: row.date || new Date().toISOString().split('T')[0],
                    wallet_id: row.wallet_id,
                    category_id: row.category_id || null,
                    user_id: user.id
                  });
                  if (error) {
                    console.error('Error importing transaction:', error);
                    totalErrors++;
                  } else {
                    totalImported++;
                  }
                } catch (err) {
                  console.error('Error processing transaction row:', err);
                  totalErrors++;
                }
              }
            } else if (fileName.includes('transfer')) {
              // Import transfers
              for (const row of data) {
                try {
                  const { error } = await supabase.from('transfers').insert({
                    from_wallet_id: row.from_wallet_id,
                    to_wallet_id: row.to_wallet_id,
                    amount: parseFloat(row.amount) || 0,
                    date: row.date || new Date().toISOString().split('T')[0],
                    description: row.description || null,
                    status: row.status || 'completed',
                    user_id: user.id
                  });
                  if (error) {
                    console.error('Error importing transfer:', error);
                    totalErrors++;
                  } else {
                    totalImported++;
                  }
                } catch (err) {
                  console.error('Error processing transfer row:', err);
                  totalErrors++;
                }
              }
            } else if (fileName.includes('categor')) {
              // Import categories
              for (const row of data) {
                try {
                  const { error } = await supabase.from('categories').insert({
                    name: row.name || 'Imported Category',
                    color: row.color || '#3B82F6',
                    user_id: user.id
                  });
                  if (error) {
                    console.error('Error importing category:', error);
                    totalErrors++;
                  } else {
                    totalImported++;
                  }
                } catch (err) {
                  console.error('Error processing category row:', err);
                  totalErrors++;
                }
              }
            }
          } catch (fileError) {
            console.error(`Error processing file ${file.name}:`, fileError);
            totalErrors++;
          }
        }
        
        if (totalImported > 0) {
          toast({
            title: 'Data Import Successful',
            description: `Successfully imported ${totalImported} records. ${totalErrors > 0 ? `${totalErrors} errors occurred.` : ''} Please refresh the page to see changes.`,
          });
        } else {
          toast({
            title: 'Import Warning',
            description: 'No valid data was imported. Please check your CSV files format.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Import error:', error);
        toast({
          title: 'Import Error',
          description: 'Failed to import data. Please check the file format and try again.',
          variant: 'destructive',
        });
      }
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
                value={currency.code} 
                onValueChange={handleCurrencyChange}
              >
                <SelectTrigger id="currency" className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currencyOption) => (
                    <SelectItem key={currencyOption.code} value={currencyOption.code}>
                      <div className="flex items-center">
                        <span className="mr-2">{currencyOption.symbol}</span>
                        <span>{currencyOption.name} ({currencyOption.code})</span>
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
                  {currency.symbol} 1,000.00
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
                  <span>Supports CSV files with headers. File names should contain keywords like 'wallet', 'transaction', 'category', or 'transfer' to auto-detect data type.</span>
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
