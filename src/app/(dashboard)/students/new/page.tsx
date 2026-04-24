import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { UserPlus } from 'lucide-react';

export default function AddStudentPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              <UserPlus className="w-8 h-8 text-blue-500" />
              Register New Student
            </h1>
            <p className="text-slate-500 mt-2">
              Fill out the details to enroll a new student into the system.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center h-64 text-slate-500">
          <p>Student Registration Form will be built here.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
