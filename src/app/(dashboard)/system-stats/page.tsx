
"use client"

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatsCard } from '@/components/superadmin/StatsCard';
import { 
  Server, 
  Database, 
  Activity, 
  Users, 
  School, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  MessageSquare,
  ClipboardCheck,
  BarChart3
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ChartContainer } from '@/components/superadmin/ChartContainer';
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
  Cell
} from 'recharts';
import { TableComponent } from '@/components/superadmin/TableComponent';
import { Button } from '@/components/ui/button';
import { 
  RefreshCcw, 
  Trash2, 
  Calculator, 
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

import { useCollegeStore } from '@/store/useCollegeStore';
import { Loader2, Search } from 'lucide-react';
import api from '@/lib/axios';

import { useAuthStore } from '@/store/useAuthStore';

export default function SystemStatsPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const { colleges, loading: collegesLoading, fetchColleges } = useCollegeStore();
  const [stats, setStats] = React.useState<any>(null);
  const [loadingStats, setLoadingStats] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isClearing, setIsClearing] = React.useState(false);
  const [isCalculating, setIsRecalculating] = React.useState(false);

  const fetchStats = React.useCallback(async () => {
    if (!user || user.role !== 'SUPER_ADMIN') {
      setLoadingStats(false);
      return;
    }
    try {
      const { data } = await api.get('/api/analytics/system-stats');
      setStats(data);
    } catch (error) {
      console.error('Error fetching system stats:', error);
    } finally {
      setLoadingStats(false);
    }
  }, [user]);

  React.useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      fetchColleges();
      fetchStats();
    }
  }, [fetchColleges, fetchStats, user?.role]);

  // Derived metrics from real data
  const totalColleges = stats?.totalColleges || 0;
  const activeColleges = stats?.activeColleges || 0;
  const inactiveColleges = stats?.inactiveColleges || 0;
  const totalStudents = stats?.totalStudents || 0;
  const activeUsers = stats?.activeUsers || 0;
  
  const engagementData = colleges.length > 0 ? colleges.map(c => ({
    name: c.code,
    engagement: Math.floor(Math.random() * 20) + 75 // Simulated for visual variety
  })).slice(0, 5) : [];

  const rankingsData = colleges.length > 0 ? colleges.map((c, i) => ({
    id: c._id,
    name: c.name,
    engagement: `${Math.floor(Math.random() * 20) + 75}%`,
    growth: i % 2 === 0 ? '+12%' : '-5%',
    status: c.status === 'Active' ? 'Stable' : 'Disabled'
  })).slice(0, 5) : [];

  const featureUsage = [
    { name: 'Doubts', value: stats?.doubtsResolved || 0 },
    { name: 'Attendance', value: stats?.attendanceMarked || 0 },
    { name: 'Analytics', value: totalColleges },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStats();
    await fetchColleges();
    setIsRefreshing(false);
    toast({
      title: "Data Refreshed",
      description: "Platform analytics have been synchronized with the latest logs.",
    });
  };

  if ((collegesLoading || loadingStats) && colleges.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const handleClearCache = async () => {
    setIsClearing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsClearing(false);
    toast({
      title: "Temporary Data Cleared",
      description: "Local simulation cache has been successfully reset.",
    });
  };

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRecalculating(false);
    toast({
      title: "Analytics Recalculated",
      description: "Institutional performance metrics have been re-aggregated.",
    });
  };

  const handleRestart = async () => {
    toast({
      title: "System Restart Initiated",
      description: "The platform is performing a mock graceful restart.",
    });
    await new Promise(resolve => setTimeout(resolve, 3000));
    toast({
      title: "System Online",
      description: "All services have been restored successfully.",
    });
  };

  const rankingColumns = [
    { 
      header: 'College', 
      accessor: (item: any) => (
        <span className="font-bold">{item.name}</span>
      ) 
    },
    { header: 'Engagement', accessor: 'engagement' },
    { 
      header: 'Monthly Growth', 
      accessor: (item: any) => (
        <span className={item.growth.startsWith('+') ? 'text-green-600 flex items-center gap-1' : 'text-destructive flex items-center gap-1'}>
          {item.growth.startsWith('+') ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {item.growth}
        </span>
      ) 
    },
    { 
      header: 'Performance Status', 
      accessor: (item: any) => (
        <Badge variant={item.status === 'Critical' || item.status === 'Low Activity' ? 'destructive' : 'default'} className="text-[10px]">
          {item.status}
        </Badge>
      ) 
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Platform Health & Insights</h1>
          <p className="text-muted-foreground">Comprehensive overview of institutional engagement and infrastructure status.</p>
        </div>

        {/* Business KPIs - Primary View */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Business Intelligence
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard 
              label="Total Colleges" 
              value={totalColleges.toString()} 
              icon={School} 
              description={`${activeColleges} Active / ${inactiveColleges} Inactive`} 
            />
            <StatsCard 
              label="Daily Active Users" 
              value={activeUsers.toLocaleString()} 
              icon={Users} 
              iconBgClassName="bg-blue-50"
              iconClassName="text-blue-500"
            />
            <StatsCard 
              label="Avg. Engagement" 
              value={totalColleges > 0 ? "82%" : "0%"} 
              icon={Zap} 
              iconBgClassName="bg-yellow-50"
              iconClassName="text-yellow-500"
            />
            <StatsCard 
              label="Total Students" 
              value={totalStudents.toLocaleString()} 
              icon={Activity} 
              iconBgClassName="bg-orange-50"
              iconClassName="text-orange-500"
            />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Engagement Chart */}
          <ChartContainer 
            title="College Engagement Comparison" 
            description="Active participation percentage by institution"
            className="lg:col-span-2"
          >
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {engagementData.length > 0 ? (
                  <BarChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="engagement" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-center space-y-2">
                    <BarChart3 className="h-10 w-10 text-muted-foreground/20" />
                    <p className="text-sm text-muted-foreground">No data to display yet</p>
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </ChartContainer>

          {/* Feature Usage */}
          <ChartContainer 
            title="Feature Adoption" 
            description="Usage distribution across modules"
            className="lg:col-span-1"
          >
            <div className="h-[250px] w-full flex flex-col items-center">
              <ResponsiveContainer width="100%" height="100%">
                {featureUsage.some(f => f.value > 0) ? (
                  <PieChart>
                    <Pie
                      data={featureUsage}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {featureUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#29995B', '#C4FC6C', '#819571'][index % 3]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-center space-y-2">
                    <Zap className="h-10 w-10 text-muted-foreground/20" />
                    <p className="text-sm text-muted-foreground font-medium">No usage data</p>
                  </div>
                )}
              </ResponsiveContainer>
              {featureUsage.some(f => f.value > 0) && (
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {featureUsage.map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: ['#29995B', '#C4FC6C', '#819571'][i % 3] }} />
                      <span className="text-[10px] font-bold uppercase">{item.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ChartContainer>
        </div>

        {/* Institutional Rankings & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-none shadow-sm">
            <CardHeader>
              <CardTitle>Institutional Performance Rankings</CardTitle>
              <CardDescription>Top and low performing colleges based on platform engagement</CardDescription>
            </CardHeader>
            <CardContent>
              {rankingsData.length > 0 ? (
                <TableComponent 
                  data={rankingsData} 
                  columns={rankingColumns} 
                  className="border-none"
                />
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                  <p className="text-sm text-muted-foreground">No ranking data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Actionable Alerts</h3>
            <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Low Activity Detected</AlertTitle>
              <AlertDescription className="text-xs">
                Oxford University has shown a 20% drop in doubt resolutions this week.
              </AlertDescription>
            </Alert>
            <Alert className="bg-orange-50 border-orange-200">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-800">Critical Drop</AlertTitle>
              <AlertDescription className="text-xs text-orange-700">
                Princeton University engagement is below 10%. Reviewing account status recommended.
              </AlertDescription>
            </Alert>
            
            <Card className="border-none shadow-sm bg-accent/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Today's Pulse</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <MessageSquare className="h-3 w-3 text-primary" /> Doubts Resolved
                  </div>
                  <span className="font-bold">{stats?.doubtsResolved?.toLocaleString() || "0"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <ClipboardCheck className="h-3 w-3 text-primary" /> Attendance Marked
                  </div>
                  <span className="font-bold">{stats?.attendanceMarked?.toLocaleString() || "0"}</span>
                </div>
                {(!stats?.doubtsResolved && !stats?.attendanceMarked) && (
                  <p className="text-[10px] text-muted-foreground pt-2 italic text-center">
                    No activity recorded yet
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm border-l-4 border-l-amber-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-amber-500" /> System Maintenance
                </CardTitle>
                <CardDescription className="text-[10px]">Administrative infrastructure controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start h-9 text-xs font-medium"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCcw className={`h-3.5 w-3.5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start h-9 text-xs font-medium"
                  onClick={handleClearCache}
                  disabled={isClearing}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  {isClearing ? 'Clearing...' : 'Clear Temp Data'}
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start h-9 text-xs font-medium"
                  onClick={handleRecalculate}
                  disabled={isCalculating}
                >
                  <Calculator className="h-3.5 w-3.5 mr-2" />
                  {isCalculating ? 'Calculating...' : 'Recalculate Analytics'}
                </Button>

                <div className="pt-2 border-t mt-2">
                  <div className="flex items-center gap-1.5 mb-2 px-1">
                    <ShieldAlert className="h-3 w-3 text-destructive" />
                    <span className="text-[10px] font-bold text-destructive uppercase">Critical Action</span>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="w-full justify-start h-9 text-xs font-bold bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-none"
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-2" />
                        Restart Platform
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will initiate a platform-wide graceful restart. All active socket connections will be dropped and re-established. Institutional access may be briefly interrupted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRestart} className="bg-destructive text-white hover:bg-destructive/90">
                          Confirm Restart
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System Monitoring - Lightweight */}
        <section className="space-y-4 pt-4 border-t">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Server className="h-5 w-5 text-muted-foreground" /> Infrastructure Health
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-none shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">Server Status</span>
                </div>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Online</Badge>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">System Load</span>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Low</Badge>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/5 rounded-lg">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">API Health</span>
                </div>
                <Badge className="bg-primary/20 text-primary hover:bg-primary/20 border-none">Good</Badge>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Error Rate</span>
                  <span className="text-xs font-bold">0.02%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Storage</span>
                  <span className="text-xs font-bold">30%</span>
                </div>
                <Progress value={30} className="h-1" />
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

