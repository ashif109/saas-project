import React from 'react';
import { KPICards } from '@/components/dashboard/KPICards';
import { SmartAnalytics } from '@/components/dashboard/SmartAnalytics';
import { ActionCenter } from '@/components/dashboard/ActionCenter';
import { FacultyInsights } from '@/components/dashboard/FacultyInsights';
import { TodaySnapshot } from '@/components/dashboard/TodaySnapshot';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { NoticePanel } from '@/components/dashboard/NoticePanel';
import { RoleOverviewWidget } from '@/components/dashboard/RoleOverviewWidget';
import { QuickActions } from '@/components/dashboard/QuickActions';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
            Monitor real-time metrics, system health, and prioritize tasks.
          </p>
        </div>
        <QuickActions />
      </div>

      {/* KPI Section */}
      <section>
        <KPICards />
      </section>

      {/* Analytics Section */}
      <section>
        <SmartAnalytics />
      </section>

      {/* Action & Awareness Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 flex flex-col h-full">
          <ActionCenter />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-5">
          <TodaySnapshot />
          <RoleOverviewWidget />
        </div>
      </section>

      {/* Deep Insights & Feeds */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <FacultyInsights />
        <NoticePanel />
        <RecentActivity />
      </section>
      
    </div>
  );
}
