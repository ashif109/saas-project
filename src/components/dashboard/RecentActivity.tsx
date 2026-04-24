import React from 'react';
import { UserPlus, CreditCard, LayoutTemplate, ShieldCheck } from 'lucide-react';

const activities = [
  { id: 1, type: 'registration', title: 'New Student Registered', desc: 'Rahul Sharma (Comp. Sci)', time: '10m ago', icon: UserPlus, color: 'text-blue-500' },
  { id: 2, type: 'fee', title: 'Fee Payment Received', desc: '$1,200 via Stripe', time: '1h ago', icon: CreditCard, color: 'text-emerald-500' },
  { id: 3, type: 'timetable', title: 'Timetable Updated', desc: 'Fall 2024 Schedule', time: '3h ago', icon: LayoutTemplate, color: 'text-indigo-500' },
  { id: 4, type: 'role', title: 'Role Assigned', desc: 'Dr. Smith assigned as HOD', time: 'Yesterday', icon: ShieldCheck, color: 'text-amber-500' },
];

export function RecentActivity() {
  return (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-6">Recent Activity</h3>
      
      <div className="space-y-6 flex-1 relative">
        {/* Continuous vertical line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-800 z-0" />
        
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-4 relative z-10">
            <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
              <activity.icon size={10} className={activity.color} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{activity.title}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{activity.desc}</p>
              <p className="text-[10px] text-slate-400 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-6 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800">
        View All Logs
      </button>
    </div>
  );
}
