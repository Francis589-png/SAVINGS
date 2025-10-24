"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  currency: z.literal("SLL"),
});

type SavingsFormProps = {
  addSaving: (data: z.infer<typeof formSchema>) => void;
  disabled?: boolean;
};

export function SavingsForm({ addSaving, disabled }: SavingsFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "" as unknown as number,
      currency: "SLL",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    addSaving(values);
    form.reset({ amount: "" as unknown as number, currency: "SLL" });
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline">Add New Saving (SLL)</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount in Leones</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 50000" {...field} step="1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={disabled}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Saving
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
