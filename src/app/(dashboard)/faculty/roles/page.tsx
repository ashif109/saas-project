"use client";

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RoleAssigner from '@/components/RoleMatrix/RoleAssigner';
import { Users, UsersRound } from 'lucide-react';

export default function FacultyRolesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <UsersRound className="w-8 h-8 text-blue-500" />
              Faculty & Role Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Assign robust access hierarchies to faculty members securely.
            </p>
          </div>
        </div>

        <section className="grid grid-cols-1 gap-6">
          <RoleAssigner userName="Dr. Sarah Smith" userEmail="sarah.smith@college.edu" />
        </section>
      </div>
    </DashboardLayout>
  );
}
