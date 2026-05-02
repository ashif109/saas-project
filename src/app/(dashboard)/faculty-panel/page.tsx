"use client"

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, ClipboardList, Activity, MessageSquare, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import { format } from 'date-fns';

export default function FacultyDashboardPage() {
  const { user } = useAuthStore();
  
  // These would typically be fetched from a summary API
  const stats = [
    { label: "Today's Classes", value: "3", icon: Calendar, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Pending Assignments", value: "12", icon: FileText, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Unresolved Doubts", value: "5", icon: MessageSquare, color: "text-rose-500", bg: "bg-rose-50" },
    { label: "Attendance Marked", value: "2/3", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, {user?.name}</h1>
          <p className="text-slate-500">Here's your academic overview for {format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <Card key={i} className="border-none shadow-xl shadow-slate-200/40">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions / Shortcuts */}
          <Card className="border-none shadow-xl shadow-slate-200/40">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used faculty tools</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Link href="/faculty-panel/attendance" className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors gap-3 group">
                <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <span className="font-semibold text-slate-700">Mark Attendance</span>
              </Link>
              
              <Link href="/faculty-panel/marks" className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors gap-3 group">
                <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity className="h-6 w-6" />
                </div>
                <span className="font-semibold text-slate-700">Internal Marks</span>
              </Link>

              <Link href="/faculty-panel/assignments" className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors gap-3 group">
                <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6" />
                </div>
                <span className="font-semibold text-slate-700">Assignments</span>
              </Link>

              <Link href="/faculty-panel/doubts" className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors gap-3 group">
                <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <span className="font-semibold text-slate-700">Resolve Doubts</span>
              </Link>
            </CardContent>
          </Card>

          {/* Today's Schedule Placeholder */}
          <Card className="border-none shadow-xl shadow-slate-200/40">
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Your upcoming classes and lectures</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: "09:00 AM - 10:00 AM", subject: "Data Structures", room: "Room 101", batch: "CS 2nd Year" },
                  { time: "11:00 AM - 12:30 PM", subject: "Algorithms Lab", room: "Lab 3", batch: "CS 2nd Year" },
                  { time: "02:00 PM - 03:00 PM", subject: "Database Systems", room: "Room 204", batch: "CS 3rd Year" },
                ].map((cls, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/50 transition-colors">
                    <div className="flex gap-4 items-center">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                        {cls.time.split(':')[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{cls.subject}</p>
                        <p className="text-sm text-slate-500">{cls.batch} • {cls.room}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{cls.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
