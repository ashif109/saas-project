"use client"

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Calendar as CalendarIcon, Users, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function AssignmentsPage() {
  const [open, setOpen] = useState(false);
  const [assignments, setAssignments] = useState([
    { id: '1', title: 'Trees and Graphs Analysis', subject: 'Data Structures', dueDate: '2026-05-10', submissions: 45, total: 60, status: 'Active' },
    { id: '2', title: 'Dynamic Programming Project', subject: 'Algorithms', dueDate: '2026-04-28', submissions: 58, total: 60, status: 'Grading Pending' }
  ]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Assignment created and published to students!");
    setOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Assignment Management</h1>
            <p className="text-slate-500">Upload assignment PDFs, set deadlines, and track submissions.</p>
          </div>
          <Button onClick={() => setOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 h-11 px-6 shadow-lg shadow-indigo-600/20">
            <Plus className="h-4 w-4 mr-2" /> New Assignment
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map(assignment => (
            <Card key={assignment.id} className="border-none shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">{assignment.title}</h3>
                    <p className="text-sm font-semibold text-indigo-500">{assignment.subject}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${assignment.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {assignment.status}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Due Date</p>
                      <p className="font-semibold text-slate-700 text-sm">{assignment.dueDate}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-3">
                    <Users className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Submissions</p>
                      <p className="font-semibold text-slate-700 text-sm">{assignment.submissions} / {assignment.total}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-8 w-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                        S{i}
                      </div>
                    ))}
                    <div className="h-8 w-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                      +{assignment.submissions - 3}
                    </div>
                  </div>
                  <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold">
                    Grade Submissions <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl border-none shadow-2xl">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Create New Assignment</DialogTitle>
              <DialogDescription>Distribute coursework to a specific batch and set evaluation parameters.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Assignment Title</Label>
                <Input required placeholder="e.g. Midterm Lab Project" className="h-11" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select required>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="s1">Data Structures</SelectItem>
                      <SelectItem value="s2">Algorithms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="datetime-local" required className="h-11" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Instructions / Description</Label>
                <Textarea placeholder="Provide any specific guidelines or resources..." className="resize-none h-24" />
              </div>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="h-12 w-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="font-bold text-slate-700">Click or drag PDF to upload</p>
                <p className="text-xs text-slate-500 mt-1">Maximum file size 10MB</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Publish Assignment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
