"use client";

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Users, Filter } from 'lucide-react';

export default function AdmissionsPipelinePage() {
  const columns = [
    { title: 'New Leads', count: 12, color: 'border-blue-500', bg: 'bg-blue-50' },
    { title: 'Document Review', count: 5, color: 'border-amber-500', bg: 'bg-amber-50' },
    { title: 'Interviewing', count: 8, color: 'border-purple-500', bg: 'bg-purple-50' },
    { title: 'Enrolled', count: 42, color: 'border-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl h-full animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-500" />
              Admission Pipeline
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Track and manage incoming student applications through stages.
            </p>
          </div>
          <button className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-slate-50 shadow-sm">
            <Filter size={16} />
            Filter by Course
          </button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 h-[600px]">
          {columns.map((col, idx) => (
            <div key={idx} className="flex-none w-80 flex flex-col bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className={`p-4 border-t-4 ${col.color} bg-white dark:bg-slate-950 flex justify-between items-center border-b border-slate-200 dark:border-slate-800 shadow-sm`}>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wide">{col.title}</h3>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-2 py-1 rounded-lg">
                  {col.count}
                </span>
              </div>
              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                <div className="bg-white dark:bg-slate-950 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-blue-400 transition-colors">
                  <p className="font-medium text-sm text-slate-900 dark:text-white">Alice Doe</p>
                  <p className="text-xs text-slate-500 mt-1">Applied for B.Tech CSE</p>
                  <p className="text-[10px] text-slate-400 mt-2">2 days ago</p>
                </div>
                {/* Empty slots placeholders */}
                <div className="h-24 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 opacity-50"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
