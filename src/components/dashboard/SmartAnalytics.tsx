"use client";

import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const attendanceData = [
  { day: 'Mon', rate: 85 }, { day: 'Tue', rate: 88 }, { day: 'Wed', rate: 84 },
  { day: 'Thu', rate: 91 }, { day: 'Fri', rate: 89 }, { day: 'Sat', rate: 75 },
];

const feeData = [
  { month: 'Jul', collected: 120, pending: 40 }, { month: 'Aug', collected: 150, pending: 30 },
  { month: 'Sep', collected: 180, pending: 20 }, { month: 'Oct', collected: 210, pending: 50 },
  { month: 'Nov', collected: 170, pending: 25 }, { month: 'Dec', collected: 254, pending: 42 },
];

const studentData = [
  { name: 'Computer Science', value: 1200 },
  { name: 'Business', value: 800 },
  { name: 'Engineering', value: 950 },
  { name: 'Arts', value: 400 },
];
const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

export function SmartAnalytics() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[400px] w-full bg-slate-50 dark:bg-slate-900/50 rounded-2xl animate-pulse border border-slate-200 dark:border-slate-800" />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Attendance Area Chart */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[350px]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Attendance Trend</h3>
            <p className="text-sm text-slate-500">Average attendance over the last 7 days</p>
          </div>
          <select className="text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 text-slate-700 dark:text-slate-300">
            <option>All Departments</option>
            <option>Computer Science</option>
            <option>Business</option>
          </select>
        </div>
        <div className="flex-1 w-full relative">
          <ResponsiveContainer width="100%" height="100%" minHeight={250}>
            <AreaChart data={attendanceData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tw-prose-body, #fff)' }}
                itemStyle={{ color: '#0f172a' }}
              />
              <Area type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fee Collection Bar / Distribution */}
      <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Student Distribution</h3>
        <p className="text-sm text-slate-500 mb-6">Enrolled students by department</p>
        <div className="flex-1 w-full min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={studentData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {studentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', color: '#64748b' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
