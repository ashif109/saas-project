"use client"

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Mail, Phone, MoreVertical, UserCheck, BookOpen, Layers, Settings2, Loader2, Trash2, Edit2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Pagination } from '@/components/shared/Pagination';

export default function FacultyPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [faculties, setFaculties] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  
  // Pagination State
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  // Edit State
  const [editOpen, setEditOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    departmentId: '',
    designation: 'Professor'
  });

  const fetchData = useCallback(async (page = 1, search = '') => {
    setLoading(true);
    try {
      const [facRes, deptRes] = await Promise.all([
        api.get('/api/faculty', { params: { page, limit: pagination.limit, search } }),
        api.get('/api/departments')
      ]);
      setFaculties(facRes.data.data || []);
      setPagination(facRes.data.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 });
      setDepartments(deptRes.data || []);
    } catch (err) {
      console.error("Failed to fetch data", err);
      toast({
        title: "Error",
        description: "Failed to load faculty records.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, toast]);

  useEffect(() => {
    fetchData(1, searchTerm);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(1, searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchData]);

  const handlePageChange = (page: number) => {
    fetchData(page, searchTerm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editOpen && editingFaculty) {
        await api.put(`/api/faculty/${editingFaculty._id}`, formData);
        toast({ title: "Updated", description: "Faculty details updated successfully." });
      } else {
        await api.post('/api/faculty', formData);
        toast({ title: "Success", description: "Faculty member onboarded successfully." });
      }
      setOpen(false);
      setEditOpen(false);
      setFormData({ name: '', email: '', departmentId: '', designation: 'Professor' });
      fetchData(pagination.page, searchTerm);
    } catch (err: any) {
      toast({
        title: "Action Failed",
        description: err.response?.data?.message || "Something went wrong.",
        variant: "destructive"
      });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this faculty member? This action cannot be undone.")) return;
    try {
      await api.delete(`/api/faculty/${id}`);
      toast({ title: "Deleted", description: "Faculty member removed." });
      fetchData(pagination.page, searchTerm);
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const startEdit = (faculty: any) => {
    setEditingFaculty(faculty);
    setFormData({
      name: faculty.name,
      email: faculty.email,
      departmentId: departments.find(d => d.name === faculty.department)?.id || '',
      designation: faculty.role
    });
    setEditOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Faculty Directory</h1>
            <p className="text-slate-500">Manage academic staff and departmental assignments</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20">
                <Plus className="h-4 w-4 mr-2" /> Add Faculty
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl border-none shadow-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Onboard New Faculty</DialogTitle>
                  <DialogDescription>Enter professional details and initial departmental assignment.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-6 py-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Dr. Alan Turing" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Work Email</Label>
                    <Input id="email" type="email" placeholder="turing@college.edu" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dept">Department</Label>
                    <Select required value={formData.departmentId} onValueChange={(val) => setFormData({...formData, departmentId: val})}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Select Department" /></SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Designation</Label>
                    <Select required value={formData.designation} onValueChange={(val) => setFormData({...formData, designation: val})}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Designation" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Professor">Professor</SelectItem>
                        <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                        <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                        <SelectItem value="Visiting Faculty">Visiting Faculty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="h-11">Cancel</Button>
                  <Button type="submit" disabled={submitting} className="h-11 bg-blue-600 hover:bg-blue-700 px-8">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Complete Onboarding
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Edit Faculty Profile</DialogTitle>
                <DialogDescription>Modify professional details for {editingFaculty?.name}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6 py-6">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Full Name</Label>
                    <Input id="edit-name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input id="edit-email" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-dept">Department</Label>
                    <Select required value={formData.departmentId} onValueChange={(val) => setFormData({...formData, departmentId: val})}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Select Department" /></SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-role">Designation</Label>
                    <Select required value={formData.designation} onValueChange={(val) => setFormData({...formData, designation: val})}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Designation" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Professor">Professor</SelectItem>
                        <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                        <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search faculty..." className="pl-10 h-11 bg-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="pl-6 h-12">Faculty Member</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   [...Array(3)].map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={5} className="h-16 text-center text-slate-400"><Loader2 className="h-5 w-5 animate-spin inline mr-2" /> Loading...</TableCell></TableRow>
                   ))
                ) : faculties.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="h-32 text-center text-slate-500">No records found.</TableCell></TableRow>
                ) : (
                  faculties.map((member) => (
                    <TableRow key={member._id} className="group hover:bg-slate-50/50">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                            <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=f1f5f9&color=64748b&bold=true`} />
                            <AvatarFallback className="bg-slate-100 text-slate-500">{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-sm text-slate-900">{member.name}</p>
                            <p className="text-xs text-slate-500">{member.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none">{member.department}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{member.role}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <span className="text-xs font-semibold text-slate-700">{member.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-600"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => startEdit(member)}><Edit2 className="h-4 w-4 mr-2" /> Edit Profile</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendEmail(member.email)}>
                              <Mail className="h-4 w-4 mr-2" /> Send Direct Email
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResendCredentials(member._id)}>
                              <UserCheck className="h-4 w-4 mr-2" /> Resend Credentials
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(member._id)}><Trash2 className="h-4 w-4 mr-2" /> Remove Faculty</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {!loading && (
              <Pagination 
                currentPage={pagination.page} 
                totalPages={pagination.totalPages} 
                onPageChange={handlePageChange} 
                totalItems={pagination.total} 
                limit={pagination.limit} 
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}