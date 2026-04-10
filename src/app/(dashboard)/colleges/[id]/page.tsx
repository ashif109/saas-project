"use client"

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Users, 
  GraduationCap, 
  Activity, 
  Calendar, 
  ShieldCheck,
  MoreVertical,
  Settings,
  AlertTriangle,
  DollarSign,
  BookOpen,
  MessageSquare,
  Trophy,
  History,
  TrendingUp,
  CreditCard,
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  Zap,
  ArrowUpCircle,
  Loader2
} from 'lucide-react';
import { StatsCard } from '@/components/superadmin/StatsCard';
import { ChartContainer } from '@/components/superadmin/ChartContainer';
import { TableComponent } from '@/components/superadmin/TableComponent';
import { differenceInDays, parseISO, format, addDays, addMonths } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useCollegeStore } from '@/store/useCollegeStore';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const DEPT_DATA = [
  { name: 'Computer Science', value: 450, growth: '+12%' },
  { name: 'Physics', value: 300, growth: '+5%' },
  { name: 'Mathematics', value: 200, growth: '+8%' },
  { name: 'History', value: 150, growth: '-2%' },
  { name: 'Economics', value: 140, growth: '+15%' },
];

const ATTENDANCE_DATA = [
  { month: 'Jan', rate: 92, platformAvg: 88 },
  { month: 'Feb', rate: 88, platformAvg: 87 },
  { month: 'Mar', rate: 94, platformAvg: 89 },
  { month: 'Apr', rate: 91, platformAvg: 90 },
  { month: 'May', rate: 95, platformAvg: 91 },
  { month: 'Jun', rate: 93, platformAvg: 90 },
];

const REVENUE_HISTORY = [
  { month: 'Jan', amount: 4500 },
  { month: 'Feb', amount: 4500 },
  { month: 'Mar', amount: 5200 },
  { month: 'Apr', amount: 5200 },
  { month: 'May', amount: 5200 },
  { month: 'Jun', amount: 6000 },
];

const COLORS = ['#29995B', '#C4FC6C', '#819571', '#14532D', '#22C55E'];

export default function CollegeDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { toast } = useToast();
  const { 
    colleges, 
    loading,
    fetchColleges,
    updateCollegeStatus, 
    extendSubscription, 
    changePlan, 
    cancelSubscription, 
    reactivateSubscription, 
    updatePaymentStatus 
  } = useCollegeStore();
  const { impersonate } = useAuthStore();
  
  // Find the college in the store
  const storeCollege = colleges.find(c => c._id === id || c.id === id);

  React.useEffect(() => {
    if (colleges.length === 0) {
      fetchColleges();
    }
  }, []);

  // State for modals
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isImpersonateLoading, setIsImpersonateLoading] = useState(false);
  
  // Form states
  const [extendDays, setExtendDays] = useState("30");
  const [newPlan, setNewPlan] = useState(storeCollege?.subscription.plan || "Basic");
  const [cancelDisableAccess, setCancelDisableAccess] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");

  if (loading && !storeCollege) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!storeCollege) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <h2 className="text-2xl font-bold">College Not Found</h2>
          <p className="text-muted-foreground">The college with ID {id} does not exist in our records.</p>
          <Button onClick={() => router.push('/colleges')}>Back to Colleges</Button>
        </div>
      </DashboardLayout>
    );
  }

  // Use storeCollege data
  const college = {
    _id: storeCollege?._id,
    id: storeCollege?._id || id,
    name: storeCollege?.name || '',
    location: storeCollege ? `${storeCollege.city}, ${storeCollege.country}` : '',
    students: storeCollege?.students || 0,
    faculty: storeCollege?.faculty || 0,
    subscription: storeCollege?.subscription.plan || 'Basic',
    renewalDate: storeCollege?.subscription.expiryDate || new Date().toISOString(),
    status: storeCollege?.status || 'Active',
    mrr: '$0',
    totalRevenue: '$0',
    activeDoubts: 0,
    resolvedDoubts: 0,
    upcomingExams: 0,
    lastAudit: 'N/A',
    features: storeCollege?.features || { doubtSystem: true, attendance: true, analytics: true },
    subscriptionStart: storeCollege?.subscription.startDate || new Date().toISOString(),
    subscriptionEnd: storeCollege?.subscription.expiryDate || new Date().toISOString(),
    paymentStatus: storeCollege?.subscription.paymentStatus || 'Paid',
    history: storeCollege?.subscription.history || []
  };

  const daysLeft = differenceInDays(parseISO(college.subscriptionEnd), new Date());
  
  const getSubStatus = () => {
    if (storeCollege?.subscription.status === 'Cancelled') return { label: 'Cancelled', color: 'bg-slate-500' };
    if (daysLeft < 0) return { label: 'Expired', color: 'bg-red-500' };
    if (daysLeft <= 7) return { label: 'Expiring Soon', color: 'bg-yellow-500' };
    return { label: 'Active', color: 'bg-green-500' };
  };

  const subStatus = getSubStatus();
  const subscriptionStatus = subStatus.label;
  const subscriptionColor = subStatus.color;

  const isActive = college.status === 'Active';

  const handleImpersonate = async () => {
    setIsImpersonateLoading(true);
    try {
      // 1. Get the college admin
      const adminRes = await api.get(`/api/colleges/${college.id}/admin`);
      const admin = adminRes.data;

      // 2. Start impersonation
      const impersonateRes = await api.post(`/api/auth/impersonate/${admin._id}`);
      const { token, ...userData } = impersonateRes.data;

      impersonate({
        id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        avatar: userData.avatar,
        phone: userData.phone,
        collegeId: userData.college?._id
      }, token);

      toast({
        title: "Impersonation Started",
        description: `You are now logged in as ${userData.name}`,
      });

      router.push('/dashboard');
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Impersonation Failed",
        description: err.response?.data?.message || "Could not start impersonation session.",
      });
    } finally {
      setIsImpersonateLoading(false);
    }
  };

  const handleStatusChange = async (checked: boolean) => {
    if (storeCollege) {
      await updateCollegeStatus(storeCollege._id, checked ? 'Active' : 'Disabled');
      toast({
        title: "Success",
        description: `College ${checked ? 'enabled' : 'disabled'} successfully`,
      });
    }
  };

  const handleExtend = async () => {
    await extendSubscription(college.id, parseInt(extendDays), 0, adminMessage);
    setIsExtendModalOpen(false);
    setAdminMessage("");
    toast({
      title: "Subscription Extended",
      description: `The plan has been extended by ${extendDays} days.`,
    });
  };

  const handleChangePlan = async () => {
    await changePlan(college.id, newPlan, adminMessage);
    setIsPlanModalOpen(false);
    setAdminMessage("");
    toast({
      title: "Plan Changed",
      description: `The subscription plan has been updated to ${newPlan}.`,
    });
  };

  const handleCancel = async () => {
    await cancelSubscription(college.id, cancelDisableAccess, adminMessage);
    setIsCancelModalOpen(false);
    setAdminMessage("");
    toast({
      title: "Subscription Cancelled",
      description: "The college subscription has been cancelled.",
    });
  };

  const handleReactivate = async () => {
    await reactivateSubscription(college.id, "Manually reactivated by admin");
    toast({
      title: "Subscription Reactivated",
      description: "The college access has been restored.",
    });
  };

  const handleUpdatePayment = async (status: 'Paid' | 'Pending' | 'Failed') => {
    await updatePaymentStatus(college.id, status, "Payment status manually updated");
    setIsPaymentModalOpen(false);
    toast({
      title: "Payment Status Updated",
      description: `Payment status changed to ${status}.`,
    });
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'Paid': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-bold">Paid</Badge>;
      case 'Pending': return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none font-bold">Pending</Badge>;
      case 'Failed': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none font-bold">Failed</Badge>;
      default: return null;
    }
  };

  const logColumns = [
    { header: 'Action', accessor: (item: any) => <span className="capitalize font-medium">{item.action}</span> },
    { header: 'Details', accessor: 'message' },
    { header: 'Date', accessor: (item: any) => format(parseISO(item.date), 'MMM dd, yyyy HH:mm') },
  ];

  const logs = college.history.length > 0 ? college.history : [
    { action: 'system', message: 'Initial registration', date: college.subscriptionStart },
  ];

  const deptColumns = [
    { header: 'Department', accessor: 'name' },
    { header: 'Students', accessor: 'value' },
    { 
      header: 'Growth', 
      accessor: (item: any) => (
        <span className={item.growth.startsWith('+') ? 'text-green-600 font-bold' : 'text-destructive font-bold'}>
          {item.growth}
        </span>
      ) 
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumbs & Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button onClick={() => router.push('/colleges')} className="hover:text-primary transition-colors">Colleges</button>
            <span>/</span>
            <span className="text-foreground font-medium">{college.name}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-headline font-bold">{college.name}</h1>
                <Badge variant={isActive ? 'default' : 'secondary'} className={
                  isActive ? 'bg-green-100 text-green-700 hover:bg-green-100 border-none' : 'bg-red-100 text-red-700 hover:bg-red-100 border-none'
                }>
                  {college.status}
                </Badge>
              </div>
              <p className="text-muted-foreground">{college.location} • Tenant ID: <span className="font-mono text-xs">{college.id}</span></p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/settings')}>
                <Settings className="h-4 w-4 mr-2" /> Global Config
              </Button>
              <Button 
                className="pulse-hover shadow-lg" 
                onClick={handleImpersonate}
                disabled={isImpersonateLoading}
              >
                {isImpersonateLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                Impersonate Admin
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-secondary/50 p-1 rounded-xl h-11">
            <TabsTrigger value="overview" className="rounded-lg gap-2"><Activity className="h-4 w-4" /> Overview</TabsTrigger>
            <TabsTrigger value="academic" className="rounded-lg gap-2"><BookOpen className="h-4 w-4" /> Academic</TabsTrigger>
            <TabsTrigger value="financial" className="rounded-lg gap-2"><CreditCard className="h-4 w-4" /> Financial</TabsTrigger>
            <TabsTrigger value="logs" className="rounded-lg gap-2"><History className="h-4 w-4" /> Audit Logs</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg gap-2 text-destructive"><Settings className="h-4 w-4" /> Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard label="Total Students" value={college.students} icon={GraduationCap} trend={{ value: '4.2%', positive: true }} />
              <StatsCard label="Faculty Strength" value={college.faculty} icon={Users} iconBgClassName="bg-blue-50" iconClassName="text-blue-500" />
              <Card className="border-none shadow-sm overflow-hidden group">
                <div className={`h-1 w-full ${subscriptionColor}`} />
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subscription</p>
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">{college.subscription}</p>
                    <Badge className={`${subscriptionColor} text-white border-none text-[10px] h-4`}>
                      {subscriptionStatus}
                    </Badge>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Expires In</p>
                      <p className="text-sm font-bold">{daysLeft < 0 ? '0' : daysLeft} Days</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Expiry Date</p>
                      <p className="text-xs font-medium">{format(parseISO(college.subscriptionEnd), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <StatsCard label="Sys Health" value="99.9%" icon={ShieldCheck} iconBgClassName="bg-green-50" iconClassName="text-green-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ChartContainer title="Institutional Attendance" description="Compared against platform average" className="lg:col-span-2">
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ATTENDANCE_DATA}>
                      <defs>
                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} domain={[80, 100]} />
                      <Tooltip />
                      <Area type="monotone" dataKey="rate" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRate)" strokeWidth={3} name="This College" />
                      <Line type="monotone" dataKey="platformAvg" stroke="#94a3b8" strokeDasharray="5 5" name="Platform Avg" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ChartContainer>

              <ChartContainer title="Student Distribution" description="By Major Departments" className="lg:col-span-1">
                <div className="h-[280px] w-full flex flex-col justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={DEPT_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                        {DEPT_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {DEPT_DATA.map((dept, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-[10px] text-muted-foreground truncate font-bold uppercase">{dept.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartContainer>
            </div>
          </TabsContent>

          <TabsContent value="academic" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard label="Active Doubts" value={college.activeDoubts} icon={MessageSquare} />
              <StatsCard label="Doubts Resolved" value={college.resolvedDoubts} icon={ShieldCheck} iconBgClassName="bg-green-50" iconClassName="text-green-600" />
              <StatsCard label="Upcoming Exams" value={college.upcomingExams} icon={Trophy} iconBgClassName="bg-yellow-50" iconClassName="text-yellow-600" />
            </div>
            
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Departmental Breakdown</CardTitle>
                <CardDescription>Detailed student metrics and growth per department</CardDescription>
              </CardHeader>
              <CardContent>
                <TableComponent data={DEPT_DATA.map((d, i) => ({ ...d, id: i }))} columns={deptColumns} className="border-none" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatsCard label="Monthly Recurring Revenue" value={college.mrr} icon={DollarSign} />
              <StatsCard label="Total Lifetime Value" value={college.totalRevenue} icon={TrendingUp} iconBgClassName="bg-blue-50" iconClassName="text-blue-600" />
              <Card className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Payment Status</p>
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <DollarSign className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    {getPaymentBadge(college.paymentStatus)}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs font-bold"
                      onClick={() => setIsPaymentModalOpen(true)}
                    >
                      Update Status
                    </Button>
                  </div>
                  {college.paymentStatus === 'Paid' && storeCollege?.subscription.lastPaymentDate && (
                    <p className="text-[10px] text-muted-foreground mt-4 font-medium italic">
                      Last Payment: {format(parseISO(storeCollege.subscription.lastPaymentDate), 'MMM dd, yyyy')}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1 border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" /> Subscription Control
                  </CardTitle>
                  <CardDescription>Manage billing and plan lifecycle</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Current Plan</span>
                      <Badge variant="outline" className="font-bold uppercase text-[10px] bg-white">
                        {college.subscription}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <Badge className={`${subscriptionColor} text-white border-none font-bold text-[10px]`}>
                        {subscriptionStatus}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Days Remaining</span>
                      <span className={`text-sm font-bold ${daysLeft <= 7 ? 'text-destructive' : 'text-foreground'}`}>
                        {daysLeft < 0 ? '0' : daysLeft} Days
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="font-bold" onClick={() => setIsExtendModalOpen(true)}>
                      <Clock className="h-4 w-4 mr-2" /> Extend
                    </Button>
                    <Button variant="outline" size="sm" className="font-bold" onClick={() => setIsPlanModalOpen(true)}>
                      <ArrowUpCircle className="h-4 w-4 mr-2" /> Change Plan
                    </Button>
                    {subscriptionStatus === 'Cancelled' || subscriptionStatus === 'Expired' ? (
                      <Button variant="default" size="sm" className="col-span-2 font-bold bg-green-600 hover:bg-green-700" onClick={handleReactivate}>
                        <RefreshCcw className="h-4 w-4 mr-2" /> Reactivate Subscription
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="col-span-2 font-bold text-destructive hover:text-destructive" onClick={() => setIsCancelModalOpen(true)}>
                        <XCircle className="h-4 w-4 mr-2" /> Cancel Subscription
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <ChartContainer title="Revenue Growth" description="Monthly billing history" className="lg:col-span-2">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={REVENUE_HISTORY}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartContainer>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Subscription & Action History</CardTitle>
                  <CardDescription>Detailed log of all subscription and administrative changes</CardDescription>
                </div>
                <Button variant="outline" size="sm">Export CSV</Button>
              </CardHeader>
              <CardContent>
                <TableComponent data={logs.map((l, i) => ({ ...l, id: i }))} columns={logColumns} className="border-none" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Access & Feature Toggles</CardTitle>
                  <CardDescription>Control specific features for this college</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold">Tenant Access</Label>
                      <p className="text-xs text-muted-foreground">Completely enable/disable all institutional access</p>
                    </div>
                    <Switch checked={isActive} onCheckedChange={handleStatusChange} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold">GenAI Assistant</Label>
                      <p className="text-xs text-muted-foreground">Enable AI-powered doubt responses for faculty</p>
                    </div>
                    <Switch checked={college.features.doubtSystem} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold">Bulk Student Upload</Label>
                      <p className="text-xs text-muted-foreground">Allow CSV/Excel imports for students</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold">Analytics Tracking</Label>
                      <p className="text-xs text-muted-foreground">Enable detailed institutional performance tracking</p>
                    </div>
                    <Switch checked={college.features.analytics} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold">Attendance System</Label>
                      <p className="text-xs text-muted-foreground">Enable automated student and faculty attendance</p>
                    </div>
                    <Switch checked={college.features.attendance} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-destructive/5 border-destructive/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" /> Critical Actions
                  </CardTitle>
                  <CardDescription>High-impact, irreversible administrative operations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-destructive/20 rounded-lg bg-white">
                    <p className="text-sm font-bold">Reset Administrative Password</p>
                    <p className="text-xs text-muted-foreground mb-4">Force a password reset for the main college admin.</p>
                    <Button variant="outline" className="border-destructive text-destructive" size="sm">Reset Credentials</Button>
                  </div>
                  <div className="p-4 border border-destructive/20 rounded-lg bg-white">
                    <p className="text-sm font-bold">Purge Institutional Data</p>
                    <p className="text-xs text-muted-foreground mb-4">Wipe all records for this tenant. This cannot be undone.</p>
                    <Button variant="destructive" size="sm">Purge All Records</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <Dialog open={isExtendModalOpen} onOpenChange={setIsExtendModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Subscription</DialogTitle>
            <DialogDescription>Add extra time to {college.name}'s subscription.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Duration (Days)</Label>
              <Select value={extendDays} onValueChange={setExtendDays}>
                <SelectTrigger>
                  <SelectValue placeholder="Select days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                  <SelectItem value="180">180 Days</SelectItem>
                  <SelectItem value="365">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Internal Note</Label>
              <Textarea 
                placeholder="Reason for extension..." 
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExtendModalOpen(false)}>Cancel</Button>
            <Button onClick={handleExtend}>Confirm Extension</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPlanModalOpen} onOpenChange={setIsPlanModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>Upgrade or downgrade {college.name}'s access tier.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select New Plan</Label>
              <Select value={newPlan} onValueChange={setNewPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Free">Free Tier</SelectItem>
                  <SelectItem value="Basic">Basic Plan</SelectItem>
                  <SelectItem value="Premium">Premium Plan</SelectItem>
                  <SelectItem value="Enterprise">Enterprise Tier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Internal Note</Label>
              <Textarea 
                placeholder="Reason for plan change..." 
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPlanModalOpen(false)}>Cancel</Button>
            <Button onClick={handleChangePlan}>Update Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Cancel Subscription</DialogTitle>
            <DialogDescription>This will stop the billing cycle for {college.name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-4 border rounded-xl">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold">Disable Access Immediately</Label>
                <p className="text-xs text-muted-foreground">College will lose dashboard access right now.</p>
              </div>
              <Switch checked={cancelDisableAccess} onCheckedChange={setCancelDisableAccess} />
            </div>
            <div className="space-y-2">
              <Label>Cancellation Reason</Label>
              <Textarea 
                placeholder="Why is the subscription being cancelled?" 
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>Back</Button>
            <Button variant="destructive" onClick={handleCancel}>Confirm Cancellation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment Status</DialogTitle>
            <DialogDescription>Manually override the payment status for this tenant.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <Button 
                variant="outline" 
                className="justify-start h-14 border-green-100 hover:bg-green-50"
                onClick={() => {
                  updatePaymentStatus(college.id, 'Paid', "Manual payment confirmation");
                  setIsPaymentModalOpen(false);
                  toast({
                    title: "Success",
                    description: "Payment marked as Paid",
                  });
                }}
              >
                <CheckCircle2 className="h-5 w-5 mr-3 text-green-600" />
                <div className="text-left">
                  <p className="text-sm font-bold">Mark as Paid</p>
                  <p className="text-[10px] text-muted-foreground">Confirm payment has been received</p>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="justify-start h-14 border-yellow-100 hover:bg-yellow-50"
                onClick={() => {
                  updatePaymentStatus(college.id, 'Pending', "Payment set to pending");
                  setIsPaymentModalOpen(false);
                  toast({
                    title: "Status Updated",
                    description: "Payment marked as Pending",
                  });
                }}
              >
                <Clock className="h-5 w-5 mr-3 text-yellow-600" />
                <div className="text-left">
                  <p className="text-sm font-bold">Mark as Pending</p>
                  <p className="text-[10px] text-muted-foreground">Awaiting bank confirmation</p>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="justify-start h-14 border-red-100 hover:bg-red-50"
                onClick={() => {
                  updatePaymentStatus(college.id, 'Failed', "Payment marked as failed");
                  setIsPaymentModalOpen(false);
                  toast({
                    title: "Payment Failed",
                    description: "Payment marked as Failed",
                    variant: "destructive",
                  });
                }}
              >
                <XCircle className="h-5 w-5 mr-3 text-red-600" />
                <div className="text-left">
                  <p className="text-sm font-bold">Mark as Failed</p>
                  <p className="text-[10px] text-muted-foreground">Transaction was rejected or bounced</p>
                </div>
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
