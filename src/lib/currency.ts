import type { Currency } from '@/types';

export const SLL_TO_USD_RATE = 21000;

export const convertToUSD = (amount: number, currency: Currency): number => {
  if (currency === 'SLL') {
    return amount / SLL_TO_USD_RATE;
  }
  return amount;
};

export const convertFromUSD = (amount: number, currency: Currency): number => {
  if (currency === 'SLL') {
    return amount * SLL_TO_USD_RATE;
  }
  return amount;
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
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
