export type Saving = {
  id: string;
  amount: number;
  currency: 'USD' | 'SLL';
  date: string; // ISO string
  usdAmount: number;
};

export type Currency = 'USD' | 'SLL';

export type SavingEntry = {
  amount: number;
  currency: Currency;
  usdAmount: number;
  entryDate: string; // ISO string
};
