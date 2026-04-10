"use client"

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/superadmin/StatsCard';
import { 
  Users, 
  School, 
  Activity, 
  Globe, 
  TrendingUp,
  Award,
  Loader2,
  TrendingDown,
  BarChart3
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { ChartContainer } from '@/components/superadmin/ChartContainer';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import api from '@/lib/axios';

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const fetchStats = async () => {
      if (user?.role !== 'SUPER_ADMIN') {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/api/analytics/system-stats');
        setStats(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user?.role]);

  if (!user) return null;
  const isSuperAdmin = user.role === 'SUPER_ADMIN';

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">
            {isSuperAdmin ? 'Platform Analytics' : 'Institutional Analytics'}
          </h1>
          <p className="text-muted-foreground">
            {isSuperAdmin 
              ? 'Real-time monitoring of global institutional performance and growth' 
              : 'Insights into student performance and departmental metrics'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            label={isSuperAdmin ? "Total Students" : "Active Students"} 
            value={stats?.totalStudents?.toLocaleString() || "0"} 
            icon={Users}
          />
          <StatsCard 
            label={isSuperAdmin ? "Active Colleges" : "Faculty"} 
            value={isSuperAdmin ? (stats?.activeColleges?.toString() || "0") : (stats?.totalFaculty?.toString() || "0")} 
            icon={isSuperAdmin ? School : Award}
            iconBgClassName="bg-blue-50"
            iconClassName="text-blue-500"
          />
          <StatsCard 
            label="Engagement Rate" 
            value={stats?.engagementRate || "0%"} 
            icon={Activity}
            iconBgClassName="bg-orange-50"
            iconClassName="text-orange-500"
          />
          <StatsCard 
            label={isSuperAdmin ? "Global Health" : "Retention"} 
            value={stats?.globalHealth || "0%"} 
            icon={isSuperAdmin ? Globe : TrendingUp}
            iconBgClassName="bg-green-50"
            iconClassName="text-green-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer 
            title="Platform Usage" 
            description="Comparison of key system activities"
          >
            <div className="h-[350px] w-full">
              {stats?.totalColleges > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.usageTrends || []}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center text-center space-y-3">
                  <BarChart3 className="h-12 w-12 text-muted-foreground/20" />
                  <div className="space-y-1">
                    <p className="font-bold text-slate-400">No activity recorded yet</p>
                    <p className="text-xs text-muted-foreground max-w-[200px]">Data will appear once colleges start using the system.</p>
                  </div>
                </div>
              )}
            </div>
          </ChartContainer>

          <ChartContainer 
            title="Institutional Distribution" 
            description="Active vs Inactive college status"
          >
            <div className="h-[350px] w-full">
              {stats?.totalColleges > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Active', value: stats?.activeColleges },
                        { name: 'Inactive', value: stats?.inactiveColleges }
                      ]}
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center text-center space-y-3">
                  <Activity className="h-12 w-12 text-muted-foreground/20" />
                  <div className="space-y-1">
                    <p className="font-bold text-slate-400">No data yet</p>
                    <p className="text-xs text-muted-foreground max-w-[200px]">Register your first college to see distribution insights.</p>
                  </div>
                </div>
              )}
            </div>
          </ChartContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
