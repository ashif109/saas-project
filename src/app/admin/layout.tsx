"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, 
  Users, 
  BookOpen, 
  CalendarDays, 
  GraduationCap, 
  CreditCard, 
  BellRing, 
  LayoutDashboard,
  Menu,
  Moon,
  Sun,
  LogOut,
  Settings
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Role Management', href: '/admin/roles', icon: Users },
  { name: 'Academic Setup', href: '/admin/setup', icon: Building2 },
  { name: 'Students', href: '/admin/students', icon: GraduationCap },
  { name: 'Faculty', href: '/admin/faculty', icon: BookOpen },
  { name: 'Timetable', href: '/admin/timetable', icon: CalendarDays },
  { name: 'Fees & Finances', href: '/admin/fees', icon: CreditCard },
  { name: 'Notices', href: '/admin/notices', icon: BellRing },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 flex overflow-hidden`}>
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0 cursor-pointer'
        } fixed md:relative z-50 h-screen transition-all duration-300 ease-in-out bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                PulseDesk
              </span>
            </div>
          ) : (
             <div className="w-full flex justify-center" onClick={() => setIsSidebarOpen(true)}>
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
               </div>
             </div>
          )}
          
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="md:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 font-medium' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
                title={!isSidebarOpen ? item.name : ''}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                {isSidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50`}>
            <Settings className="w-5 h-5" />
            {isSidebarOpen && <span>Settings</span>}
          </button>
          <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20`}>
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex shrink-0 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hidden md:block" // Hidden on mobile, handled by inner button
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Context aware title could go here */}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
               <div className="text-right hidden sm:block">
                 <p className="text-sm font-medium text-slate-900 dark:text-white">Admin User</p>
                 <p className="text-xs text-slate-500 dark:text-slate-400">admin@college.edu</p>
               </div>
               <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 border flex items-center justify-center border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold">
                 A
               </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6 scroll-smooth">
           {children}
        </div>
      </main>
    </div>
  );
}
