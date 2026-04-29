import React from 'react';
import { AlertCircle, FileWarning, Clock, Users } from 'lucide-react';
import Link from 'next/link';

export function ActionCenter({ data }: { data?: any[] }) {
  const getIcon = (title: string) => {
    if (title.includes('Fees')) return FileWarning;
    if (title.includes('Faculty')) return Users;
    if (title.includes('Timetable')) return AlertCircle;
    return Clock;
  };

  const getColors = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-600';
      case 'medium': return 'bg-amber-100 text-amber-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          Action Center
          <span className="bg-red-50 text-red-600 dark:bg-red-900/50 dark:text-red-400 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest">
            Attention Required
          </span>
        </h3>
      </div>
      
      <div className="space-y-3 flex-1">
        {(!data || data.length === 0) ? (
            <div className="py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold text-sm">Everything looks clear!</p>
            </div>
        ) : data.map((action, i) => {
          const Icon = getIcon(action.title);
          return (
            <Link 
              key={i} 
              href={action.href}
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-[1.5rem] border border-slate-50 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-slate-100 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${getColors(action.priority)}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                    {action.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[9px] uppercase font-black tracking-widest ${
                      action.priority === 'high' ? 'text-red-500' :
                      action.priority === 'medium' ? 'text-amber-500' : 'text-slate-400'
                    }`}>
                      {action.priority} PRIORITY
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 sm:mt-0 flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pl-14 sm:pl-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {action.count}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">items</span>
                </div>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 uppercase tracking-widest">
                  Resolve &rarr;
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
