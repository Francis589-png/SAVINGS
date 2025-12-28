
import type { Currency } from '@/types';

export const CURRENCIES = ['SLL', 'USD', 'EUR', 'GBP', 'JPY'] as const;

// Using approximate, stable rates for demonstration purposes.
// In a real app, this would come from a live exchange rate API.
const EXCHANGE_RATES_TO_USD: Record<Currency, number> = {
  USD: 1,
  SLL: 1 / 21000,
  EUR: 1.08,
  GBP: 1.26,
  JPY: 1 / 157,
};

export const convertToUSD = (amount: number, currency: Currency): number => {
  return amount * (EXCHANGE_RATES_TO_USD[currency] || 0);
};

export const convertFromUSD = (amount: number, toCurrency: Currency): number => {
  const rate = EXCHANGE_RATES_TO_USD[toCurrency];
  if (rate && rate > 0) {
    return amount / rate;
  }
  return 0; // Or handle error appropriately
}

export const formatCurrency = (amount: number, currency: Currency) => {
  // SLL formatting in Intl is inconsistent, so we handle it manually for display
  if (currency === 'SLL') {
    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `Le ${formatter.format(amount)}`;
  }
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback for currencies that might not be supported by Intl.NumberFormat
    return `${currency} ${amount.toFixed(2)}`;
  }
};
