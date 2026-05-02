"use client"

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, User, GraduationCap, MoreVertical, Edit2, Trash2, Mail, Download, Upload, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { EnrollStudentDialog } from './components/EnrollStudentDialog';
import { EditStudentDialog } from './components/EditStudentDialog';
import { BulkImportDialog } from './components/BulkImportDialog';
import { AdvancedFilterSheet } from './components/AdvancedFilterSheet';
import { Pagination } from '@/components/shared/Pagination';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

import { toast } from 'sonner';
import api from '@/lib/axios';

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<any[]>([]);
  
  // Pagination & Filtering State
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  
  const [filters, setFilters] = useState({
    department: 'all',
    semester: 'all',
    status: 'all'
  });

  const fetchStudents = useCallback(async (page = 1, search = '', activeFilters = filters) => {
    setLoading(true);
    try {
      const params: any = { page, limit: pagination.limit };
      if (search) params.search = search;
      if (activeFilters.department !== 'all') params.department = activeFilters.department;
      if (activeFilters.status !== 'all') params.status = activeFilters.status;

      const res = await api.get('/api/students/list', { params });
      setStudentsList(res.data.data || []);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Fetch Students error:', err);
      toast.error("Failed to load students.");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/api/departments');
      setDepartments(res.data || []);
    } catch (err) {
      console.error('Fetch Depts error:', err);
    }
  };

  useEffect(() => {
    fetchStudents(1, searchTerm);
    fetchDepartments();
  }, [filters]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents(1, searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handlePageChange = (page: number) => {
    fetchStudents(page, searchTerm);
  };

  const handleExportCSV = () => {
    if (studentsList.length === 0) return toast.info("No data to export");
    const headers = ["ID", "Name", "Email", "Department", "Semester", "Status"];
    const rows = studentsList.map(s => [s.id, s.name, s.email, s.department, s.semester, s.status]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "students_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (studentId: string) => {
    if (!confirm("Are you sure you want to completely revoke this student's enrollment?")) return;
    try {
      await api.delete(`/api/students/${studentId}`);
      toast.success("Student revoked.");
      fetchStudents(pagination.page, searchTerm);
    } catch (err) {
      toast.error("Failed to revoke student.");
    }
  };

  const handleSendEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleResendCredentials = async (studentId: string) => {
    const loadingToast = toast.loading("Resending credentials...");
    try {
      await api.post(`/api/students/resend-welcome/${studentId}`);
      toast.success("Welcome credentials resent successfully.", { id: loadingToast });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to resend credentials.", { id: loadingToast });
    }
  };

  const handleStudentEnrolled = () => {
    fetchStudents(1, searchTerm);
  };

  const handleStudentUpdated = () => {
    fetchStudents(pagination.page, searchTerm);
    setIsEditDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">Student Management</h1>
            <p className="text-muted-foreground">Manage and track student profiles, enrollments, and status</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="bg-white" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            <BulkImportDialog onImportComplete={() => fetchStudents(1, searchTerm)} />
            <EnrollStudentDialog onStudentEnrolled={handleStudentEnrolled} />
          </div>
        </div>

        <Card className="border-none shadow-xl shadow-slate-200/50">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search by name, email, or enrollment ID..." 
                  className="pl-10 h-11 bg-slate-50 border-none focus-visible:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <AdvancedFilterSheet 
                filters={filters}
                setFilters={setFilters}
                departments={departments} 
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="w-[100px] font-bold text-slate-500">ID</TableHead>
                    <TableHead className="font-bold text-slate-500">Student</TableHead>
                    <TableHead className="font-bold text-slate-500">Department</TableHead>
                    <TableHead className="font-bold text-slate-500">Semester</TableHead>
                    <TableHead className="font-bold text-slate-500">Status</TableHead>
                    <TableHead className="text-right font-bold text-slate-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-64 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                          <span className="text-slate-500 font-medium">Synchronizing data...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : studentsList.length > 0 ? (
                    studentsList.map((student) => (
                      <TableRow key={student._id} className="hover:bg-slate-50/50 transition-colors group">
                        <TableCell className="font-mono text-xs text-slate-400">{student.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                              <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                                {student.name.split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{student.name}</span>
                              <span className="text-xs text-slate-400">{student.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-medium">
                            {student.department}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600">{student.semester}</span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`rounded-full border-none px-3 py-1 ${
                              student.status === 'Active' 
                                ? 'bg-emerald-50 text-emerald-600' 
                                : 'bg-rose-50 text-rose-600'
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full mr-2 ${student.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-xl border-none shadow-2xl">
                              <DropdownMenuItem onClick={() => { setEditingStudent(student); setIsEditDialogOpen(true); }} className="rounded-lg p-2.5">
                                <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSendEmail(student.email)} className="rounded-lg p-2.5">
                                <Mail className="h-4 w-4 mr-2" /> Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleResendCredentials(student._id)} className="rounded-lg p-2.5">
                                <GraduationCap className="h-4 w-4 mr-2" /> Resend Credentials
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(student._id)} className="text-rose-500 rounded-lg p-2.5 focus:bg-rose-50 focus:text-rose-500">
                                <Trash2 className="h-4 w-4 mr-2" /> Revoke Enrollment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                            <User className="h-8 w-8" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-lg font-bold text-slate-400">No students found</p>
                            <p className="text-sm text-slate-400">Try adjusting your filters or search term.</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
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
        <EditStudentDialog 
          student={editingStudent} 
          isOpen={isEditDialogOpen} 
          onClose={() => setIsEditDialogOpen(false)} 
          onStudentUpdated={handleStudentUpdated} 
        />
      </div>
    </DashboardLayout>
  );
}