
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, PieChart as PieChartIcon, Settings } from "lucide-react";
import { visualizeSavingCategories } from "@/ai/flows/visualize-saving-categories";
import type { Saving } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LabelList } from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Separator } from "./ui/separator";

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
  const [is3D, setIs3D] = useState(false);
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>({});

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

    // Initialize colors if they don't exist
    const newCategoryColors = { ...categoryColors };
    chartData.forEach((d, i) => {
      if (!newCategoryColors[d.name]) {
        newCategoryColors[d.name] = CHART_COLORS[i % CHART_COLORS.length];
      }
    });
    // This is a bit of a hack to set state during render, but it's contained.
    // A better solution would use a separate effect, but this is simpler for now.
    if (Object.keys(newCategoryColors).length !== Object.keys(categoryColors).length) {
      setTimeout(() => setCategoryColors(newCategoryColors), 0);
    }

    const chartConfig: ChartConfig = Object.fromEntries(
        chartData.map((d) => [
            d.name, { label: d.name, color: newCategoryColors[d.name] }
        ])
    );
    
    return { chartData, chartConfig };
  }, [savings, categoryColors]);

  useEffect(() => {
    if (chartData.length > 0 && isLoaded) {
      const getVisualization = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const result = await visualizeSavingCategories({ savingsData: chartData.map(d => ({ category: d.name, amount: d.value })) });
          setVisualizationType(result?.visualization || "pie chart");
          if (result.visualization.toLowerCase().includes('3d')) {
            setIs3D(true);
          }
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
      setIs3D(false);
    }
  }, [chartData, isLoaded]);

  const handleColorChange = (category: string, color: string) => {
    setCategoryColors(prevColors => ({
      ...prevColors,
      [category]: color,
    }));
  };
  
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
          className={cn(
            "min-h-[250px] w-full transition-transform duration-500",
            is3D && "[&_.recharts-surface]:[transform:rotateX(25deg)] [&_.recharts-pie]:[filter:drop-shadow(0_10px_5px_rgba(0,0,0,0.2))]"
            )}
        >
          <PieChart>
            <ChartTooltip
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
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={chartConfig[entry.name]?.color} />
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
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle className="text-xl font-headline">Category Breakdown</CardTitle>
          <CardDescription>
            {isLoading
              ? "Analyzing your savings categories..."
              : visualizationType ||
                "A breakdown of your savings will appear here."}
          </CardDescription>
        </div>
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Customize Chart</SheetTitle>
                </SheetHeader>
                <div className="py-4 space-y-4">
                    <Separator />
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm">Category Colors</h4>
                        {Object.entries(categoryColors).map(([category, color]) => (
                            <div key={category} className="flex items-center justify-between">
                                <span className="text-sm">{category}</span>
                                <div className="flex gap-1.5">
                                    {CHART_COLORS.map(c => (
                                        <Button
                                            key={c}
                                            size="icon"
                                            variant="outline"
                                            className={cn("h-6 w-6 rounded-full p-0 border-2", color === c && "border-primary")}
                                            style={{ backgroundColor: c }}
                                            onClick={() => handleColorChange(category, c)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
      </CardHeader>
      <CardContent className="flex items-center justify-center pt-0">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
