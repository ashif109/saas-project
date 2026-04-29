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

const ATTENDANCE_DATA = [
  { day: 'Mon', attendance: 88 },
  { day: 'Tue', attendance: 92 },
  { day: 'Wed', attendance: 85 },
  { day: 'Thu', attendance: 90 },
  { day: 'Fri', attendance: 94 },
  { day: 'Sat', attendance: 82 },
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function SmartAnalytics({ data }: { data?: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <Card className="lg:col-span-8 border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold">Attendance Trend</CardTitle>
            <CardDescription className="font-medium text-slate-400">Average attendance over the last 7 days</CardDescription>
          </div>
          <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/20">
            <option>All Departments</option>
            <option>Engineering</option>
            <option>Business</option>
          </select>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ATTENDANCE_DATA}>
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                  itemStyle={{fontWeight: 'bold', color: '#6366f1'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke="#6366f1" 
                  fillOpacity={1} 
                  fill="url(#colorAttendance)" 
                  strokeWidth={4} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-4 border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Student Distribution</CardTitle>
          <CardDescription className="font-medium text-slate-400">Enrolled students by department</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {(data || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '11px', fontWeight: 'bold'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 w-full">
            {(data || []).slice(0, 2).map((dept: any, i: number) => (
                <div key={i} className="p-3 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dept.name}</p>
                    <p className="text-xl font-black text-slate-900">{dept.value}</p>
                </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
