"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Calendar, Layers, BookOpen, Clock, Plus, Settings2, Loader2, Info, MoreVertical, Edit2, Trash2, GraduationCap, Building2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function AcademicSetupPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('years');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Data State
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  // Dialog State
  const [openYearDialog, setOpenYearDialog] = useState(false);
  const [openCourseDialog, setOpenCourseDialog] = useState(false);
  const [openBatchDialog, setOpenBatchDialog] = useState(false);
  
  // Edit State
  const [editingItem, setEditingItem] = useState<any>(null);

  // Forms
  const [yearForm, setYearForm] = useState({ name: '', startDate: '', endDate: '' });
  const [courseForm, setCourseForm] = useState({ name: '', duration: '4', departmentId: '' });
  const [batchForm, setBatchForm] = useState({ name: '', courseId: '', academicYearId: '' });

  const tabs = [
    { id: 'years', label: 'Academic Years', icon: Calendar },
    { id: 'courses', label: 'Courses & Degrees', icon: BookOpen },
    { id: 'batches', label: 'Batch Management', icon: Layers },
    { id: 'terms', label: 'Semesters / Terms', icon: Clock },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [yrs, crs, btc, dpt] = await Promise.all([
        api.get('/api/academic-years'),
        api.get('/api/setup/courses'),
        api.get('/api/setup/batches'),
        api.get('/api/departments')
      ]);
      setAcademicYears(yrs.data);
      setCourses(crs.data);
      setBatches(btc.data);
      setDepartments(dpt.data);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to load data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleYearSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await api.put(`/api/academic-years/${editingItem.id}`, yearForm);
        toast({ title: "Updated", description: "Academic year updated." });
      } else {
        await api.post('/api/academic-years', yearForm);
        toast({ title: "Success", description: "Academic year created." });
      }
      setOpenYearDialog(false);
      fetchData();
    } catch (err: any) {
      toast({ title: "Failed", description: err.response?.data?.message || "Error occurred.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await api.put(`/api/setup/courses/${editingItem.id}`, courseForm);
      } else {
        await api.post('/api/setup/courses', courseForm);
      }
      setOpenCourseDialog(false);
      fetchData();
      toast({ title: "Success", description: "Course configuration saved." });
    } catch (err: any) {
      toast({ title: "Error", description: "Action failed.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await api.put(`/api/setup/batches/${editingItem.id}`, batchForm);
      } else {
        await api.post('/api/setup/batches', batchForm);
      }
      setOpenBatchDialog(false);
      fetchData();
      toast({ title: "Success", description: "Batch created successfully." });
    } catch (err) {
      toast({ title: "Error", description: "Action failed.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteItem = async (type: string, id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      const endpoint = type === 'year' ? `/api/academic-years/${id}` : `/api/setup/${type}s/${id}`;
      await api.delete(endpoint);
      toast({ title: "Deleted", description: "Item removed successfully." });
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 rounded-2xl">
                <Settings2 className="w-8 h-8 text-blue-600" />
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Academic Setup</h1>
                <p className="text-slate-500 mt-1">Manage institutional structure and academic configurations.</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {activeTab === 'years' && (
                <Button onClick={() => { setEditingItem(null); setYearForm({ name: '', startDate: '', endDate: '' }); setOpenYearDialog(true); }} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 px-6 py-6 rounded-2xl font-bold">
                    <Plus className="mr-2 h-5 w-5" /> New Session
                </Button>
            )}
            {activeTab === 'courses' && (
                <Button onClick={() => { setEditingItem(null); setCourseForm({ name: '', duration: '4', departmentId: '' }); setOpenCourseDialog(true); }} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 px-6 py-6 rounded-2xl font-bold">
                    <Plus className="mr-2 h-5 w-5" /> Add Course
                </Button>
            )}
            {activeTab === 'batches' && (
                <Button onClick={() => { setEditingItem(null); setBatchForm({ name: '', courseId: '', academicYearId: '' }); setOpenBatchDialog(true); }} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 px-6 py-6 rounded-2xl font-bold">
                    <Plus className="mr-2 h-5 w-5" /> Create Batch
                </Button>
            )}
          </div>
        </div>

        {/* Dialogs */}
        <Dialog open={openYearDialog} onOpenChange={setOpenYearDialog}>
            <DialogContent className="border-none shadow-2xl">
                <form onSubmit={handleYearSubmit}>
                    <DialogHeader><DialogTitle className="text-2xl font-bold">{editingItem ? 'Edit Session' : 'New Academic Session'}</DialogTitle></DialogHeader>
                    <div className="grid gap-6 py-6">
                        <div className="space-y-2">
                            <Label>Session Name</Label>
                            <Input placeholder="e.g. 2024-2025" required value={yearForm.name} onChange={(e) => setYearForm({...yearForm, name: e.target.value})} className="h-11" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Start Date</Label><Input type="date" required value={yearForm.startDate} onChange={(e) => setYearForm({...yearForm, startDate: e.target.value})} className="h-11" /></div>
                            <div className="space-y-2"><Label>End Date</Label><Input type="date" required value={yearForm.endDate} onChange={(e) => setYearForm({...yearForm, endDate: e.target.value})} className="h-11" /></div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 w-full">{submitting && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Save Session</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        <Dialog open={openCourseDialog} onOpenChange={setOpenCourseDialog}>
            <DialogContent className="border-none shadow-2xl">
                <form onSubmit={handleCourseSubmit}>
                    <DialogHeader><DialogTitle className="text-2xl font-bold">Configure Course</DialogTitle></DialogHeader>
                    <div className="grid gap-6 py-6">
                        <div className="space-y-2">
                            <Label>Course Name</Label>
                            <Input placeholder="e.g. B.Tech Computer Science" required value={courseForm.name} onChange={(e) => setCourseForm({...courseForm, name: e.target.value})} className="h-11" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Duration (Years)</Label>
                                <Select value={courseForm.duration} onValueChange={(v) => setCourseForm({...courseForm, duration: v})}>
                                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="1">1 Year</SelectItem><SelectItem value="2">2 Years</SelectItem><SelectItem value="3">3 Years</SelectItem><SelectItem value="4">4 Years</SelectItem><SelectItem value="5">5 Years</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Department</Label>
                                <Select value={courseForm.departmentId} onValueChange={(v) => setCourseForm({...courseForm, departmentId: v})}>
                                    <SelectTrigger className="h-11"><SelectValue placeholder="Select Dept" /></SelectTrigger>
                                    <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter><Button type="submit" disabled={submitting} className="bg-blue-600 w-full">Save Course</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        <Dialog open={openBatchDialog} onOpenChange={setOpenBatchDialog}>
            <DialogContent className="border-none shadow-2xl">
                <form onSubmit={handleBatchSubmit}>
                    <DialogHeader><DialogTitle className="text-2xl font-bold">Create Batch</DialogTitle></DialogHeader>
                    <div className="grid gap-6 py-6">
                        <div className="space-y-2">
                            <Label>Batch Name</Label>
                            <Input placeholder="e.g. 2024 Batch" required value={batchForm.name} onChange={(e) => setBatchForm({...batchForm, name: e.target.value})} className="h-11" />
                        </div>
                        <div className="space-y-2">
                            <Label>Course</Label>
                            <Select value={batchForm.courseId} onValueChange={(v) => setBatchForm({...batchForm, courseId: v})}>
                                <SelectTrigger className="h-11"><SelectValue placeholder="Select Course" /></SelectTrigger>
                                <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Academic Year</Label>
                            <Select value={batchForm.academicYearId} onValueChange={(v) => setBatchForm({...batchForm, academicYearId: v})}>
                                <SelectTrigger className="h-11"><SelectValue placeholder="Select Session" /></SelectTrigger>
                                <SelectContent>{academicYears.map(y => <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter><Button type="submit" disabled={submitting} className="bg-blue-600 w-full">Create Batch</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="flex overflow-x-auto border-b border-slate-100 bg-slate-50/30 px-6 pt-6 gap-2">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all rounded-t-2xl ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-[0_-4px_0_0_#2563eb] border-x border-t border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>
                <tab.icon size={18} /> {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8 min-h-[500px]">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-40"><Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" /><p className="text-slate-400 font-medium">Synchronizing academic data...</p></div>
            ) : (
                <>
                {activeTab === 'years' && (
                    <div className="grid grid-cols-1 gap-4">
                        {academicYears.map((year, idx) => (
                            <div key={year.id} className={`p-6 rounded-2xl border-2 flex items-center justify-between group ${idx === 0 ? 'border-blue-100 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${idx === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}><Calendar className="w-6 h-6" /></div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900">{year.name} {idx === 0 && "(Active)"}</h3>
                                        <p className="text-sm text-slate-500 font-medium">{new Date(year.startDate).toLocaleDateString()} - {new Date(year.endDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge className={idx === 0 ? "bg-blue-600" : "bg-slate-200 text-slate-600"}>{idx === 0 ? "CURRENT" : "DRAFT"}</Badge>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => { setEditingItem(year); setYearForm({ name: year.name, startDate: year.startDate.split('T')[0], endDate: year.endDate.split('T')[0] }); setOpenYearDialog(true); }}><Edit2 className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => deleteItem('year', year.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'courses' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {courses.length === 0 ? <p className="col-span-full text-center py-20 text-slate-400">No courses defined.</p> : courses.map(course => (
                            <Card key={course.id} className="border-none shadow-lg shadow-slate-200/40 rounded-3xl overflow-hidden group">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600"><GraduationCap className="w-6 h-6" /></div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => { setEditingItem(course); setCourseForm({ name: course.name, duration: course.duration.toString(), departmentId: course.departmentId }); setOpenCourseDialog(true); }}><Edit2 className="h-4 w-4 mr-2" /> Edit Course</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => deleteItem('course', course.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{course.name}</h3>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {course.duration} Years</span>
                                        <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {course.department?.code}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {activeTab === 'batches' && (
                    <div className="rounded-2xl border border-slate-100 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead className="pl-6">Batch Name</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Academic Session</TableHead>
                                    <TableHead>Students</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {batches.map(batch => (
                                    <TableRow key={batch.id} className="group">
                                        <TableCell className="pl-6 font-bold text-slate-900">{batch.name}</TableCell>
                                        <TableCell>{batch.course?.name}</TableCell>
                                        <TableCell><Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none font-bold">{batch.academicYear?.name}</Badge></TableCell>
                                        <TableCell className="font-medium text-slate-500">{batch._count?.students || 0} Enrolled</TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button variant="ghost" size="icon" onClick={() => deleteItem('batch', batch.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {activeTab === 'terms' && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Clock className="w-16 h-16 opacity-10 mb-4" />
                        <p className="font-bold text-lg text-slate-600">Semester Management</p>
                        <p className="text-sm max-w-xs text-center mt-2">Semesters are automatically generated based on Course duration. Individual term settings coming soon.</p>
                        <div className="mt-8 grid grid-cols-4 gap-4">
                            {[1,2,3,4,5,6,7,8].map(s => <div key={s} className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-100 flex items-center justify-center font-bold text-slate-300">Sem {s}</div>)}
                        </div>
                    </div>
                )}
                </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
