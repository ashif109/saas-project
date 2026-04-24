import React from 'react';
import { Users, GraduationCap, CreditCard, BookOpen, Clock, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const kpis = [
  { name: 'Total Students', value: '4,821', change: '+12.5%', isPositive: true, icon: GraduationCap },
  { name: 'Total Faculty', value: '312', change: '+2.1%', isPositive: true, icon: Users },
  { name: 'Active Courses', value: '86', change: '+4.3%', isPositive: true, icon: BookOpen },
  { name: "Today's Attendance", value: '89.4%', change: '-1.2%', isPositive: false, icon: Clock },
  { name: 'Fee Collection', value: '$254K', change: '+18.2%', isPositive: true, icon: CreditCard },
  { name: 'Pending Fees', value: '$42K', change: '-5.4%', isPositive: true, icon: AlertCircle }, // Decrease in pending is positive
];

export function KPICards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {kpis.map((kpi, index) => (
        <div 
          key={index} 
          className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{kpi.name}</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
                {kpi.value}
              </h3>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-600 dark:text-slate-300">
              <kpi.icon strokeWidth={1.5} size={22} />
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-2">
            <span 
              className={`flex items-center text-sm font-medium px-2 py-0.5 rounded-md ${
                kpi.isPositive 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                  : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {kpi.isPositive ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
              {kpi.change}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">vs last month</span>
          </div>
        </div>
      ))}
    </div>
  );
}
