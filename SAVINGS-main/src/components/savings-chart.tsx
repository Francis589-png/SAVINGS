"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, LineChart as LineChartIcon } from "lucide-react";

import { visualizeSavingHistory } from "@/ai/flows/visualize-saving-history";
import type { Saving } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type SavingsChartProps = {
  savings: Saving[];
  isLoaded: boolean;
};

const chartConfig = {
  amount: {
    label: "Savings (USD)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function SavingsChart({ savings, isLoaded }: SavingsChartProps) {
  const [visualizationType, setVisualizationType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chartData = useMemo(() => {
    const dailyTotals = savings.reduce<Record<string, number>>((acc, s) => {
      const dateKey = new Date(s.date).toLocaleDateString('en-CA'); // YYYY-MM-DD format
      const usdAmount = s.usdAmount;
      acc[dateKey] = (acc[dateKey] || 0) + usdAmount;
      return acc;
    }, {});

    return Object.entries(dailyTotals)
      .map(([date, amount]) => ({
        date,
        amount: parseFloat(amount.toFixed(2)),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(d => ({
        ...d,
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }));
  }, [savings]);

  useEffect(() => {
    if (savings.length > 1 && isLoaded) {
      const getVisualization = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const savingHistory = savings.map((s) => ({
            date: new Date(s.date).toISOString().split("T")[0],
            amount: s.usdAmount,
          }));

          const result = await visualizeSavingHistory({ savingsData: savingHistory });
          setVisualizationType(result?.visualization || "line chart");
        } catch (e) {
          console.error("Error fetching visualization:", e);
          setError("Could not generate visualization. Displaying default chart.");
          setVisualizationType("line chart"); // Fallback on error
        } finally {
          setIsLoading(false);
        }
      };

      getVisualization();
    } else {
        setVisualizationType(null);
    }
  }, [savings, isLoaded]);

  const renderContent = () => {
    if (!isLoaded || (isLoading && savings.length > 1)) {
      return <Skeleton className="h-[250px] w-full" />;
    }

    if (error) {
       return (
        <Alert variant="destructive" className="h-[250px]">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Visualization Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
       )
    }

    if (savings.length <= 1) {
      return (
        <div className="flex flex-col items-center justify-center h-[250px] text-center bg-muted/50 rounded-lg">
            <LineChartIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Add more savings to see your trend.</p>
        </div>
      );
    }

    if (visualizationType?.includes("line chart") && chartData.length > 0) {
      return (
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickFormatter={(value) => `$${value}`}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={80}
            />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent hideIndicator formatter={(value) => `$${value}`} />}
            />
            <Line
              dataKey="amount"
              type="monotone"
              stroke="var(--color-amount)"
              strokeWidth={3}
              dot={{
                r: 4,
                fill: 'var(--color-amount)',
                stroke: 'var(--background)'
              }}
            />
          </LineChart>
        </ChartContainer>
      );
    }
    
    return (
        <div className="flex items-center justify-center h-[250px]">
          <p className="text-muted-foreground">Could not determine chart type.</p>
        </div>
      );
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline">Savings Trend</CardTitle>
        <CardDescription>
            {isLoading ? 'Analyzing your savings trend...' : (visualizationType || "Your savings visualization will appear here.")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
