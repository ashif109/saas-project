import React from 'react';
import { Plus, UserPlus, FileText, Settings, Megaphone } from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link 
        href="/students/new"
        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
      >
        <UserPlus size={16} />
        <span>Add Student</span>
      </Link>
      
      <Link 
        href="/notices"
        className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
      >
        <Megaphone size={16} />
        <span>Publish Notice</span>
      </Link>
      
      <Link 
        href="/timetable"
        className="hidden sm:flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
      >
        <FileText size={16} />
        <span>Timetable</span>
      </Link>
      
      <Link 
        href="/academic-setup"
        className="p-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-700 rounded-xl transition-colors shadow-sm"
        aria-label="Setup Academic Session"
        title="Setup Academic Session"
      >
        <Settings size={18} />
      </Link>
    </div>
  );
}
