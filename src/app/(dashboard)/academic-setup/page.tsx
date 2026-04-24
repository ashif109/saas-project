"use client";

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Calendar, Layers, BookOpen, Clock, Plus, Settings2 } from 'lucide-react';

export default function AcademicSetupPage() {
  const [activeTab, setActiveTab] = useState('years');

  const tabs = [
    { id: 'years', label: 'Academic Years', icon: Calendar },
    { id: 'courses', label: 'Courses & Degrees', icon: BookOpen },
    { id: 'batches', label: 'Batch Management', icon: Layers },
    { id: 'terms', label: 'Semesters / Terms', icon: Clock },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <Settings2 className="w-8 h-8 text-blue-500" />
              Academic Setup
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Configure your institutional structure, timelines, and academic requirements here.
            </p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm">
            <Plus size={16} />
            Create New {tabs.find(t => t.id === activeTab)?.label.split(' ')[0]}
          </button>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-4 pt-4 hide-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-400' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-300'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 min-h-[400px]">
            {activeTab === 'years' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/10 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300">2023 - 2024 (Active)</h3>
                    <p className="text-sm text-blue-700/80 dark:text-blue-400/80">Jul 1, 2023 - Jun 30, 2024</p>
                  </div>
                  <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Current</span>
                </div>
                
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-300">2024 - 2025</h3>
                    <p className="text-sm text-slate-500">Jul 1, 2024 - Jun 30, 2025</p>
                  </div>
                  <span className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Draft</span>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3 py-10">
                <BookOpen size={48} className="text-slate-200 dark:text-slate-800" />
                <p>No courses defined yet. Click "Create New Course" to start.</p>
              </div>
            )}

            {activeTab === 'batches' && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3 py-10">
                <Layers size={48} className="text-slate-200 dark:text-slate-800" />
                <p>Batch management helps you map students to their respective years and courses.</p>
              </div>
            )}
            
             {activeTab === 'terms' && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3 py-10">
                <Clock size={48} className="text-slate-200 dark:text-slate-800" />
                <p>Configure Semesters (Odd/Even) within your chosen academic year.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
