
import { Currency } from '@/types';

export const currencies: Currency[] = [
  { code: 'NPR', symbol: 'रु', name: 'Nepalese Rupees' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupees' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

export const defaultCurrency = currencies[0]; // NPR
