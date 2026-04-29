import React from 'react';
import { Users, GraduationCap, CreditCard, BookOpen, Clock, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function KPICards({ data }: { data?: any }) {
  const kpis = [
    { name: 'Total Students', value: data?.totalStudents || '0', change: '+12.5%', isPositive: true, icon: GraduationCap },
    { name: 'Total Faculty', value: data?.totalFaculty || '0', change: '+2.1%', isPositive: true, icon: Users },
    { name: 'Active Courses', value: data?.activeCourses || '0', change: '+4.3%', isPositive: true, icon: BookOpen },
    { name: "Today's Attendance", value: data?.attendance || '0%', change: '-1.2%', isPositive: false, icon: Clock },
    { name: 'Fee Collection', value: data?.feeCollection || '₹0K', change: '+18.2%', isPositive: true, icon: CreditCard },
    { name: 'Pending Fees', value: data?.pendingFees || '₹0K', change: '-5.4%', isPositive: true, icon: AlertCircle },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {kpis.map((kpi, index) => (
        <div 
          key={index} 
          className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{kpi.name}</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
                {kpi.value}
              </h3>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl text-slate-400 group-hover:text-indigo-600 transition-colors">
              <kpi.icon strokeWidth={2} size={22} />
            </div>
          </div>
          
          <div className="mt-5 flex items-center gap-2">
            <span 
              className={`flex items-center text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                kpi.isPositive 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                  : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {kpi.isPositive ? <ArrowUpRight size={10} className="mr-1" /> : <ArrowDownRight size={10} className="mr-1" />}
              {kpi.change}
            </span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">vs last month</span>
          </div>
        </div>
      ))}
    </div>
  );
}
