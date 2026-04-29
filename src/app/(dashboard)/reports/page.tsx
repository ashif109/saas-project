"use client"

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer } from '@/components/superadmin/ChartContainer';
import { StatsCard } from '@/components/superadmin/StatsCard';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Users, 
  GraduationCap, 
  Download,
  AlertCircle,
  Zap,
  Loader2,
  FileText
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';

export default function ReportsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/analytics/institutional');
      setData(res.data);
    } catch (err) {
      toast({ title: "Sync Error", description: "Failed to load institutional intelligence.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          <p className="text-slate-500 font-bold animate-pulse">Generating Institutional Intelligence...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Institutional Reports</h1>
            <p className="text-slate-500 font-medium">Analyze academic progress, financial health, and institutional needs</p>
          </div>
          <Button className="bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-200 px-6 h-11 rounded-xl font-bold">
            <Download className="h-4 w-4 mr-2" /> Export Monthly Audit
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            label="Academic Index" 
            value={data?.stats?.academicIndex || "0.0"} 
            icon={GraduationCap} 
            trend={{ value: '4.2%', positive: true }} 
          />
          <StatsCard 
            label="Faculty Efficiency" 
            value={data?.stats?.facultyEfficiency || "0%"} 
            icon={Zap} 
            iconBgClassName="bg-blue-50" 
            iconClassName="text-blue-500" 
          />
          <StatsCard 
            label="Resource Needs" 
            value={data?.stats?.resourceNeeds || "None"} 
            icon={Target} 
            iconBgClassName="bg-orange-50" 
            iconClassName="text-orange-500" 
          />
          <StatsCard 
            label="Downfall Alerts" 
            value={data?.stats?.downfallAlerts?.toString() || "0"} 
            icon={AlertCircle} 
            iconBgClassName={data?.stats?.downfallAlerts > 0 ? "bg-red-50" : "bg-green-50"} 
            iconClassName={data?.stats?.downfallAlerts > 0 ? "text-red-500" : "text-green-500"} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer title="Overall Progress Trajectory" description="Average institutional performance score (Last 6 Months)">
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.performanceData || []}>
                  <defs>
                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} domain={[60, 100]} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                    itemStyle={{fontWeight: 'bold', color: '#4f46e5'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#4f46e5" 
                    fillOpacity={1} 
                    fill="url(#colorProgress)" 
                    strokeWidth={4} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>

          <ChartContainer title="Departmental Efficiency" description="Resource utilization and result outcomes">
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.deptPerformance || []} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} tick={{fill: '#1e293b', fontWeight: 600, fontSize: 11}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="efficiency" fill="#0f172a" radius={[0, 8, 8, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white/80 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">Needs & Analysis</CardTitle>
              <CardDescription className="font-medium">System identified growth requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 py-6">
              {(data?.needs || []).map((need: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors group">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{need.label}</p>
                    <Badge variant="outline" className={`text-[10px] uppercase font-black tracking-widest mt-1.5 border-none px-0 ${
                        need.priority === 'High' ? 'text-red-500' : need.priority === 'Medium' ? 'text-orange-500' : 'text-blue-500'
                    }`}>{need.priority} Priority</Badge>
                  </div>
                  <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600">{need.status}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-none shadow-xl shadow-red-100/50 rounded-3xl bg-red-50/50 border border-red-100 overflow-hidden">
            <CardHeader className="pb-2 bg-red-50/80">
              <CardTitle className="flex items-center gap-2 text-red-900 font-bold">
                <TrendingDown className="h-6 w-6 text-red-500" /> Critical Progress Alerts
              </CardTitle>
              <CardDescription className="text-red-700 font-medium">Identification of potential academic or systemic downfalls</CardDescription>
            </CardHeader>
            <CardContent className="py-6">
              <div className="space-y-4">
                {(data?.alerts || []).map((alert: any, i: number) => (
                    <div key={i} className={`p-5 rounded-2xl border flex items-center justify-between shadow-sm transition-all hover:scale-[1.01] ${
                        alert.status === 'Active' ? 'bg-white border-red-200' : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}>
                        <div className="flex gap-4 items-start">
                            <div className={`p-2.5 rounded-xl ${alert.status === 'Active' ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-400'}`}>
                                <AlertCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <p className={`font-bold ${alert.status === 'Active' ? 'text-slate-900' : 'text-slate-600'}`}>{alert.title}</p>
                                <p className="text-xs text-slate-500 mt-1 font-medium">{alert.desc}</p>
                            </div>
                        </div>
                        {alert.status === 'Active' ? (
                            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl h-9">Root Analysis</Button>
                        ) : (
                            <Badge className="bg-green-100 text-green-700 border-none px-3 py-1 font-black text-[10px] tracking-widest">RESOLVED</Badge>
                        )}
                    </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
