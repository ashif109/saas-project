import React from 'react';
import { Award, Briefcase } from 'lucide-react';

const facultyStats = [
  { name: 'Dr. Sarah Smith', department: 'Computer Science', role: 'HOD', status: 'Optimal', score: 98 },
  { name: 'Prof. John Doe', department: 'Business', role: 'Faculty', status: 'Overloaded', score: 95 },
  { name: 'Alice Johnson', department: 'Arts', role: 'Faculty', status: 'Underutilized', score: 88 },
];

export function FacultyInsights() {
  return (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
        <Award size={18} className="text-blue-500" />
        Faculty Insights
      </h3>
      
      <div className="space-y-4">
        {facultyStats.map((faculty, i) => (
          <div key={i} className="flex flex-col gap-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{faculty.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500">{faculty.department}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    faculty.status === 'Overloaded' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                    faculty.status === 'Underutilized' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                  }`}>
                    {faculty.status}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{faculty.score}%</span>
                <span className="text-[10px] text-slate-400">Engagement</span>
              </div>
            </div>
            
            {/* Mini workload bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden flex">
              <div 
                className={`h-full rounded-full ${
                  faculty.status === 'Overloaded' ? 'bg-red-500 w-[95%]' :
                  faculty.status === 'Underutilized' ? 'bg-amber-500 w-[40%]' :
                  'bg-blue-500 w-[75%]'
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
