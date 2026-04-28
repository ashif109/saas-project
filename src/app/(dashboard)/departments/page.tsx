"use client"

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Layers, BookOpen, Users, MoreVertical, Edit2, Trash2, Loader2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';

export default function DepartmentsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: ''
  });

  const fetchDepts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/departments');
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
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/departments', formData);
      toast({
        title: "Success",
        description: "Department created successfully.",
      });
      setOpen(false);
      setFormData({ name: '', code: '' });
      fetchDepts();
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

  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20">
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

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search departments..." 
            className="pl-10 h-11 bg-white border-slate-200 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-500" />
            <p>Loading institutional structure...</p>
          </div>
        ) : filteredDepts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500">
            <Layers className="h-10 w-10 mb-2 opacity-20" />
            <p>No departments configured yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepts.map((dept) => (
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
                        <DropdownMenuItem><Edit2 className="h-4 w-4 mr-2" /> Edit Details</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
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
                    <Button variant="link" size="sm" className="h-auto p-0 text-blue-600 font-bold hover:text-blue-700">
                      Manage Curriculum &rarr;
                    </Button>
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
