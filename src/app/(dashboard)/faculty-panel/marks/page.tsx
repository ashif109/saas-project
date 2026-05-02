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

export default function FacultyMarksPage() {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [marksData, setMarksData] = useState<Record<string, string>>({});
  
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examName, setExamName] = useState('');
  const [maxMarks, setMaxMarks] = useState('100');

  const fetchStudents = async () => {
    if (!selectedBatch || !selectedSubject || !examName) return toast.error("Please fill all configuration fields");
    setLoading(true);
    setTimeout(() => {
      const mockStudents = [
        { id: '1', name: 'Alex Johnson', enrollmentNo: 'CS23001' },
        { id: '2', name: 'Sarah Williams', enrollmentNo: 'CS23002' },
        { id: '3', name: 'Michael Brown', enrollmentNo: 'CS23003' },
      ];
      setStudents(mockStudents);
      setLoading(false);
    }, 600);
  };

  const handleSave = async () => {
    const savingToast = toast.loading("Saving marks...");
    setTimeout(() => {
      toast.success("Internal marks saved successfully!", { id: savingToast });
    }, 800);
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
                    <SelectItem value="b1">CS 2nd Year</SelectItem>
                    <SelectItem value="b2">IT 3rd Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Subject" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="s1">Data Structures</SelectItem>
                    <SelectItem value="s2">Algorithms</SelectItem>
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
