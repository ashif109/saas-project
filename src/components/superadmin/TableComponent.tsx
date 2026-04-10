import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface TableComponentProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  className?: string;
}

export function TableComponent<T extends { id: string | number }>({
  data,
  columns,
  onRowClick,
  className,
}: TableComponentProps<T>) {
  return (
    <div className={cn("rounded-2xl border bg-card shadow-sm overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b">
              {columns.map((column, idx) => (
                <TableHead key={idx} className={cn("font-bold py-5 px-6 text-xs uppercase tracking-wider text-muted-foreground", column.className)}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((item) => (
                <TableRow
                  key={item.id}
                  className={cn(
                    "transition-all hover:bg-slate-50/80 border-b last:border-0",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column, idx) => (
                    <TableCell key={idx} className={cn("py-5 px-6 text-sm font-medium", column.className)}>
                      {typeof column.accessor === 'function'
                        ? column.accessor(item)
                        : (item[column.accessor] as React.ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground font-medium">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
