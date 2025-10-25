import { CURRENCIES } from "@/lib/currency";

export type Saving = {
  id: string;
  amount: number;
  currency: Currency;
  date: string; // ISO string
  usdAmount: number;
  category: string;
};

export type Currency = typeof CURRENCIES[number];

export type SavingEntry = {
  amount: number;
  currency: Currency;
  usdAmount: number;
  entryDate: string; // ISO string
  category: string;
};

export type Note = {
    content: string;
    updatedAt: string; // ISO string
    signature?: string; // Data URL of the signature image
};