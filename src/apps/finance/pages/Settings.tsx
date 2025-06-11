
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, BadgeIndianRupee, CreditCard, ArrowRight } from 'lucide-react';
import { currencies, defaultCurrency } from '@/config/currencies';

export const FinanceSettings: React.FC = () => {
  const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency.code);
  const { toast } = useToast();

  const handleCurrencyChange = (value: string) => {
    setSelectedCurrency(value);
    
    // In a real application, you would save this to user preferences in the database
    localStorage.setItem('preferredCurrency', value);
    
    const selectedCurrencyObj = currencies.find(c => c.code === value);
    
    toast({
      title: 'Currency Updated',
      description: `Your currency is now set to ${selectedCurrencyObj?.name} (${selectedCurrencyObj?.symbol})`,
    });
  };

  const handleExportData = () => {
    // In a real application, this would export all user data
    toast({
      title: 'Data Export Started',
      description: 'Your data is being prepared for download.',
    });
    
    // Simulate data preparation delay
    setTimeout(() => {
      const dummyData = {
        wallets: [
          { id: 1, name: 'Cash', balance: 5000 },
          { id: 2, name: 'Bank', balance: 15000 }
        ],
        transactions: [
          { id: 1, title: 'Salary', amount: 45000, type: 'income' },
          { id: 2, title: 'Groceries', amount: 2500, type: 'expense' }
        ]
      };
      
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dummyData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "finance_data.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      toast({
        title: 'Data Exported Successfully',
        description: 'Your data has been downloaded as a JSON file.',
        variant: 'default',
      });
    }, 1500);
  };

  const handleImportData = () => {
    // In a real application, this would open a file picker
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
            console.log('Imported data:', jsonData);
            
            toast({
              title: 'Data Import Successful',
              description: 'Your data has been imported.',
              variant: 'default',
            });
          } catch (error) {
            toast({
              title: 'Import Error',
              description: 'Failed to parse the imported file.',
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Finance Settings</h1>
        <p className="text-muted-foreground">Configure your finance preferences</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Currency Settings</CardTitle>
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
        
        <Card>
          <CardHeader>
            <CardTitle>Display Preferences</CardTitle>
            <CardDescription>Customize how financial data is displayed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-cents">Show Cents</Label>
                <p className="text-sm text-muted-foreground">
                  Display decimal places in monetary values
                </p>
              </div>
              <Switch id="show-cents" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="thousand-separator">Use Thousand Separator</Label>
                <p className="text-sm text-muted-foreground">
                  Add commas to separate thousands in numbers
                </p>
              </div>
              <Switch id="thousand-separator" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="colorize-amounts">Colorize Amounts</Label>
                <p className="text-sm text-muted-foreground">
                  Show expenses in red and income in green
                </p>
              </div>
              <Switch id="colorize-amounts" defaultChecked />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Export or import your financial data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Export Data</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Download all your financial data as a JSON file
              </p>
              <Button onClick={handleExportData} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
            
            <div className="grid gap-2">
              <Label>Import Data</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Import previously exported financial data
              </p>
              <Button onClick={handleImportData} variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Configure payment methods for transactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                <span>Credit Card</span>
              </div>
              <Button variant="ghost" size="sm">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                <span>Bank Account</span>
              </div>
              <Button variant="ghost" size="sm">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Button variant="outline" className="w-full">
              Add Payment Method
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinanceSettings;
