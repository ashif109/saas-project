import React from 'react';
import { Users, GraduationCap, CreditCard, CalendarDays, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

const stats = [
  { name: 'Total Students', value: '4,821', change: '+12%', isPositive: true, icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/40' },
  { name: 'Total Faculty', value: '312', change: '+2%', isPositive: true, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/40' },
  { name: 'Fee Collection', value: '$2.4M', change: '-4%', isPositive: false, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/40' },
  { name: 'Upcoming Events', value: '14', change: 'This week', isPositive: true, icon: CalendarDays, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/40' },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">College Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Overview of your institution's metrics and operations today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            {/* Decorative background element */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl ${stat.bg.replace('bg-', '')}`} />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.name}</p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`flex items-center text-sm font-medium ${stat.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {stat.isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                {stat.change}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Activity Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Placeholder (You would use Recharts here) */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900 dark:text-white">Fee Collection Trends</h3>
            <select className="text-sm bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none">
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>
          
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/50">
             <div className="text-center">
                 <Activity className="w-12 h-12 text-blue-300 dark:text-blue-900/50 mx-auto mb-3" />
                 <p className="text-slate-500 text-sm">Interactive Chart Component</p>
                 <p className="text-slate-400 text-xs mt-1">Recharts integration goes here</p>
             </div>
          </div>
        </div>

        {/* Recent Activity / Agenda */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-6">Recent Activities</h3>
          <div className="space-y-6 flex-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 relative">
                {/* Timeline line */}
                {i !== 4 && <div className="absolute left-2.5 top-8 bottom-[-24px] w-px bg-slate-200 dark:bg-slate-800" />}
                
                <div className="w-5 h-5 rounded-full border-2 border-blue-500 bg-white dark:bg-slate-900 shrink-0 mt-1 relative z-10" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">New Admission: MBA Batch 2024</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">10 minutes ago</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}
