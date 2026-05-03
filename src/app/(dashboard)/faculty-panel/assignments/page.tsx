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

import api from '@/lib/axios';

export default function AssignmentsPage() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  
  const [batches, setBatches] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/api/assignments');
      // getAssignments returns { success: true, data: [] }
      setAssignments(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAssignments();
    
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const creatingToast = toast.loading("Creating assignment...");
    try {
      await api.post('/api/assignments', {
          title,
          subjectId: selectedSubject,
          dueDate,
          description
      });
      toast.success("Assignment created and published!", { id: creatingToast });
      setOpen(false);
      fetchAssignments();
      // Reset form
      setTitle('');
      setSelectedSubject('');
      setDueDate('');
      setDescription('');
    } catch (err) {
      toast.error("Failed to create assignment", { id: creatingToast });
    }
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
                    <p className="text-sm font-semibold text-indigo-500">{assignment.subject?.name}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${new Date(assignment.dueDate) > new Date() ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {new Date(assignment.dueDate) > new Date() ? 'Active' : 'Closed'}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Due Date</p>
                      <p className="font-semibold text-slate-700 text-sm">{new Date(assignment.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-3">
                    <Users className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Submissions</p>
                      <p className="font-semibold text-slate-700 text-sm">{assignment._count?.submissions || 0}</p>
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
                      ?
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
                <Input required placeholder="e.g. Midterm Lab Project" className="h-11" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select required value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="datetime-local" required className="h-11" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Instructions / Description</Label>
                <Textarea placeholder="Provide any specific guidelines or resources..." className="resize-none h-24" value={description} onChange={e => setDescription(e.target.value)} />
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
