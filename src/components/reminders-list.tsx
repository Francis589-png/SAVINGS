
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Trash2, ListTodo } from "lucide-react";
import type { Reminder } from "@/types";
import { cn } from "@/lib/utils";
import { RemindersForm } from "./reminders-form";

type RemindersListProps = {
  reminders: Reminder[];
  isLoading: boolean;
  addReminder: (text: string) => void;
  toggleReminder: (id: string, completed: boolean) => void;
  deleteReminder: (id: string) => void;
};

export function RemindersList({
  reminders,
  isLoading,
  addReminder,
  toggleReminder,
  deleteReminder
}: RemindersListProps) {

  const renderSkeleton = () => (
    <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 flex-grow" />
                <Skeleton className="h-8 w-8" />
            </div>
        ))}
    </div>
  );

  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <CardTitle className="text-xl font-headline">Reminders</CardTitle>
        <CardDescription>Your to-do list for financial goals.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        <div className="mb-4">
            <RemindersForm addReminder={addReminder} disabled={isLoading} />
        </div>
        <ScrollArea className="flex-grow h-[200px] pr-4">
            {isLoading ? renderSkeleton() :
              reminders.length > 0 ? (
                <div className="space-y-3">
                {reminders.map((reminder) => (
                  <div key={reminder.id} className="flex items-center gap-3 group">
                    <Checkbox
                      id={`reminder-${reminder.id}`}
                      checked={reminder.completed}
                      onCheckedChange={() => toggleReminder(reminder.id, reminder.completed)}
                      aria-label="Mark reminder as complete"
                    />
                    <label
                      htmlFor={`reminder-${reminder.id}`}
                      className={cn(
                        "flex-grow text-sm cursor-pointer",
                        reminder.completed && "line-through text-muted-foreground"
                      )}
                    >
                      {reminder.text}
                    </label>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteReminder(reminder.id)}
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Delete reminder"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground h-full flex flex-col justify-center items-center">
                    <ListTodo className="h-8 w-8 mb-2" />
                    <span>No reminders yet. Add one above!</span>
                </div>
              )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
