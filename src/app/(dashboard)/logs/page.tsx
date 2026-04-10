"use client"

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TableComponent } from '@/components/superadmin/TableComponent';
import { Input } from '@/components/ui/input';
import { Search, Download, Trash2, Shield, User, Filter, AlertTriangle, Info, AlertCircle, RefreshCcw, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [securityOnly, setSecurityOnly] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { toast } = useToast();

  const fetchLogs = useCallback(async (isPolling = false) => {
    if (!isPolling) setLoading(true);
    else setRefreshing(true);
    
    try {
      const params: any = {
        pageNumber: page,
        keyword: searchTerm,
        securityOnly: securityOnly,
      };

      if (dateRange?.from) params.startDate = dateRange.from.toISOString();
      if (dateRange?.to) params.endDate = dateRange.to.toISOString();

      const response = await api.get('/api/logs', { params });
      
      // Ensure each log has an 'id' for TableComponent
      const processedLogs = response.data.logs.map((log: any) => ({
        ...log,
        id: log._id
      }));

      setLogs(processedLogs);
      setTotalPages(response.data.pages);
      setTotalLogs(response.data.total);
    } catch (err: any) {
      console.error('Failed to fetch logs:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load audit logs. Please try again.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, searchTerm, securityOnly, dateRange, toast]);

  // Initial fetch and polling
  useEffect(() => {
    fetchLogs();
    const interval = setInterval(() => fetchLogs(true), 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const handleClearLogs = async () => {
    try {
      await api.delete('/api/logs?days=0');
      toast({
        title: "Success",
        description: "All audit logs have been cleared.",
      });
      fetchLogs();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clear logs.",
      });
    }
  };

  const handleExport = async () => {
    try {
      const params: any = {
        export: 'true',
        keyword: searchTerm,
        securityOnly: securityOnly,
      };
      if (dateRange?.from) params.startDate = dateRange.from.toISOString();
      if (dateRange?.to) params.endDate = dateRange.to.toISOString();

      const response = await api.get('/api/logs', { params });
      const exportLogs = response.data.logs;

      if (exportLogs.length === 0) {
        toast({ title: "No data", description: "There are no logs to export with current filters." });
        return;
      }

      // Generate CSV
      const headers = ['Timestamp', 'User Name', 'User Email', 'Action', 'Module', 'Severity', 'Details', 'IP Address'];
      const csvRows = [
        headers.join(','),
        ...exportLogs.map((log: any) => [
          `"${format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}"`,
          `"${log.userName || 'System'}"`,
          `"${log.userEmail || 'N/A'}"`,
          `"${log.action}"`,
          `"${log.module}"`,
          `"${log.severity}"`,
          `"${log.details.replace(/"/g, '""')}"`,
          `"${log.ipAddress || 'N/A'}"`
        ].join(','))
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `audit-logs-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ title: "Export Started", description: "Your logs are being downloaded." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Export Failed", description: "Could not generate export file." });
    }
  };

  const columns = [
    { 
      header: 'Timestamp', 
      accessor: (item: any) => (
        <span className="font-mono text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
          {format(new Date(item.createdAt), 'MMM dd, HH:mm:ss')}
        </span>
      ),
      className: 'w-[140px]'
    },
    { 
      header: 'User', 
      accessor: (item: any) => (
        <div className="flex flex-col max-w-[150px]">
          <span className="text-sm font-semibold truncate">{item.userName || 'System'}</span>
          <span className="text-[10px] text-muted-foreground truncate">{item.userEmail || 'N/A'}</span>
        </div>
      )
    },
    { 
      header: 'Action', 
      accessor: (item: any) => (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-foreground">{item.action}</span>
          <span className="text-[10px] text-muted-foreground line-clamp-1">{item.details}</span>
        </div>
      )
    },
    { 
      header: 'Module', 
      accessor: (item: any) => (
        <Badge variant="outline" className="font-normal text-[10px] px-2 py-0 bg-secondary/30">
          {item.module}
        </Badge>
      ) 
    },
    { 
      header: 'Severity', 
      accessor: (item: any) => {
        const severity = item.severity || 'Info';
        return (
          <div className="flex items-center gap-1.5">
            {severity === 'Critical' && <AlertCircle className="h-3 w-3 text-destructive" />}
            {severity === 'Warning' && <AlertTriangle className="h-3 w-3 text-amber-500" />}
            {severity === 'Info' && <Info className="h-3 w-3 text-blue-500" />}
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-tight",
              severity === 'Critical' ? 'text-destructive' : 
              severity === 'Warning' ? 'text-amber-600' : 'text-blue-600'
            )}>
              {severity}
            </span>
          </div>
        );
      }
    },
    { 
      header: 'IP Address', 
      accessor: (item: any) => (
        <span className="font-mono text-[10px] text-muted-foreground">{item.ipAddress || '127.0.0.1'}</span>
      ),
      className: 'hidden md:table-cell'
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">Audit Logs</h1>
            <p className="text-muted-foreground">Complete transparency of all system and administrative activities</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4 mr-2" /> Clear Logs
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently delete all audit logs from the database. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearLogs} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Clear Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="pb-4 border-b bg-slate-50/30">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
              <div className="flex flex-1 gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search logs..." 
                    className="pl-10 h-10 bg-white border-slate-200"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-10 w-10 border bg-white", refreshing && "animate-spin")}
                  onClick={() => fetchLogs()}
                  disabled={loading}
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "h-10 justify-start text-left font-normal bg-white",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Filter by Date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={(range) => {
                        setDateRange(range);
                        setPage(1);
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>

                <Button 
                  variant={securityOnly ? "default" : "outline"} 
                  size="sm" 
                  className="h-10 bg-white text-foreground hover:bg-slate-50"
                  onClick={() => {
                    setSecurityOnly(!securityOnly);
                    setPage(1);
                  }}
                >
                  <Shield className={cn("h-4 w-4 mr-2", securityOnly ? "text-white" : "text-amber-500")} />
                  Security Only
                </Button>

                {(searchTerm || securityOnly || dateRange) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-10 text-muted-foreground underline underline-offset-4"
                    onClick={() => {
                      setSearchTerm('');
                      setSecurityOnly(false);
                      setDateRange(undefined);
                      setPage(1);
                    }}
                  >
                    Reset Filters
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <RefreshCcw className="h-10 w-10 text-primary animate-spin" />
                <p className="text-muted-foreground font-medium">Loading activity logs...</p>
              </div>
            ) : logs.length > 0 ? (
              <>
                <TableComponent 
                  data={logs} 
                  columns={columns} 
                  className="border-none rounded-none shadow-none"
                />
                <div className="p-4 border-t flex items-center justify-between bg-slate-50/30">
                  <div className="text-xs text-muted-foreground">
                    Showing <span className="font-bold text-foreground">{logs.length}</span> of <span className="font-bold text-foreground">{totalLogs}</span> entries
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-xs font-bold px-2">
                      Page {page} of {totalPages}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center">
                  <Shield className="h-10 w-10 text-slate-300" />
                </div>
                <div className="max-w-xs mx-auto space-y-2">
                  <p className="text-xl font-bold text-slate-500">No logs found</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Try adjusting your filters or search terms to find what you're looking for.
                  </p>
                  <Button 
                    variant="link" 
                    onClick={() => {
                      setSearchTerm('');
                      setSecurityOnly(false);
                      setDateRange(undefined);
                      setPage(1);
                    }}
                  >
                    Clear all filters
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

