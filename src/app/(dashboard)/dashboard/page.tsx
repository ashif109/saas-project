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
      <div className="space-y-8 max-w-7xl mx-auto pb-10 animate-in fade-in duration-700">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm font-medium">
              Welcome back, <span className="text-indigo-600 dark:text-indigo-400 font-bold underline decoration-indigo-500/30 underline-offset-4">{user?.name || 'Admin'}</span> — Here's your situational overview.
            </p>
          </div>
          <QuickActions />
        </div>

        <section>
          <KPICards data={data?.kpis} />
        </section>

        <section>
          <SmartAnalytics data={data?.distribution} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 flex flex-col h-full">
            <ActionCenter />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-5">
            <TodaySnapshot />
            <RoleOverviewWidget data={data?.roles} />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <FacultyInsights />
          <NoticePanel data={data?.notices} />
          <RecentActivity data={data?.activity} />
        </section>
        
      </div>
    </DashboardLayout>
  );
}