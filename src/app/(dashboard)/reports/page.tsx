
"use client"

import React from 'react';
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
  Zap
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
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PERFORMANCE_DATA = [
  { month: 'Jan', score: 82 },
  { month: 'Feb', score: 85 },
  { month: 'Mar', score: 78 },
  { month: 'Apr', score: 88 },
  { month: 'May', score: 92 },
  { month: 'Jun', score: 90 },
];

const DEPT_PERFORMANCE = [
  { name: 'Computer Science', efficiency: 95 },
  { name: 'Mechanical', efficiency: 82 },
  { name: 'Physics', efficiency: 88 },
  { name: 'Maths', efficiency: 91 },
];

const COLORS = ['#29995B', '#C4FC6C', '#819571', '#14532D'];

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">Institutional Reports</h1>
            <p className="text-muted-foreground">Analyze academic progress, financial health, and institutional needs</p>
          </div>
          <Button variant="outline" className="pulse-hover">
            <Download className="h-4 w-4 mr-2" /> Export Monthly Audit
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            label="Academic Index" 
            value="92.4" 
            icon={GraduationCap} 
            trend={{ value: '4.2%', positive: true }} 
          />
          <StatsCard 
            label="Faculty Efficiency" 
            value="88.1%" 
            icon={Zap} 
            iconBgClassName="bg-blue-50" 
            iconClassName="text-blue-500" 
          />
          <StatsCard 
            label="Resource Needs" 
            value="Low" 
            icon={Target} 
            iconBgClassName="bg-orange-50" 
            iconClassName="text-orange-500" 
          />
          <StatsCard 
            label="Downfall Alerts" 
            value="0" 
            icon={AlertCircle} 
            iconBgClassName="bg-green-50" 
            iconClassName="text-green-500" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer title="Overall Progress Trajectory" description="Average institutional performance score (Last 6 Months)">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PERFORMANCE_DATA}>
                  <defs>
                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} domain={[60, 100]} />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorProgress)" 
                    strokeWidth={3} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>

          <ChartContainer title="Departmental Efficiency" description="Resource utilization and result outcomes">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DEPT_PERFORMANCE} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="efficiency" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Needs & Analysis</CardTitle>
              <CardDescription>System identified growth requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Lab Equipment (CS)', priority: 'High', status: 'Pending' },
                { label: 'Faculty Hiring (Physics)', priority: 'Medium', status: 'Review' },
                { label: 'Library Expansion', priority: 'Low', status: 'Approved' },
              ].map((need, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="text-sm font-bold">{need.label}</p>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold mt-1">{need.priority} Priority</Badge>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{need.status}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-none shadow-sm bg-destructive/5 border border-destructive/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-destructive" /> Critical Progress Alerts
              </CardTitle>
              <CardDescription>Identification of potential academic or systemic downfalls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg border flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">Attendance Dip in Mechanical Dept.</p>
                    <p className="text-xs text-muted-foreground">Average fell from 88% to 74% in last 14 days.</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive">Root Analysis</Button>
                </div>
                <div className="p-4 bg-white rounded-lg border flex items-center justify-between opacity-60">
                  <div>
                    <p className="text-sm font-bold">Physics Semester Result (Resolved)</p>
                    <p className="text-xs text-muted-foreground">Identified scoring issues corrected via faculty intervention.</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Closed</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
