"use client"

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Mail, Phone, MoreVertical, UserCheck, BookOpen, Layers, Settings2, Loader2 } from 'lucide-react';
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

export default function FacultyPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [faculties, setFaculties] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    departmentId: '',
    designation: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [facRes, deptRes] = await Promise.all([
        api.get('/api/faculty'),
        api.get('/api/departments')
      ]);
      setFaculties(facRes.data);
      setDepartments(deptRes.data);
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
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/faculty', formData);
      toast({
        title: "Success",
        description: "Faculty member onboarded successfully.",
      });
      setOpen(false);
      setFormData({ name: '', email: '', departmentId: '', designation: '' });
      fetchData();
    } catch (err: any) {
      toast({
        title: "Onboarding Failed",
        description: err.response?.data?.message || "Something went wrong.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFaculty = faculties.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Faculty & Academics</h1>
            <p className="text-slate-500">Manage faculty members, assign subjects, and track teaching loads</p>
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
                    <Input 
                      id="name" 
                      placeholder="Dr. Alan Turing" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Work Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="turing@college.edu" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dept">Department</Label>
                    <Select 
                      required 
                      value={formData.departmentId}
                      onValueChange={(val) => setFormData({...formData, departmentId: val})}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role / Designation</Label>
                    <Select 
                      required
                      value={formData.designation}
                      onValueChange={(val) => setFormData({...formData, designation: val})}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Designation" />
                      </SelectTrigger>
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
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setOpen(false)}
                    className="h-11"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="h-11 bg-blue-600 hover:bg-blue-700 px-8"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Complete Onboarding
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-none shadow-sm bg-blue-50/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Faculty</p>
                <p className="text-xl font-bold text-slate-900">{faculties.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-indigo-50/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Active Depts</p>
                <p className="text-xl font-bold text-slate-900">{departments.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by name or department..." 
            className="pl-10 h-11 bg-white border-slate-200 shadow-sm focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 h-12 text-slate-600 font-semibold">Faculty Member</TableHead>
                  <TableHead className="h-12 text-slate-600 font-semibold">Department</TableHead>
                  <TableHead className="h-12 text-slate-600 font-semibold">Designation</TableHead>
                  <TableHead className="h-12 text-slate-600 font-semibold">Status</TableHead>
                  <TableHead className="text-right pr-6 h-12 text-slate-600 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5} className="h-16 text-center text-slate-400">
                        <Loader2 className="h-5 w-5 animate-spin inline mr-2" /> Loading records...
                      </TableCell>
                    </TableRow>
                   ))
                ) : filteredFaculty.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                      No faculty records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFaculty.map((member) => (
                    <TableRow key={member.id} className="group hover:bg-slate-50/50 transition-colors">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.email}`} />
                            <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-sm text-slate-900">{member.name}</p>
                            <p className="text-xs text-slate-500">{member.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-700">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-normal">
                          {member.department}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {member.role}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${
                            member.status === 'Available' ? 'bg-green-500' : 
                            member.status === 'In Class' ? 'bg-blue-500' : 'bg-amber-500'
                          } shadow-sm`} />
                          <span className="text-xs font-semibold text-slate-700">{member.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                            <Settings2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}