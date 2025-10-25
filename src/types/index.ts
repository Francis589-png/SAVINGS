
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

export type Reminder = {
    id: string;
    text: string;
    completed: boolean;
    createdAt: string; // ISO string
};

export type ReminderEntry = {
    text: string;
    completed: boolean;
    createdAt: string; // ISO string
};
