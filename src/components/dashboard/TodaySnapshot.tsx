import React from 'react';
import { Calendar, MonitorPlay, UsersRound } from 'lucide-react';

export function TodaySnapshot({ data }: { data?: any }) {
  return (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
          <Calendar size={18} className="text-indigo-600" />
          Today's Snapshot
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-50 dark:border-slate-800">
            <MonitorPlay size={18} className="text-indigo-500 mb-2" />
            <p className="text-2xl font-black text-slate-900 dark:text-white">{data?.ongoing || 0}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">Ongoing Classes</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-50 dark:border-slate-800">
            <UsersRound size={18} className="text-blue-500 mb-2" />
            <p className="text-2xl font-black text-slate-900 dark:text-white">{data?.upcoming || 0}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">Upcoming Classes</p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Next Event</h4>
        {data?.nextEvent ? (
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500" />
                <p className="text-sm font-bold text-slate-900 dark:text-slate-200 ml-1">{data.nextEvent.title}</p>
                <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 mt-1.5 ml-1 flex items-center gap-1.5 uppercase tracking-tighter">
                    <Calendar size={12} /> {new Date(data.nextEvent.time).toLocaleString()}
                </p>
            </div>
        ) : (
            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No upcoming events</p>
            </div>
        )}
      </div>
    </div>
  );
}
