import React from 'react';
import { Users, GraduationCap, CreditCard, BookOpen, Clock, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function KPICards({ data }: { data?: any }) {
  const kpis = [
    { name: 'Total Students', value: data?.totalStudents || '0', change: '+12.5%', isPositive: true, icon: GraduationCap, color: 'indigo' },
    { name: 'Total Faculty', value: data?.totalFaculty || '0', change: '+2.1%', isPositive: true, icon: Users, color: 'blue' },
    { name: 'Active Courses', value: data?.activeCourses || '0', change: '+4.3%', isPositive: true, icon: BookOpen, color: 'indigo' },
    { name: "Today's Attendance", value: data?.attendance || '0%', change: '-1.2%', isPositive: false, icon: Clock, color: 'amber' },
    { name: 'Fee Collection', value: data?.feeCollection || '₹0K', change: '+18.2%', isPositive: true, icon: CreditCard, color: 'emerald' },
    { name: 'Pending Fees', value: data?.pendingFees || '₹0K', change: '-5.4%', isPositive: true, icon: AlertCircle, color: 'red' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpis.map((kpi, index) => (
        <div 
          key={index} 
          className="bg-white dark:bg-slate-950 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:scale-[1.02] transition-all relative overflow-hidden group"
        >
          {/* Subtle background decoration */}
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{kpi.name}</p>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mt-2 group-hover:text-indigo-600 transition-colors">
                {kpi.value}
              </h3>
            </div>
            <div className={`p-4 bg-${kpi.color}-50 dark:bg-slate-900 rounded-3xl text-${kpi.color}-600 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-${kpi.color}-100/50`}>
              <kpi.icon strokeWidth={2.5} size={24} />
            </div>
          </div>
          
          <div className="mt-6 flex items-center gap-2.5 relative z-10">
            <span 
              className={`flex items-center text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                kpi.isPositive 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                  : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {kpi.isPositive ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
              {kpi.change}
            </span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">vs last month</span>
          </div>
        </div>
      ))}
    </div>
  );
}
