"use client"

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Layers, BookOpen, Users, MoreVertical, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';
import Link from 'next/link';

export default function DepartmentsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Dialog States
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: ''
  });

  const fetchDepts = useCallback(async (search = '') => {
    setLoading(true);
    try {
      const res = await api.get('/api/departments', { params: { search } });
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to load departments.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDepts();
  }, [fetchDepts]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDepts(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchDepts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editOpen && selectedDept) {
        await api.put(`/api/departments/${selectedDept.id}`, formData);
        toast({ title: "Updated", description: "Department updated successfully." });
      } else {
        await api.post('/api/departments', formData);
        toast({ title: "Success", description: "Department created successfully." });
      }
      setOpen(false);
      setEditOpen(false);
      setFormData({ name: '', code: '' });
      fetchDepts(searchTerm);
    } catch (err: any) {
      toast({
        title: "Failed",
        description: err.response?.data?.message || "Something went wrong.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDept) return;
    setSubmitting(true);
    try {
      await api.delete(`/api/departments/${selectedDept.id}`);
      toast({ title: "Deleted", description: "Department removed successfully." });
      fetchDepts(searchTerm);
    } catch (err: any) {
      toast({
        title: "Delete Failed",
        description: err.response?.data?.message || "Could not delete department.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
      setDeleteDialogOpen(false);
    }
  };

  const openEdit = (dept: any) => {
    setSelectedDept(dept);
    setFormData({ name: dept.name, code: dept.code });
    setEditOpen(true);
  };

  const openDelete = (dept: any) => {
    setSelectedDept(dept);
    setDeleteDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Departments & Courses</h1>
            <p className="text-slate-500">Define academic structure and curricular offerings</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setSelectedDept(null); setFormData({ name: '', code: '' }); }} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20">
                <Plus className="h-4 w-4 mr-2" /> Add Department
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] border-none shadow-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">New Department</DialogTitle>
                  <DialogDescription>Create a new academic unit and assign a unique code.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700 font-semibold">Department Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g. Computer Science & Engineering" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-slate-700 font-semibold">Department Code</Label>
                    <Input 
                      id="code" 
                      placeholder="e.g. CSE" 
                      required 
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      className="h-11 font-mono"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 px-6">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Create Department
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Edit Department</DialogTitle>
                <DialogDescription>Modify department details.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="space-y-2">
                  <Label>Department Name</Label>
                  <Input 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Department Code</Label>
                  <Input 
                    required 
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting} className="bg-blue-600">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the <strong>{selectedDept?.name}</strong> department.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Delete Department
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search departments..." 
            className="pl-10 h-11 bg-white border-slate-200 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading && departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-500" />
            <p>Loading institutional structure...</p>
          </div>
        ) : departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500">
            <Layers className="h-10 w-10 mb-2 opacity-20" />
            <p>No departments found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <Card key={dept.id} className="border-none shadow-xl shadow-slate-200/50 hover:shadow-blue-500/10 transition-all group overflow-hidden bg-white/80 backdrop-blur-sm">
                <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 mb-2 group-hover:scale-110 transition-transform">
                      <Layers className="h-6 w-6" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(dept)}><Edit2 className="h-4 w-4 mr-2" /> Edit Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDelete(dept)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-xl text-slate-900">{dept.name}</CardTitle>
                  <CardDescription>
                    Code: <Badge variant="secondary" className="font-mono text-[10px] bg-slate-100 text-slate-600 border-none">{dept.code}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                      <Users className="h-4 w-4" /> Faculty
                    </div>
                    <span className="font-bold text-slate-700">{dept._count?.faculties || 0} Members</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                      <BookOpen className="h-4 w-4" /> Courses
                    </div>
                    <span className="font-bold text-slate-700">{dept._count?.courses || 0} Degrees</span>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex justify-end items-center">
                    <Link href="/academic-setup" className="text-blue-600 text-sm font-bold hover:text-blue-700 flex items-center">
                      Manage Curriculum &rarr;
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
