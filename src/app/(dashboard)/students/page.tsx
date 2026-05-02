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
      // semester filter logic can be added here if backend supports it

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

  const handleStudentEnrolled = (newStudent: any) => {
    fetchStudents(1, searchTerm);
  };
  
  const handleStudentUpdated = (updatedStudent: any) => {
    fetchStudents(pagination.page, searchTerm);
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
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name, ID or email..." 
                  className="pl-10 h-11 bg-secondary/30 border-none shadow-inner"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <AdvancedFilterSheet filters={filters} setFilters={setFilters} departments={departments} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-b">
                    <TableHead className="pl-6 h-12 font-bold text-slate-600">Student</TableHead>
                    <TableHead className="font-bold text-slate-600">ID</TableHead>
                    <TableHead className="font-bold text-slate-600">Department</TableHead>
                    <TableHead className="font-bold text-slate-600">Semester</TableHead>
                    <TableHead className="font-bold text-slate-600">Status</TableHead>
                    <TableHead className="text-right pr-6 font-bold text-slate-600">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="pl-6 py-4"><div className="h-10 w-48 bg-slate-100 animate-pulse rounded-md"></div></TableCell>
                        <TableCell><div className="h-4 w-16 bg-slate-100 animate-pulse rounded-md"></div></TableCell>
                        <TableCell><div className="h-4 w-32 bg-slate-100 animate-pulse rounded-md"></div></TableCell>
                        <TableCell><div className="h-4 w-24 bg-slate-100 animate-pulse rounded-md"></div></TableCell>
                        <TableCell><div className="h-6 w-16 bg-slate-100 animate-pulse rounded-full"></div></TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    ))
                  ) : studentsList.length > 0 ? (
                    studentsList.map((student) => (
                      <TableRow key={student._id || student.id} className="group hover:bg-blue-50/30 transition-colors">
                        <TableCell className="pl-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm transition-transform group-hover:scale-105">
                              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}&backgroundColor=b6e3f4`} />
                              <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">{student.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-sm text-slate-900 leading-none mb-1">{student.name}</p>
                              <p className="text-[10px] font-medium text-slate-500">{student.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-mono font-bold text-slate-600">{student.id}</TableCell>
                        <TableCell className="text-sm font-medium">{student.department}</TableCell>
                        <TableCell className="text-sm">
                          <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                            {student.semester}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={student.status === 'Active' ? 'default' : 'secondary'} className={
                            student.status === 'Active' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3 font-bold' : 'border-none px-3'
                          }>
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-600">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl shadow-2xl border-none">
                              <DropdownMenuItem onClick={() => { setEditingStudent(student); setIsEditDialogOpen(true); }} className="rounded-lg p-2.5">
                                <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-lg p-2.5">
                                <Mail className="h-4 w-4 mr-2" /> Send Email
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