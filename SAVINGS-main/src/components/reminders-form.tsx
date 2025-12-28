
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  text: z.string().min(1, "Reminder can't be empty."),
});

type RemindersFormProps = {
  addReminder: (text: string) => void;
  disabled?: boolean;
};

export function RemindersForm({ addReminder, disabled }: RemindersFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    addReminder(values.text);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormControl>
                <Input placeholder="Add a new reminder..." {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="icon" disabled={disabled}>
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add Reminder</span>
        </Button>
      </form>
    </Form>
  );
}
