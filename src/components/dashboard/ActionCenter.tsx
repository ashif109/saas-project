import React from 'react';
import { AlertCircle, FileWarning, Clock, Users } from 'lucide-react';
import Link from 'next/link';

const actions = [
  {
    id: 1,
    title: 'Pending Fees (>30 Days)',
    count: 42,
    priority: 'high',
    icon: FileWarning,
    href: '/admin/fees',
    color: 'text-red-600',
    bg: 'bg-red-100 dark:bg-red-900/30 dark:text-red-400'
  },
  {
    id: 2,
    title: 'Classes w/o Faculty Assigned',
    count: 8,
    priority: 'medium',
    icon: Users,
    href: '/admin/timetable',
    color: 'text-amber-600',
    bg: 'bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400'
  },
  {
    id: 3,
    title: 'Timetable Conflicts Detected',
    count: 3,
    priority: 'high',
    icon: AlertCircle,
    href: '/admin/timetable/conflicts',
    color: 'text-red-600',
    bg: 'bg-red-100 dark:bg-red-900/30 dark:text-red-400'
  },
  {
    id: 4,
    title: 'Low Attendance Alerts (<75%)',
    count: 156,
    priority: 'low',
    icon: Clock,
    href: '/admin/attendance',
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-800'
  }
];

export function ActionCenter() {
  return (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          Action Center
          <span className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 text-xs px-2 py-0.5 rounded-full font-medium">
            Requires Attention
          </span>
        </h3>
      </div>
      
      <div className="space-y-3">
        {actions.map((action) => (
          <Link 
            key={action.id} 
            href={action.href}
            className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${action.bg}`}>
                <action.icon size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {action.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${
                    action.priority === 'high' ? 'text-red-500' :
                    action.priority === 'medium' ? 'text-amber-500' : 'text-slate-500'
                  }`}>
                    {action.priority} PRIORITY
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-3 sm:mt-0 flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pl-11 sm:pl-0">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-semibold text-slate-900 dark:text-white">
                  {action.count}
                </span>
                <span className="text-xs text-slate-500">items</span>
              </div>
              <span className="text-sm text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Resolve &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
