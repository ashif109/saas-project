"use client"

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar as CalendarIcon, Users, CheckCircle2, Loader2 } from 'lucide-react';
import api from '@/lib/axios';

export default function AttendancePage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/attendance/stats');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Attendance Analytics</h1>
            <p className="text-slate-500 font-medium mt-1">Monitor student presence across departments in real-time</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="pb-0 pt-8 px-8">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Institutional Attendance Rate
              </CardTitle>
              <CardDescription className="font-medium">Average student presence over the last 5 active days</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-6">
              <div className="h-[350px] w-full mt-4">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
                        <p className="text-slate-400 font-bold">Aggregating attendance data...</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                        <Tooltip 
                            cursor={{fill: '#f8fafc'}}
                            contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                        />
                        <Bar dataKey="value" fill="#4f46e5" radius={[12, 12, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
              <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-indigo-600" />
                    Academic Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center pb-8">
                  <Calendar className="rounded-3xl border-none shadow-sm bg-slate-50 p-4" />
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl shadow-indigo-100 bg-indigo-600 text-white rounded-[2rem]">
                  <CardContent className="p-6 flex items-center gap-4">
                      <div className="p-3 bg-white/10 rounded-2xl">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                          <p className="text-xs font-black uppercase tracking-widest opacity-70">Total Check-ins</p>
                          <p className="text-2xl font-black">1,248 Today</p>
                      </div>
                  </CardContent>
              </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
