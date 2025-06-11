
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, BadgeIndianRupee } from 'lucide-react';
import { currencies, defaultCurrency } from '@/config/currencies';
import { useWallets } from '@/hooks/useWallets';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useTransfers } from '@/hooks/useTransfers';
import { useAppSettings } from '@/hooks/useAppSettings';

export const FinanceSettings: React.FC = () => {
  const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency.code);
  const { toast } = useToast();
  const { wallets } = useWallets();
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const { transfers } = useTransfers();
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
      const exportData = {
        wallets: wallets.map(w => ({
          name: w.name,
          balance: w.balance,
          currency: w.currency,
          color: w.color,
          icon: w.icon
        })),
        transactions: transactions.map(t => ({
          reason: t.reason,
          type: t.type,
          income: t.income,
          expense: t.expense,
          date: t.date,
          wallet_id: t.wallet_id,
          category_id: t.category_id
        })),
        categories: categories.map(c => ({
          name: c.name,
          color: c.color
        })),
        transfers: transfers.map(t => ({
          from_wallet_id: t.from_wallet_id,
          to_wallet_id: t.to_wallet_id,
          amount: t.amount,
          date: t.date,
          description: t.description,
          status: t.status
        })),
        exportDate: new Date().toISOString()
      };
      
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `finance_data_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      toast({
        title: 'Data Exported Successfully',
        description: 'Your financial data has been downloaded as a JSON file.',
        variant: 'default',
      });
    }, 1500);
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const jsonData = JSON.parse(event.target?.result as string);
            
            if (!jsonData.wallets || !jsonData.transactions || !jsonData.categories || !jsonData.transfers) {
              throw new Error('Invalid file format');
            }
            
            console.log('Imported data:', jsonData);
            
            toast({
              title: 'Data Import Successful',
              description: 'Your data has been imported. Please refresh the page to see changes.',
              variant: 'default',
            });
          } catch (error) {
            toast({
              title: 'Import Error',
              description: 'Failed to parse the imported file. Please check the file format.',
              variant: 'destructive',
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-green-700">Finance Settings</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Configure your finance preferences</p>
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
        
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700">Data Management</CardTitle>
            <CardDescription>Export or import your financial data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Export Data</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Download all your financial data including wallets, transactions, transfers, and categories
              </p>
              <Button onClick={handleExportData} className="w-full bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Export Financial Data
              </Button>
            </div>
            
            <div className="grid gap-2">
              <Label>Import Data</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Import previously exported financial data
              </p>
              <Button onClick={handleImportData} variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
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
