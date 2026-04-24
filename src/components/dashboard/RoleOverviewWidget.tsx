import React from 'react';
import { ShieldAlert, Users, BookOpen } from 'lucide-react';

const roles = [
  { name: 'Super Admin', count: 2, icon: ShieldAlert, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  { name: 'Director', count: 1, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { name: 'HOD', count: 8, icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { name: 'Faculty', count: 312, icon: Users, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800/50' },
];

export function RoleOverviewWidget() {
  return (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-5 flex items-center justify-between">
          Role Distribution
          <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            Active
          </span>
        </h3>
        
        <div className="space-y-3 mb-6">
          {roles.map((role, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-md ${role.bg}`}>
                  <role.icon size={14} className={role.color} />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{role.name}</span>
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{role.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto">
        <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl flex items-start gap-3">
          <ShieldAlert size={16} className="text-red-600 dark:text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-red-800 dark:text-red-400">Department without HOD</p>
            <p className="text-[11px] text-red-600/80 dark:text-red-400/80 mt-0.5">Civil Engineering requires immediate assignment.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
