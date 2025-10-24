export type Saving = {
  id: string;
  amount: number;
  currency: 'SLL';
  date: string; // ISO string
  usdAmount: number;
  category: string;
};

export type Currency = 'SLL';

export type SavingEntry = {
  amount: number;
  currency: Currency;
  usdAmount: number;
  entryDate: string; // ISO string
  category: string;
};
