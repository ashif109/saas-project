import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface SmartAnalyticsProps {
    distributionData?: any[];
    attendanceTrendData?: any[];
}

export function SmartAnalytics({ distributionData, attendanceTrendData }: SmartAnalyticsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <Card className="lg:col-span-8 border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7 pt-8 px-8 bg-slate-50/50 border-b border-slate-50">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Attendance Trend</CardTitle>
            <CardDescription className="font-bold text-slate-400 text-xs uppercase tracking-widest">Average presence (Last 7 Days)</CardDescription>
          </div>
          <select className="bg-white border border-slate-100 rounded-2xl px-5 py-2.5 text-xs font-black text-slate-500 outline-none shadow-sm focus:ring-4 focus:ring-indigo-500/10 cursor-pointer hover:border-indigo-200 transition-all">
            <option>All Departments</option>
            <option>Engineering</option>
            <option>Business</option>
          </select>
        </CardHeader>
        <CardContent className="p-8">
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrendData || []}>
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={15} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dx={-10} />
                <Tooltip 
                  cursor={{stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4'}}
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px'}}
                  itemStyle={{fontWeight: '900', color: '#6366f1', fontSize: '14px'}}
                  labelStyle={{fontWeight: '700', marginBottom: '4px', color: '#64748b'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke="#6366f1" 
                  fillOpacity={1} 
                  fill="url(#colorAttendance)" 
                  strokeWidth={5} 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-4 border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className="pt-8 px-8">
          <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Student Distribution</CardTitle>
          <CardDescription className="font-bold text-slate-400 text-xs uppercase tracking-widest">Enrollment by department</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center p-8 pt-4">
          <div className="h-[280px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={100}
                  paddingAngle={10}
                  dataKey="value"
                  animationBegin={500}
                  animationDuration={1500}
                >
                  {(distributionData || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{paddingTop: '30px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em'}} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mb-4">
                <p className="text-3xl font-black text-slate-900">{(distributionData || []).reduce((acc, curr) => acc + curr.value, 0)}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Enrolled</p>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 w-full">
            {(distributionData || []).slice(0, 2).map((dept: any, i: number) => (
                <div key={i} className="p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 group hover:border-indigo-100 transition-colors">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{dept.name}</p>
                    <p className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{dept.value}</p>
                </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
