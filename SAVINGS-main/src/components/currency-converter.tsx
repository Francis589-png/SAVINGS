"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownUp, Clock3, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CURRENCIES = [
  ["USD", "US Dollar", "$"], ["EUR", "Euro", "€"], ["GBP", "British Pound", "£"],
  ["XOF", "West African CFA Franc", "Fr"], ["SLL", "Sierra Leonean Leone", "Le"],
  ["GHS", "Ghanaian Cedi", "₵"], ["NGN", "Nigerian Naira", "₦"], ["GMD", "Gambian Dalasi", "D"],
  ["LRD", "Liberian Dollar", "$"], ["KES", "Kenyan Shilling", "KSh"], ["ZAR", "South African Rand", "R"],
  ["CAD", "Canadian Dollar", "$"], ["AUD", "Australian Dollar", "$"], ["JPY", "Japanese Yen", "¥"],
  ["CNY", "Chinese Yuan", "¥"], ["INR", "Indian Rupee", "₹"], ["AED", "UAE Dirham", "د.إ"],
] as const;

type Currency = typeof CURRENCIES[number][0];

export function CurrencyConverter() {
  const [amount, setAmount] = useState("1");
  const [from, setFrom] = useState<Currency>("USD");
  const [to, setTo] = useState<Currency>("XOF");
  const [rate, setRate] = useState<number | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRate = async () => {
    if (from === to) { setRate(1); setDate(new Date().toISOString()); setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const response = await fetch(`https://api.frankfurter.dev/v2/rate/${from}/${to}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Exchange rate unavailable");
      const data: { rate: number; date: string } = await response.json();
      setRate(data.rate); setDate(data.date);
    } catch {
      setRate(null); setDate(null); setError("Live rate unavailable. Please try again.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRate(); }, [from, to]);

  const converted = useMemo(() => {
    const value = Number(amount);
    return Number.isFinite(value) && value >= 0 && rate !== null ? value * rate : null;
  }, [amount, rate]);

  const swap = () => { setFrom(to); setTo(from); };
  const symbol = (code: Currency) => CURRENCIES.find(c => c[0] === code)?.[2] ?? code;
  const name = (code: Currency) => CURRENCIES.find(c => c[0] === code)?.[1] ?? code;

  return (
    <Card className="overflow-hidden rounded-[28px] border-primary/10 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl"><span className="rounded-xl bg-primary/10 p-2 text-primary">₵</span>Live Currency Converter</CardTitle>
            <CardDescription className="mt-1">Convert using the latest available market reference rate.</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchRate} disabled={loading} className="rounded-xl" aria-label="Refresh exchange rate">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
          <div className="space-y-2"><label className="text-xs font-semibold text-muted-foreground">Amount</label><Input value={amount} onChange={e => setAmount(e.target.value)} inputMode="decimal" type="number" min="0" step="any" className="h-12 rounded-xl text-lg" /></div>
          <Button variant="outline" size="icon" onClick={swap} className="h-12 w-full rounded-xl sm:w-12" aria-label="Swap currencies"><ArrowDownUp className="h-4 w-4" /></Button>
          <div className="space-y-2"><label className="text-xs font-semibold text-muted-foreground">From</label><Select value={from} onValueChange={v => setFrom(v as Currency)}><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{CURRENCIES.map(([code, label]) => <SelectItem key={code} value={code}>{code} · {label}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <div className="space-y-2"><label className="text-xs font-semibold text-muted-foreground">To</label><Select value={to} onValueChange={v => setTo(v as Currency)}><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{CURRENCIES.map(([code, label]) => <SelectItem key={code} value={code}>{code} · {label}</SelectItem>)}</SelectContent></Select></div>
        <div className="rounded-2xl bg-primary/[0.07] p-5">
          {loading ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Fetching live rate…</div> : error ? <p className="text-sm text-destructive">{error}</p> : <><p className="text-xs font-medium text-muted-foreground">Converted amount</p><p className="mt-1 break-all text-3xl font-bold tracking-tight text-primary">{symbol(to)} {converted?.toLocaleString(undefined, { maximumFractionDigits: 4 }) ?? "—"} <span className="text-base font-semibold">{to}</span></p><p className="mt-2 text-xs text-muted-foreground">1 {from} = {rate?.toLocaleString(undefined, { maximumFractionDigits: 6 })} {to}</p></>}
        </div>
        {date && <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Clock3 className="h-3.5 w-3.5" /> Rate date: {date}</p>}
        <p className="text-[11px] leading-5 text-muted-foreground">Rates are reference rates and may differ from the rate offered by your bank, exchange bureau, or payment provider.</p>
      </CardContent>
    </Card>
  );
}
