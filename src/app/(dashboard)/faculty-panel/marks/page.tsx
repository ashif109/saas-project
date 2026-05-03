"use client"

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Users, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import api from '@/lib/axios';

export default function FacultyMarksPage() {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [marksData, setMarksData] = useState<Record<string, string>>({});
  
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examName, setExamName] = useState('');
  const [maxMarks, setMaxMarks] = useState('100');

  const [batches, setBatches] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchSetup = async () => {
      try {
        const res = await api.get('/api/attendance/faculty-setup');
        setBatches(res.data.batches || []);
        setSubjects(res.data.subjects || []);
      } catch (err) {
        toast.error("Failed to fetch setup data");
      }
    };
    fetchSetup();
  }, []);

  const fetchStudents = async () => {
    if (!selectedBatch || !selectedSubject || !examName) return toast.error("Please fill all configuration fields");
    setLoading(true);
    try {
      const res = await api.get(`/api/attendance/students?batchId=${selectedBatch}`);
      setStudents(res.data);
      
      // Fetch existing marks if any
      const marksRes = await api.get(`/api/marks?subjectId=${selectedSubject}&batchId=${selectedBatch}&examName=${examName}`);
      const existingMarks: Record<string, string> = {};
      marksRes.data.data.forEach((m: any) => {
          existingMarks[m.studentId] = m.marksObtained.toString();
      });
      setMarksData(existingMarks);
    } catch (error) {
      toast.error("Failed to load students or marks");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedSubject || !selectedBatch || !examName) return toast.error("Missing configuration");
    const savingToast = toast.loading("Saving marks...");
    try {
      await api.post('/api/marks/bulk', {
          subjectId: selectedSubject,
          batchId: selectedBatch,
          examName,
          maxMarks: parseFloat(maxMarks),
          marksData
      });
      toast.success("Internal marks saved successfully!", { id: savingToast });
    } catch (error) {
      toast.error("Failed to save marks", { id: savingToast });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Internal Marks Entry</h1>
          <p className="text-slate-500">Enter CIE marks, assignment scores, and quiz results</p>
        </div>

        <Card className="border-none shadow-xl shadow-slate-200/40">
          <CardHeader className="bg-white border-b border-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Batch</Label>
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Batch" /></SelectTrigger>
                  <SelectContent>
                    {batches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Subject" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Exam Type</Label>
                <Select value={examName} onValueChange={setExamName}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Exam" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mid1">Midterm 1</SelectItem>
                    <SelectItem value="mid2">Midterm 2</SelectItem>
                    <SelectItem value="quiz1">Quiz 1</SelectItem>
                    <SelectItem value="assignment1">Assignment 1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Max Marks</Label>
                <Input type="number" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} className="h-11" />
              </div>
              <div className="flex items-end">
                <Button onClick={fetchStudents} disabled={loading} className="w-full h-11 bg-indigo-600 hover:bg-indigo-700">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Filter className="h-4 w-4 mr-2" />}
                  Fetch List
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {students.length > 0 && (
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="p-4">Enrollment No.</th>
                      <th className="p-4">Student Name</th>
                      <th className="p-4 w-48">Marks Obtained (out of {maxMarks})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-mono text-slate-500">{student.enrollmentNo}</td>
                        <td className="p-4 font-bold text-slate-900">{student.name}</td>
                        <td className="p-4">
                          <Input 
                            type="number" 
                            max={maxMarks}
                            min="0"
                            className="w-full h-10 font-bold" 
                            placeholder="Score"
                            value={marksData[student.id] || ''}
                            onChange={(e) => setMarksData({...marksData, [student.id]: e.target.value})}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 h-11 px-8 rounded-xl font-bold shadow-lg shadow-indigo-600/20">
                  <Save className="h-4 w-4 mr-2" /> Save Draft & Lock
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
