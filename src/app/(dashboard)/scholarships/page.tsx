"use client"

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { School, Award, Users, Plus, Loader2, Trash2, Edit2, MoreVertical, CheckCircle2, XCircle, Clock, Search, FileText } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ScholarshipsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  
  // Dialog States
  const [openCreate, setOpenCreate] = useState(false);
  const [openApps, setOpenApps] = useState(false);
  const [openApply, setOpenApply] = useState(false);
  
  const [selectedScholarship, setSelectedScholarship] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    type: 'Fixed Amount',
    status: 'ACTIVE'
  });

  const [applyData, setApplyData] = useState({
    studentId: '',
    notes: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schRes, stdRes] = await Promise.all([
        api.get('/api/scholarships'),
        api.get('/api/students/list')
      ]);
      setScholarships(schRes.data);
      setStudents(stdRes.data);
    } catch (err) {
      toast({ title: "Fetch Error", description: "Could not load scholarship data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (selectedScholarship && openCreate) {
        await api.put(`/api/scholarships/${selectedScholarship.id}`, formData);
        toast({ title: "Updated", description: "Scholarship details updated." });
      } else {
        await api.post('/api/scholarships', formData);
        toast({ title: "Published", description: "New scholarship is now active." });
      }
      setOpenCreate(false);
      resetForm();
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: "Action failed.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/scholarships/apply', {
        ...applyData,
        scholarshipId: selectedScholarship.id
      });
      toast({ title: "Success", description: "Student application recorded." });
      setOpenApply(false);
      setApplyData({ studentId: '', notes: '' });
      fetchData();
    } catch (err: any) {
      toast({ title: "Failed", description: err.response?.data?.message || "Application error.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const fetchApplications = async (sch: any) => {
    setSelectedScholarship(sch);
    setOpenApps(true);
    setAppsLoading(true);
    try {
      const res = await api.get(`/api/scholarships/${sch.id}/applications`);
      setApplications(res.data);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load candidates.", variant: "destructive" });
    } finally {
      setAppsLoading(false);
    }
  };

  const updateAppStatus = async (appId: string, status: string) => {
    try {
      await api.put(`/api/scholarships/applications/${appId}`, { status });
      toast({ title: "Status Updated", description: `Application ${status.toLowerCase()}.` });
      // Refresh applications list
      const res = await api.get(`/api/scholarships/${selectedScholarship.id}/applications`);
      setApplications(res.data);
    } catch (err) {
      toast({ title: "Update Failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will remove the scholarship and all related applications.")) return;
    try {
      await api.delete(`/api/scholarships/${id}`);
      toast({ title: "Deleted", description: "Scholarship removed from system." });
      fetchData();
    } catch (err) {
      toast({ title: "Delete Failed", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', amount: '', type: 'Fixed Amount', status: 'ACTIVE' });
    setSelectedScholarship(null);
  };

  const startEdit = (sch: any) => {
    setSelectedScholarship(sch);
    setFormData({
      name: sch.name,
      description: sch.description || '',
      amount: sch.amount.toString(),
      type: sch.type,
      status: sch.status
    });
    setOpenCreate(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Scholarships & Grants</h1>
            <p className="text-slate-500">Manage institutional financial aid and academic merit programs</p>
          </div>
          <Button 
            onClick={() => { resetForm(); setOpenCreate(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 px-6 h-12 rounded-2xl font-bold"
          >
            <Plus className="h-5 w-5 mr-2" /> Create Scholarship
          </Button>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
            <p className="text-slate-400 font-medium">Syncing scholarship records...</p>
          </div>
        ) : scholarships.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <Award className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-bold">No active scholarship programs found.</p>
            <p className="text-slate-400 text-sm">Start by creating your first academic grant.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scholarships.map((sch) => (
              <Card key={sch.id} className="border-none shadow-xl shadow-slate-200/50 hover:scale-[1.02] transition-all rounded-3xl overflow-hidden group bg-white/80 backdrop-blur-sm">
                <div className={`h-1.5 w-full ${sch.status === 'ACTIVE' ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${sch.status === 'ACTIVE' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                      <Award className="h-6 w-6" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-300 hover:text-slate-600">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl border-none shadow-2xl">
                        <DropdownMenuItem onClick={() => startEdit(sch)}><Edit2 className="h-4 w-4 mr-2" /> Edit Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelectedScholarship(sch); setOpenApply(true); }} className="text-indigo-600"><Plus className="h-4 w-4 mr-2" /> Add Candidate</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(sch.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete Program</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900 mb-1">{sch.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold text-[10px]">
                      {sch.type}
                    </Badge>
                    <span className={`text-[10px] uppercase font-black tracking-widest ${sch.status === 'ACTIVE' ? 'text-green-500' : 'text-slate-400'}`}>
                      {sch.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-slate-500 text-sm line-clamp-2 min-h-[2.5rem]">
                    {sch.description || "No description provided for this scholarship program."}
                  </p>
                  
                  <div className="pt-4 border-t border-slate-50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-tighter">
                            <Users className="h-4 w-4" /> {sch._count?.applications || 0} Candidates
                        </div>
                        <p className="text-2xl font-black text-indigo-600">
                            {sch.amount === 0 ? "Full" : `₹${sch.amount.toLocaleString()}`}
                        </p>
                    </div>
                    <Button 
                        onClick={() => fetchApplications(sch)}
                        className="w-full bg-slate-900 hover:bg-slate-800 h-11 rounded-xl font-bold shadow-lg shadow-slate-200"
                    >
                        Manage Applications &rarr;
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogContent className="max-w-xl rounded-3xl border-none shadow-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{selectedScholarship ? 'Update Program' : 'New Scholarship'}</DialogTitle>
                <DialogDescription>Define the criteria and value for this academic grant.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="space-y-2">
                  <Label className="font-bold">Scholarship Name</Label>
                  <Input 
                    placeholder="e.g. Merit-cum-Means Excellence" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="h-11 rounded-xl border-slate-200 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Value (₹)</Label>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      required 
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Grant Type</Label>
                    <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                        <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Full Tuition">Full Tuition</SelectItem>
                            <SelectItem value="Percentage">Percentage %</SelectItem>
                            <SelectItem value="Fixed Amount">Fixed Amount (₹)</SelectItem>
                            <SelectItem value="Annual Grant">Annual Grant</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                    <Label className="font-bold">Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                        <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ACTIVE">ACTIVE (Open for Applications)</SelectItem>
                            <SelectItem value="CLOSED">CLOSED (Process Finished)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Description & Eligibility</Label>
                  <Input 
                    placeholder="Briefly describe requirements..." 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpenCreate(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 px-8 rounded-xl font-bold h-11">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {selectedScholarship ? 'Save Changes' : 'Publish Program'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Manage Applications Modal */}
        <Dialog open={openApps} onOpenChange={setOpenApps}>
            <DialogContent className="max-w-4xl rounded-3xl border-none shadow-2xl overflow-hidden p-0">
                <div className="p-8 bg-slate-900 text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-bold">{selectedScholarship?.name}</h2>
                            <p className="text-slate-400 mt-1">Reviewing {applications.length} candidate applications</p>
                        </div>
                        <Badge className="bg-indigo-500 text-white border-none py-1 px-3">
                            {selectedScholarship?.type}
                        </Badge>
                    </div>
                </div>
                <div className="p-8 max-h-[60vh] overflow-y-auto">
                    {appsLoading ? (
                        <div className="py-20 flex flex-col items-center">
                            <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
                            <p className="text-slate-400">Loading candidate profiles...</p>
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="py-20 text-center text-slate-400">
                            <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p className="font-bold text-slate-500">No applications received yet.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="text-xs font-black uppercase tracking-widest text-slate-400">Candidate</TableHead>
                                    <TableHead className="text-xs font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                                    <TableHead className="text-xs font-black uppercase tracking-widest text-slate-400">Date</TableHead>
                                    <TableHead className="text-xs font-black uppercase tracking-widest text-slate-400 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {applications.map((app) => (
                                    <TableRow key={app.id} className="border-slate-50 group">
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 uppercase">
                                                    {app.student?.user?.firstName.charAt(0)}{app.student?.user?.lastName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{app.student?.user?.firstName} {app.student?.user?.lastName}</p>
                                                    <p className="text-xs text-slate-500">{app.student?.enrollmentNo}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`border-none py-1 px-3 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                app.status === 'APPROVED' ? 'bg-green-100 text-green-600' :
                                                app.status === 'REJECTED' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                                            }`}>
                                                {app.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-500 font-medium">
                                            {new Date(app.appliedDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-50" onClick={() => updateAppStatus(app.id, 'APPROVED')} title="Approve"><CheckCircle2 className="h-4 w-4" /></Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => updateAppStatus(app.id, 'REJECTED')} title="Reject"><XCircle className="h-4 w-4" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
                <div className="p-4 bg-slate-50 flex justify-end gap-2 border-t border-slate-100">
                    <Button variant="ghost" onClick={() => setOpenApps(false)} className="font-bold rounded-xl">Close Dashboard</Button>
                </div>
            </DialogContent>
        </Dialog>

        {/* Add Candidate Modal */}
        <Dialog open={openApply} onOpenChange={setOpenApply}>
            <DialogContent className="max-w-md rounded-3xl border-none shadow-2xl">
                <form onSubmit={handleApply}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Assign Candidate</DialogTitle>
                        <DialogDescription>Manually link a student to {selectedScholarship?.name}.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-6">
                        <div className="space-y-2">
                            <Label className="font-bold">Select Student</Label>
                            <Select required onValueChange={(v) => setApplyData({...applyData, studentId: v})}>
                                <SelectTrigger className="h-11 rounded-xl">
                                    <SelectValue placeholder="Search Student..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {students.map(s => <SelectItem key={s._id} value={s._id}>{s.name} ({s.id})</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold">Internal Notes</Label>
                            <Input 
                                placeholder="Reason for award..." 
                                value={applyData.notes}
                                onChange={(e) => setApplyData({...applyData, notes: e.target.value})}
                                className="h-11 rounded-xl"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={submitting} className="w-full bg-indigo-600 h-12 rounded-xl font-bold shadow-lg shadow-indigo-600/20">
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Record Application
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
