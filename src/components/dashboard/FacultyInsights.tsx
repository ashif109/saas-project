import React from 'react';
import { Award, Briefcase } from 'lucide-react';

export function FacultyInsights({ data }: { data?: any[] }) {
  return (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
      <h3 className="font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
        <Award size={18} className="text-indigo-600" />
        Faculty Insights
      </h3>
      
      <div className="space-y-4">
        {(!data || data.length === 0) ? (
            <div className="py-10 text-center">
                <p className="text-slate-400 font-bold text-sm">No faculty insights available.</p>
            </div>
        ) : data.map((faculty, i) => (
          <div key={i} className="flex flex-col gap-2 p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border border-transparent hover:border-slate-50 dark:hover:border-slate-800 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">{faculty.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{faculty.department}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700"></span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                    faculty.status === 'Overloaded' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                    faculty.status === 'Underutilized' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                    'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                  }`}>
                    {faculty.status}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-black text-slate-900 dark:text-white">{faculty.score}%</span>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Engagement</span>
              </div>
            </div>
            
            <div className="w-full bg-slate-50 dark:bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden flex">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  faculty.status === 'Overloaded' ? 'bg-red-500' :
                  faculty.status === 'Underutilized' ? 'bg-amber-500' :
                  'bg-indigo-500'
                }`}
                style={{ width: `${faculty.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
