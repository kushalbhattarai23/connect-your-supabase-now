
import { useState, useEffect } from 'react';
import { currencies, defaultCurrency } from '@/config/currencies';
import { Currency } from '@/types';

export const useCurrency = () => {
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(defaultCurrency);

  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferredCurrency');
    if (savedCurrency) {
      const currency = currencies.find(c => c.code === savedCurrency);
      if (currency) {
        setCurrentCurrency(currency);
      }
    }
  }, []);

  const formatAmount = (amount: number) => {
    return `${currentCurrency.symbol} ${amount.toLocaleString()}`;
  };

  const updateCurrency = (currencyCode: string) => {
    const currency = currencies.find(c => c.code === currencyCode);
    if (currency) {
      setCurrentCurrency(currency);
      localStorage.setItem('preferredCurrency', currencyCode);
    }
  };

  return {
    currency: currentCurrency,
    formatAmount,
    updateCurrency
  };
};
