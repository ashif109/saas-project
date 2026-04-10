import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
  iconClassName?: string;
  iconBgClassName?: string;
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  description,
  trend,
  className,
  iconClassName,
  iconBgClassName,
}: StatsCardProps) {
  return (
    <Card className={cn("border-none shadow-sm overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
          </div>
          <div className={cn("p-3 rounded-xl", iconBgClassName || "bg-primary/10")}>
            <Icon className={cn("h-6 w-6", iconClassName || "text-primary")} />
          </div>
        </div>
        {(description || trend) && (
          <div className="mt-4 flex items-center gap-2">
            {trend && (
              <span className={cn(
                "text-xs font-bold px-1.5 py-0.5 rounded",
                trend.positive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}>
                {trend.positive ? '+' : ''}{trend.value}
              </span>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
