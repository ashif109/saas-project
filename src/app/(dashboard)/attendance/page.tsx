
"use client"

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar as CalendarIcon, Users, CheckCircle2 } from 'lucide-react';

const ATTENDANCE_DATA = [
  { name: 'Mon', value: 92 },
  { name: 'Tue', value: 88 },
  { name: 'Wed', value: 95 },
  { name: 'Thu', value: 91 },
  { name: 'Fri', value: 89 },
];

export default function AttendancePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Attendance Tracking</h1>
          <p className="text-muted-foreground">Monitor student presence across departments</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-none shadow-sm">
            <CardHeader>
              <CardTitle>Weekly Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ATTENDANCE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Academic Calendar</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar className="rounded-md border shadow-none" />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
