"use client"

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Loader2, Save, Users, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';

export default function FacultyAttendancePage() {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  
  // Filters
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  
  const [batches, setBatches] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchSetup = async () => {
      try {
        const res = await api.get('/api/attendance/faculty-setup');
        setBatches(res.data.batches || []);
        setSubjects(res.data.subjects || []);
      } catch (err) {
        toast.error("Failed to fetch batches and subjects");
      }
    };
    fetchSetup();
  }, []);

  const fetchStudents = async () => {
    if (!selectedBatch) return toast.error("Please select a batch first");
    setLoading(true);
    try {
      const res = await api.get(`/api/attendance/students?batchId=${selectedBatch}`);
      setStudents(res.data);
      const initialData: Record<string, string> = {};
      res.data.forEach((s: any) => initialData[s.id] = 'PRESENT');
      setAttendanceData(initialData);
    } catch (error) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const markStatus = (studentId: string, status: string) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: string) => {
    const newData: Record<string, string> = {};
    students.forEach(s => newData[s.id] = status);
    setAttendanceData(newData);
  };

  const handleSave = async () => {
    if (!selectedSubject) return toast.error("Please select a subject");
    if (!selectedBatch) return toast.error("Please select a batch");
    
    const savingToast = toast.loading("Saving attendance...");
    try {
      await api.post('/api/attendance/bulk', { 
        date, 
        subjectId: selectedSubject, 
        batchId: selectedBatch, 
        attendance: attendanceData 
      });
      toast.success("Attendance saved successfully!", { id: savingToast });
    } catch (error) {
      toast.error("Failed to save attendance", { id: savingToast });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Smart Attendance</h1>
          <p className="text-slate-500">Fast, one-tap attendance marking for your daily lectures.</p>
        </div>

        <Card className="border-none shadow-xl shadow-slate-200/40">
          <CardHeader className="bg-white border-b border-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="pl-10 h-11" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Batch</Label>
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Select Batch" /></SelectTrigger>
                  <SelectContent>
                    {batches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={fetchStudents} disabled={loading} className="w-full h-11 bg-indigo-600 hover:bg-indigo-700">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Users className="h-4 w-4 mr-2" />}
                  Load Students
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {students.length > 0 && (
            <CardContent className="p-0">
              <div className="p-4 bg-slate-50 flex items-center justify-between border-b border-slate-100">
                <span className="font-semibold text-slate-700">Quick Actions:</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => markAll('PRESENT')} className="text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100">Mark All Present</Button>
                  <Button variant="outline" size="sm" onClick={() => markAll('ABSENT')} className="text-rose-600 border-rose-200 bg-rose-50 hover:bg-rose-100">Mark All Absent</Button>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {students.map((student) => (
                  <div key={student.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-slate-200 text-slate-700 font-bold">
                          {student.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-slate-900">{student.name}</p>
                        <p className="text-sm text-slate-500 font-mono">{student.enrollmentNo}</p>
                      </div>
                    </div>
                    
                    <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                      <button 
                        onClick={() => markStatus(student.id, 'PRESENT')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${attendanceData[student.id] === 'PRESENT' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
                      >
                        <CheckCircle2 className="h-4 w-4" /> Present
                      </button>
                      <button 
                        onClick={() => markStatus(student.id, 'LATE')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${attendanceData[student.id] === 'LATE' ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
                      >
                        <Clock className="h-4 w-4" /> Late
                      </button>
                      <button 
                        onClick={() => markStatus(student.id, 'ABSENT')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${attendanceData[student.id] === 'ABSENT' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
                      >
                        <XCircle className="h-4 w-4" /> Absent
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-white border-t border-slate-100 flex justify-between items-center">
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-black text-emerald-500">{Object.values(attendanceData).filter(v => v === 'PRESENT').length}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase">Present</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-amber-500">{Object.values(attendanceData).filter(v => v === 'LATE').length}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase">Late</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-rose-500">{Object.values(attendanceData).filter(v => v === 'ABSENT').length}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase">Absent</p>
                  </div>
                </div>
                <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 rounded-xl font-bold shadow-lg shadow-indigo-600/20">
                  <Save className="h-5 w-5 mr-2" /> Submit Attendance
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
