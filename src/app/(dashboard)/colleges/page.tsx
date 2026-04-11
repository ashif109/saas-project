"use client"

import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Filter, 
  School, 
  MoreHorizontal, 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { TableComponent } from '@/components/superadmin/TableComponent';
import RegisterCollegeModal from '@/components/superadmin/RegisterCollegeModal';
import { useRouter } from 'next/navigation';
import { useCollegeStore } from '@/store/useCollegeStore';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';

const COLLEGES_DATA: any[] = [];

import { differenceInDays, parseISO, format } from 'date-fns';

const getSubscriptionStatus = (college: any) => {
  if (!college.subscription || typeof college.subscription !== 'object') {
    return { label: 'Active', color: 'bg-green-100 text-green-700', days: 365, paymentStatus: 'Paid' };
  }
  
  const expiryDate = college.subscription.expiryDate;
  if (!expiryDate) {
    return { label: 'Active', color: 'bg-green-100 text-green-700', days: 365, paymentStatus: 'Paid' };
  }

  const daysLeft = differenceInDays(parseISO(expiryDate), new Date());
  
  let label = college.subscription.status;
  let color = 'bg-green-100 text-green-700';

  if (label === 'Cancelled') {
    color = 'bg-slate-100 text-slate-700';
  } else if (daysLeft < 0) {
    label = 'Expired';
    color = 'bg-red-100 text-red-700';
  } else if (daysLeft <= 7) {
    label = 'Expiring Soon';
    color = 'bg-yellow-100 text-yellow-700';
  }

  return { 
    label, 
    color, 
    days: daysLeft,
    paymentStatus: college.subscription.paymentStatus || 'Paid'
  };
};

const getPaymentBadgeColor = (status: string) => {
  switch (status) {
    case 'Paid': return 'bg-green-100 text-green-700';
    case 'Pending': return 'bg-yellow-100 text-yellow-700';
    case 'Failed': return 'bg-red-100 text-red-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

export default function CollegesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { colleges, loading, fetchColleges, updateCollegeStatus, deleteCollege } = useCollegeStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Disabled'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 5;

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this college? This action cannot be undone.')) {
      try {
        await deleteCollege(id);
        toast({
          title: "College Deleted",
          description: "The institutional tenant has been removed successfully.",
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Delete Failed",
          description: error.message || "An error occurred while deleting the college.",
        });
      }
    }
  };

  const handleStatusUpdate = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Disabled' : 'Active';
    try {
      await updateCollegeStatus(id, newStatus);
      toast({
        title: `College ${newStatus}`,
        description: `The institutional status has been updated to ${newStatus}.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "An error occurred while updating status.",
      });
    }
  };

  React.useEffect(() => {
    fetchColleges();
  }, []);

  const filteredData = useMemo(() => {
    return colleges.filter(college => {
      const matchesSearch = college.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           college._id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || college.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, colleges]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const columns = [
    { 
      header: 'College Name', 
      accessor: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary overflow-hidden border">
            {item.logoUrl ? (
              <img src={item.logoUrl} alt={item.name} className="h-full w-full object-contain p-1" />
            ) : (
              <School className="h-5 w-5" />
            )}
          </div>
          <div>
            <p className="font-bold text-foreground capitalize leading-tight">{item.name}</p>
            <p className="text-[10px] text-muted-foreground font-medium">ID: {item._id}</p>
          </div>
        </div>
      )
    },
    { header: 'Students', accessor: 'students' },
    { 
      header: 'Sub. Plan', 
      accessor: (item: any) => (
        <Badge variant="outline" className="bg-primary/5 text-primary border-none font-bold uppercase text-[10px]">
          {typeof item.subscription === 'object' ? item.subscription?.plan : 'Basic'}
        </Badge>
      )
    },
    { 
      header: 'Sub. Status', 
      accessor: (item: any) => {
        const status = getSubscriptionStatus(item);
        return (
          <Badge variant="secondary" className={`${status.color} border-none font-bold text-[10px]`}>
            {status.label}
          </Badge>
        );
      }
    },
    { 
      header: 'Days Left', 
      accessor: (item: any) => {
        const status = getSubscriptionStatus(item);
        return (
          <span className={`text-sm font-bold ${status.days <= 7 ? 'text-destructive' : 'text-slate-600'}`}>
            {status.days < 0 ? '0' : status.days} Days
          </span>
        );
      }
    },
    { 
      header: 'Payment', 
      accessor: (item: any) => {
        const status = (typeof item.subscription === 'object' ? item.subscription?.paymentStatus : null) || 'Paid';
        return (
          <Badge variant="secondary" className={`${getPaymentBadgeColor(status)} border-none font-bold text-[10px]`}>
            {status}
          </Badge>
        );
      }
    },
    { 
      header: 'Status', 
      accessor: (item: any) => (
        <Badge variant={item.status === 'Active' ? 'default' : 'secondary'} className={
          item.status === 'Active' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-none' : 'bg-red-100 text-red-700 hover:bg-red-100 border-none'
        }>
          {item.status}
        </Badge>
      )
    },
    {
      header: '',
      className: 'text-right',
      accessor: (item: any) => (
        <div className="flex justify-end items-center gap-2">
          <Button variant="ghost" size="icon" onClick={(e) => {
            e.stopPropagation();
            router.push(`/colleges/${item._id}`);
          }}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit Details</DropdownMenuItem>
              <DropdownMenuItem 
                className={item.status === 'Active' ? 'text-destructive' : 'text-primary'}
                onClick={() => handleStatusUpdate(item._id, item.status)}
              >
                {item.status === 'Active' ? 'Disable College' : 'Enable College'}
              </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    try {
                      await api.post('/api/colleges/resend-credentials', {
                        adminEmail: item.adminEmail,
                        collegeCode: item.code
                      });
                      toast({ title: 'Email Sent', description: 'Credentials email has been resent.' });
                    } catch (e: any) {
                      toast({ variant: 'destructive', title: 'Failed', description: e.message || 'Unable to resend email.' });
                    }
                  }}
                >
                  Resend Credentials Email
                </DropdownMenuItem>
              <DropdownMenuItem>View Logs</DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive focus:bg-destructive/5"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item._id);
                }}
              >
                Delete College
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground">Colleges</h1>
            <p className="text-sm md:text-base text-muted-foreground font-medium">Manage and monitor institutional tenants</p>
          </div>
          <Button 
            className="pulse-hover bg-primary shadow-lg font-bold h-11 px-6 rounded-xl w-full md:w-auto"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" /> Register New College
          </Button>
        </div>

        <RegisterCollegeModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => fetchColleges()}
        />

        {loading && colleges.length === 0 ? (
          <div className="flex h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : colleges.length === 0 ? (
          <Card className="border-none shadow-sm rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center">
              <School className="h-10 w-10 text-primary/40" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">No colleges added yet</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                Start by registering your first institutional tenant to the Pulse platform.
              </p>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="rounded-xl font-bold h-11 px-6">
              <Plus className="h-5 w-5 mr-2" /> Register New College
            </Button>
          </Card>
        ) : (
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-4 border-b bg-slate-50/50">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
              <div className="relative w-full lg:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name or ID..." 
                  className="pl-11 h-11 bg-white border-none shadow-sm rounded-xl text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => fetchColleges()}
                  disabled={loading}
                  className="h-9 px-4 rounded-lg font-bold"
                >
                  <Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </Button>
                <Button 
                  variant={statusFilter === 'All' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setStatusFilter('All')}
                  className="h-9 px-4 rounded-lg font-bold"
                >
                  All Status
                </Button>
                <Button 
                  variant={statusFilter === 'Active' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setStatusFilter('Active')}
                  className="h-9 px-4 rounded-lg font-bold"
                >
                  Active
                </Button>
                <Button 
                  variant={statusFilter === 'Disabled' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setStatusFilter('Disabled')}
                  className="h-9 px-4 rounded-lg font-bold"
                >
                  Disabled
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <TableComponent 
              data={paginatedData} 
              columns={columns} 
              onRowClick={(item) => router.push(`/colleges/${item._id}`)}
              className="border-none rounded-none shadow-none"
            />
          </CardContent>
          <div className="p-4 border-t bg-slate-50/30 flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Showing {Math.min(itemsPerPage, filteredData.length)} of {filteredData.length} colleges
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="h-9 w-9 p-0 rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="h-9 w-9 p-0 rounded-lg"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
