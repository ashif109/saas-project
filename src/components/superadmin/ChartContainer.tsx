import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChartContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

export function ChartContainer({
  title,
  description,
  children,
  className,
  footer,
}: ChartContainerProps) {
  return (
    <Card className={cn("border-none shadow-sm", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="w-full">
          {children}
        </div>
        {footer && <div className="mt-4 pt-4 border-t">{footer}</div>}
      </CardContent>
    </Card>
  );
}
