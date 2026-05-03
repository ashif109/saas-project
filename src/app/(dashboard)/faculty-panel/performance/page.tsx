"use client"

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, AlertTriangle, TrendingUp, TrendingDown, Users, ChevronRight, Activity, CheckCircle2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

import api from '@/lib/axios';
import { toast } from 'sonner';

export default function PerformanceTrackerPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchSetup = async () => {
      try {
        const res = await api.get('/api/attendance/faculty-setup');
        setBatches(res.data.batches || []);
        setSubjects(res.data.subjects || []);
        if (res.data.batches?.length) setSelectedBatch(res.data.batches[0].id);
        if (res.data.subjects?.length) setSelectedSubject(res.data.subjects[0].id);
      } catch (err) {
        toast.error("Failed to fetch setup data");
      }
    };
    fetchSetup();
  }, []);

  const fetchPerformance = async () => {
    if (!selectedBatch || !selectedSubject) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/faculty/performance?batchId=${selectedBatch}&subjectId=${selectedSubject}`);
      setAnalytics(res.data.summary);
      setStudents(res.data.roster);
    } catch (error) {
      toast.error("Failed to load performance data");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPerformance();
  }, [selectedBatch, selectedSubject]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.enrollment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Performance Tracker</h1>
            <p className="text-slate-500">Analyze attendance trends and identify at-risk students.</p>
          </div>
          <div className="flex gap-4">
            <Select value={selectedBatch} onValueChange={setSelectedBatch}>
              <SelectTrigger className="w-48 h-11 bg-white"><SelectValue placeholder="Batch" /></SelectTrigger>
              <SelectContent>
                {batches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-48 h-11 bg-white"><SelectValue placeholder="Subject" /></SelectTrigger>
              <SelectContent>
                {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-none shadow-xl shadow-slate-200/40">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1">Class Avg Attendance</p>
                  <h3 className="text-3xl font-black text-slate-800">{analytics?.avgAttendance || 0}%</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-xl shadow-slate-200/40">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1">Class Avg Marks</p>
                  <h3 className="text-3xl font-black text-slate-800">{analytics?.avgMarks || 0}%</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/40 bg-rose-50 border-rose-100">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-rose-600 mb-1">Attendance Defaulters</p>
                  <h3 className="text-3xl font-black text-rose-700">{analytics?.attendanceDefaulters || 0} <span className="text-sm font-medium opacity-70">below 75%</span></h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-rose-200 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/40 bg-amber-50 border-amber-100">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-amber-600 mb-1">Academic Warning</p>
                  <h3 className="text-3xl font-black text-amber-700">{analytics?.academicWarnings || 0} <span className="text-sm font-medium opacity-70">below 50%</span></h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-amber-200 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-xl shadow-slate-200/40">
          <CardHeader className="bg-white border-b border-slate-50 pb-6 flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Student Roster</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search students..." 
                className="pl-10 h-10 bg-slate-50 border-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-4 pl-6 w-1/3">Student</th>
                    <th className="p-4">Overall Attendance</th>
                    <th className="p-4">Internal Marks (Avg)</th>
                    <th className="p-4">Status Flag</th>
                    <th className="p-4 text-right pr-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 group">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">{student.name.substring(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-slate-900">{student.name}</p>
                            <p className="text-xs text-slate-500 font-mono">{student.enrollment}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-2 max-w-[150px]">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className={student.attendance < 75 ? 'text-rose-600' : 'text-emerald-600'}>{student.attendance}%</span>
                            <span className="text-slate-400">100%</span>
                          </div>
                          <Progress value={student.attendance} className={`h-2 ${student.attendance < 75 ? 'bg-rose-100 [&>div]:bg-rose-500' : 'bg-emerald-100 [&>div]:bg-emerald-500'}`} />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-2 max-w-[150px]">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className={student.marksAvg < 50 ? 'text-rose-600' : 'text-blue-600'}>{student.marksAvg}%</span>
                          </div>
                          <Progress value={student.marksAvg} className={`h-2 ${student.marksAvg < 50 ? 'bg-rose-100 [&>div]:bg-rose-500' : 'bg-blue-100 [&>div]:bg-blue-500'}`} />
                        </div>
                      </td>
                      <td className="p-4">
                        {student.status.includes('At Risk') || student.status === 'Warning' ? (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            student.status.includes('At Risk') ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {student.status}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {student.status}
                          </span>
                        )}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <Button variant="ghost" size="sm" className="font-semibold text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700">
                          View Details <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
