import React from 'react';
import { Megaphone, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const notices = [
  { id: 1, title: 'End Semester Examination Schedule published', target: 'All Students', date: '2 hours ago' },
  { id: 2, title: 'Faculty Development Program Registration', target: 'Faculty', date: '1 day ago' },
  { id: 3, title: 'Campus Maintenance Notice - Block B', target: 'Everyone', date: '2 days ago' },
];

export function NoticePanel() {
  return (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Megaphone size={18} className="text-blue-500" />
          Notice Board
        </h3>
        <Link 
          href="/admin/notices/new" 
          className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
        >
          <Plus size={16} />
        </Link>
      </div>
      
      <div className="space-y-4 flex-1">
        {notices.map((notice) => (
          <div key={notice.id} className="group cursor-pointer">
            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
              {notice.title}
            </h4>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                {notice.target}
              </span>
              <span className="text-xs text-slate-400">{notice.date}</span>
            </div>
          </div>
        ))}
      </div>

      <Link 
        href="/admin/notices" 
        className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        View All Notices <ArrowRight size={14} />
      </Link>
    </div>
  );
}
