
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, PieChart as PieChartIcon } from "lucide-react";
import { visualizeSavingCategories } from "@/ai/flows/visualize-saving-categories";
import type { Saving } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LabelList } from "recharts";

type SavingsPieChartProps = {
  savings: Saving[];
  isLoaded: boolean;
};

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function SavingsPieChart({ savings, isLoaded }: SavingsPieChartProps) {
  const [visualizationType, setVisualizationType] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { chartData, chartConfig } = useMemo(() => {
    const categoryTotals = savings
      .filter(s => s.category !== 'Balance Adjustment') // Exclude balance adjustments
      .reduce<Record<string, number>>((acc, s) => {
        const category = s.category || "General";
        acc[category] = (acc[category] || 0) + s.usdAmount;
        return acc;
      }, {});

    const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    })).sort((a, b) => b.value - a.value);

    const chartConfig: ChartConfig = Object.fromEntries(
        chartData.map((d, i) => [
            d.name, { label: d.name, color: CHART_COLORS[i % CHART_COLORS.length] }
        ])
    );
    
    return { chartData, chartConfig };
  }, [savings]);

  useEffect(() => {
    if (chartData.length > 0 && isLoaded) {
      const getVisualization = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const result = await visualizeSavingCategories({ savingsData: chartData.map(d => ({ category: d.name, amount: d.value })) });
          setVisualizationType(result?.visualization || "pie chart");
        } catch (e) {
          console.error("Error fetching visualization:", e);
          setError(
            "Could not generate visualization. Displaying default chart."
          );
          setVisualizationType("pie chart"); // Fallback on error
        } finally {
          setIsLoading(false);
        }
      };

      getVisualization();
    } else {
      setVisualizationType(null);
    }
  }, [chartData, isLoaded]);

  const renderContent = () => {
    if (!isLoaded || (isLoading && chartData.length > 0)) {
      return <Skeleton className="h-[250px] w-full" />;
    }

    if (error) {
      return (
        <Alert variant="destructive" className="h-[250px]">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Visualization Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (chartData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[250px] text-center bg-muted/50 rounded-lg">
          <PieChartIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Categorize your savings to see a breakdown.
          </p>
        </div>
      );
    }

    if (visualizationType?.includes("pie chart")) {
      return (
        <ChartContainer
          config={chartConfig}
          className="min-h-[250px] w-full"
        >
          <PieChart>
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
                <LabelList
                    dataKey="name"
                    className="fill-background dark:fill-foreground"
                    stroke="none"
                    fontSize={12}
                    formatter={(value: string) => chartConfig[value]?.label}
                />
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      );
    }

    return (
      <div className="flex items-center justify-center h-[250px]">
        <p className="text-muted-foreground">
          Could not determine chart type.
        </p>
      </div>
    );
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline">Category Breakdown</CardTitle>
        <CardDescription>
          {isLoading
            ? "Analyzing your savings categories..."
            : visualizationType ||
              "A breakdown of your savings will appear here."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
