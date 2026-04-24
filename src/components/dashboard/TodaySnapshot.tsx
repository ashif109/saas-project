import React from 'react';
import { Calendar, MonitorPlay, UsersRound } from 'lucide-react';

export function TodaySnapshot() {
  return (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
          <Calendar size={18} className="text-blue-500" />
          Today's Snapshot
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <MonitorPlay size={18} className="text-indigo-500 mb-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">42</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Ongoing Classes</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <UsersRound size={18} className="text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">128</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Upcoming Classes</p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Next Event</h4>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
          <p className="text-sm font-medium text-slate-900 dark:text-slate-200 ml-1">Faculty Meeting (All Depts)</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 ml-1 flex items-center gap-1">
            <Calendar size={12} /> Today, 2:00 PM
          </p>
        </div>
      </div>
    </div>
  );
}
