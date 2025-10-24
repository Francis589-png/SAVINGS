export type Saving = {
  id: string;
  amount: number;
  currency: 'USD' | 'SLL';
  date: string; // ISO string
};

export type Currency = 'USD' | 'SLL';
