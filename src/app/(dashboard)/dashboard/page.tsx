"use client"

import React from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, GraduationCap, School, CheckCircle2, AlertCircle, Clock, TrendingUp, Calendar, CreditCard, MessageSquare, Plus, Activity, Bell, Settings, BarChart3, ChevronRight } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';

import { useCollegeStore } from '@/store/useCollegeStore';
import { Loader2 } from 'lucide-react';
import api from '@/lib/axios';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { colleges, loading: collegesLoading, fetchColleges } = useCollegeStore();
  const [stats, setStats] = React.useState<any>(null);
  const [loadingStats, setLoadingStats] = React.useState(true);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      // Ensure user is loaded and is SUPER_ADMIN
      if (!user || user.role !== 'SUPER_ADMIN') {
        setLoadingStats(false);
        return;
      }
      
      try {
        const { data } = await api.get('/api/analytics/system-stats');
        setStats(data);
      } catch (error: any) {
        if (error.response?.status === 403) {
          console.error('Permission denied for system stats. User role:', user.role);
        } else {
          console.error('Error fetching dashboard stats:', error);
        }
      } finally {
        setLoadingStats(false);
      }
    };

    if (user?.role === 'SUPER_ADMIN') {
      fetchColleges();
    }
    fetchDashboardData();
  }, [fetchColleges, user?.role, user?.id]); // Added user?.id to dependencies to refetch if user changes

  const statsData = {
    totalColleges: 0,
    activeColleges: 0,
    totalStudents: 0,
    totalFaculty: 0,
    doubtsResolved: 0,
    attendanceMarked: 0,
    activeUsers: 0
  };

  // Derived stats from real college data
  const totalColleges = stats?.totalColleges || 0;
  const activeColleges = stats?.activeColleges || 0;
  const totalStudents = stats?.totalStudents || 0;
  const totalFaculty = stats?.totalFaculty || 0;
  const doubtsResolved = stats?.doubtsResolved || 0;

  // For charts, we use real data or empty state
  const engagementData = colleges.length > 0 ? colleges.map(c => ({
    name: c.code,
    value: c.students
  })).slice(0, 6) : [];

  const recentColleges = colleges.slice(0, 3);

  if ((collegesLoading || loadingStats) && colleges.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    { label: "Total Colleges", value: totalColleges.toString(), subValue: `${activeColleges} Active`, icon: School, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Students", value: totalStudents.toLocaleString(), subValue: "Across all tenants", icon: Users, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Total Faculty", value: totalFaculty.toLocaleString(), subValue: "Verified experts", icon: GraduationCap, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Resolved Doubts", value: doubtsResolved.toLocaleString(), subValue: "Platform total", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
  ];

  const recentActivity = [
    { text: "New College registered: Stanford University", time: "2 hours ago", type: "success" },
    { text: "System maintenance completed successfully", time: "5 hours ago", type: "info" },
    { text: "Subscription renewal for MIT processed", time: "Yesterday", type: "success" },
    { text: "Critical alert: Database latency spike detected", time: "2 days ago", type: "error" },
  ];

  const quickActions = [
    { label: "Add New College", icon: Plus, url: "/colleges", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "View System Stats", icon: Activity, url: "/system-stats", color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Manage Colleges", icon: School, url: "/colleges", color: "text-violet-600", bg: "bg-violet-50" },
    { label: "View Alerts", icon: Bell, url: "/notifications", color: "text-amber-600", bg: "bg-amber-50" },
    { label: "System Settings", icon: Settings, url: "/settings", color: "text-slate-600", bg: "bg-slate-50" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-sm md:text-base text-muted-foreground font-medium">Welcome back, <span className="text-foreground font-bold underline decoration-primary/30 underline-offset-4">{user?.name || 'Admin'}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="h-9 px-4 rounded-xl border-primary/20 text-primary font-bold bg-primary/5">
              <Activity className="h-3.5 w-3.5 mr-2" /> System Online
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {statCards.map((stat, i) => (
            <Card key={i} className="border-none shadow-sm rounded-2xl group hover:shadow-md transition-all duration-300">
              <CardContent className="p-6 flex flex-row items-center gap-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-black tracking-tight">{stat.value}</h3>
                  </div>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">{stat.subValue}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <Card className="lg:col-span-8 border-none shadow-sm rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl font-bold">College Engagement</CardTitle>
                <CardDescription className="text-sm font-medium">Student distribution across top institutions</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="font-bold text-primary hover:bg-primary/5">View Report</Button>
            </CardHeader>
            <CardContent className="h-[300px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                {engagementData.length > 0 ? (
                  <BarChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-center space-y-2">
                    <BarChart3 className="h-10 w-10 text-muted-foreground/20" />
                    <p className="text-sm text-muted-foreground">No engagement data to display</p>
                  </div>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-8 border-none shadow-sm rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl font-bold">Recent Colleges</CardTitle>
                <CardDescription className="text-sm font-medium">Newly registered institutions</CardDescription>
              </div>
              <Link href="/colleges">
                <Button variant="ghost" size="sm" className="font-bold text-primary hover:bg-primary/5">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {recentColleges.length > 0 ? recentColleges.map((college) => (
                  <div key={college._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <School className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{college.name}</p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{college.code} • {college.students} Students</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-bold text-[10px]">
                      NEW
                    </Badge>
                  </div>
                )) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center">
                      <Plus className="h-6 w-6 text-slate-300" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-400">No recent colleges</p>
                      <Link href="/colleges">
                        <Button variant="link" size="sm" className="text-primary font-bold">Register Now</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-4 border-none shadow-sm rounded-2xl bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
              <Settings className="h-32 w-32" />
            </div>
            <CardHeader>
              <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
              <CardDescription className="text-slate-400 font-medium">Administrative platform controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">
              {quickActions.map((action, i) => (
                <Button 
                  key={i} 
                  variant="ghost" 
                  className="w-full justify-start h-14 gap-4 px-4 hover:bg-white/10 rounded-xl group transition-all"
                  asChild
                >
                  <Link href={action.url}>
                    <div className={`h-10 w-10 rounded-lg ${action.bg} flex items-center justify-center transition-transform group-hover:rotate-12`}>
                      <action.icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <span className="font-bold text-slate-200">{action.label}</span>
                    <ChevronRight className="h-4 w-4 ml-auto text-slate-500 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}