"use client"

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar as CalendarIcon, MapPin, Users, BookOpen, Loader2 } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import api from '@/lib/axios';

export default function FacultyTimetablePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [timetableData, setTimetableData] = useState<Record<string, any[]>>({
    'Monday': [], 'Tuesday': [], 'Wednesday': [], 'Thursday': [], 'Friday': [], 'Saturday': []
  });

  const weekDays = Array.from({ length: 6 }).map((_, i) => addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i));

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await api.get('/api/timetable');
        
        const grouped: Record<string, any[]> = {
          'Monday': [], 'Tuesday': [], 'Wednesday': [], 'Thursday': [], 'Friday': [], 'Saturday': []
        };

        res.data.forEach((entry: any) => {
          if (grouped[entry.dayOfWeek]) {
            grouped[entry.dayOfWeek].push({
              time: `${entry.startTime} - ${entry.endTime}`,
              type: entry.subject?.name?.toLowerCase().includes('lab') ? 'Lab' : 'Lecture',
              subject: entry.subject?.name || 'Unknown',
              room: entry.roomInfo || 'TBD',
              batch: `${entry.batch?.course?.name || ''} ${entry.batch?.name || ''}`.trim() || 'Unknown Batch'
            });
          }
        });

        Object.keys(grouped).forEach(day => {
          grouped[day].sort((a, b) => a.time.localeCompare(b.time));
        });

        setTimetableData(grouped);
      } catch (error) {
        console.error("Failed to fetch timetable", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  const todayStr = format(currentDate, 'EEEE');

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Timetable</h1>
          <p className="text-slate-500">Your personalized academic schedule for the week.</p>
        </div>

        {loading ? (
          <div className="h-[40vh] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-slate-500 font-bold animate-pulse">Loading schedule...</p>
          </div>
        ) : (

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {weekDays.map((day, idx) => {
            const dayName = format(day, 'EEEE');
            const dateNum = format(day, 'dd');
            const isToday = dayName === todayStr;
            const classes = timetableData[dayName as keyof typeof timetableData] || [];

            return (
              <div key={idx} className={`flex flex-col gap-4 ${isToday ? 'lg:col-span-2' : 'lg:col-span-1'}`}>
                <div className={`p-4 rounded-2xl text-center ${isToday ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white border border-slate-100'}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider ${isToday ? 'text-indigo-200' : 'text-slate-400'}`}>{dayName.substring(0,3)}</p>
                  <p className={`text-3xl font-black mt-1 ${isToday ? 'text-white' : 'text-slate-800'}`}>{dateNum}</p>
                </div>

                <div className="flex-1 space-y-4">
                  {classes.length > 0 ? (
                    classes.map((cls, cIdx) => (
                      <div key={cIdx} className={`p-4 rounded-2xl border ${
                        cls.type === 'Lab' ? 'bg-amber-50 border-amber-100' : 
                        cls.type === 'Doubt Session' ? 'bg-emerald-50 border-emerald-100' : 
                        'bg-blue-50 border-blue-100'
                      }`}>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md mb-2 inline-block ${
                          cls.type === 'Lab' ? 'bg-amber-200 text-amber-800' : 
                          cls.type === 'Doubt Session' ? 'bg-emerald-200 text-emerald-800' : 
                          'bg-blue-200 text-blue-800'
                        }`}>
                          {cls.type}
                        </span>
                        <h4 className="font-bold text-slate-900 leading-tight mb-2">{cls.subject}</h4>
                        
                        <div className="space-y-1.5 mt-3">
                          <p className="text-xs font-medium text-slate-600 flex items-center gap-2">
                            <CalendarIcon className="h-3.5 w-3.5 opacity-70" /> {cls.time}
                          </p>
                          <p className="text-xs font-medium text-slate-600 flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 opacity-70" /> {cls.room}
                          </p>
                          <p className="text-xs font-medium text-slate-600 flex items-center gap-2">
                            <Users className="h-3.5 w-3.5 opacity-70" /> {cls.batch}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full min-h-[100px] border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center bg-slate-50/50">
                      <p className="text-xs font-bold text-slate-400">No Classes</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </DashboardLayout>
  );
}
