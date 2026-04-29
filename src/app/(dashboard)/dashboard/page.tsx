"use client"

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/store/useAuthStore';
import { KPICards } from '@/components/dashboard/KPICards';
import { SmartAnalytics } from '@/components/dashboard/SmartAnalytics';
import { ActionCenter } from '@/components/dashboard/ActionCenter';
import { FacultyInsights } from '@/components/dashboard/FacultyInsights';
import { TodaySnapshot } from '@/components/dashboard/TodaySnapshot';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { NoticePanel } from '@/components/dashboard/NoticePanel';
import { RoleOverviewWidget } from '@/components/dashboard/RoleOverviewWidget';
import { QuickActions } from '@/components/dashboard/QuickActions';
import api from '@/lib/axios';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/api/dashboard/summary');
      setData(res.data);
    } catch (err) {
      console.error("Dashboard data fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          <p className="text-slate-500 font-bold animate-pulse">Syncing institutional intelligence...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="relative space-y-10 max-w-7xl mx-auto pb-20 px-4 sm:px-6 animate-in fade-in duration-1000">
        
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 -z-10 opacity-10 pointer-events-none">
            <div className="w-[600px] h-[600px] bg-indigo-200 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/4" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold mb-2 uppercase tracking-[0.2em] text-[10px]">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                Live Command Center
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Pulse Intelligence</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-bold flex items-center gap-2">
              Welcome, <span className="text-slate-900 dark:text-white underline decoration-indigo-500/30 underline-offset-8">{user?.name || 'Institutional Admin'}</span> 
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              Viewing <span className="text-indigo-600">{user?.college?.name || 'PulseDesk Managed'}</span> Ecosystem
            </p>
          </div>
          <QuickActions />
        </div>

        <section>
          <KPICards data={data?.kpis} />
        </section>

        <section>
          <SmartAnalytics 
            distributionData={data?.distribution} 
            attendanceTrendData={data?.attendanceTrend} 
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 flex flex-col h-full">
            <ActionCenter data={data?.actionCenter} />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-5">
            <TodaySnapshot data={data?.snapshot} />
            <RoleOverviewWidget data={data?.roles} />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <FacultyInsights data={data?.facultyInsights} />
          <NoticePanel data={data?.notices} />
          <RecentActivity data={data?.activity} />
        </section>
        
      </div>
    </DashboardLayout>
  );
}