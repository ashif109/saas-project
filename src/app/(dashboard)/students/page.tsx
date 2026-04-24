"use client"

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, User, GraduationCap, MoreVertical, Edit2, Trash2, Mail, Download, Upload, Loader2 } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [studentsList, setStudentsList] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    semester: ''
  });

  const [initialFetch, setInitialFetch] = useState(true);

  React.useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/api/students/list');
      setStudentsList(res.data || []);
    } catch (err) {
      console.error('Fetch Students error:', err);
    } finally {
      setInitialFetch(false);
    }
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
      setStudentsList(studentsList.filter(s => s._id !== studentId));
    } catch (err) {
      toast.error("Failed to revoke student.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await api.post('/api/students/enroll', formData);
      const newStudent = res.data.student;
      
      // We must close the dialog FIRST before mutating the large DOM list to prevent Radix Focus Trap errors
      setIsDialogOpen(false);
      
      // Delay DOM mutation slightly
      setTimeout(() => {
        setStudentsList([newStudent, ...studentsList]);
        toast.success(res.data.message || 'Student Enrolled successfully!');
        setFormData({ name: '', email: '', department: '', semester: '' });
      }, 300);
      

      
    } catch (error) {
      toast.error('Failed to enroll student. Please check network.');
    } finally {
      setLoading(false);
    }
  };
  
  const filteredStudents = studentsList.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">Student Management</h1>
            <p className="text-muted-foreground">Manage and track student profiles, enrollments, and status</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="bg-white" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            <Button variant="outline" className="bg-white">
              <Upload className="h-4 w-4 mr-2" /> Bulk Import
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="pulse-hover">
                  <Plus className="h-4 w-4 mr-2" /> Enroll Student
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl" aria-describedby={undefined} onOpenAutoFocus={(e) => e.preventDefault()} onCloseAutoFocus={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle>Enroll New Student</DialogTitle>
                <DialogDescription>Enter academic and personal details to create a new student record.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="sname">Full Name</Label>
                    <Input 
                      id="sname" 
                      placeholder="Alex Johnson" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semail">College Email</Label>
                    <Input 
                      id="semail" 
                      type="email" 
                      placeholder="alex@college.edu" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sdept">Department</Label>
                    <Select value={formData.department} onValueChange={(val) => setFormData({...formData, department: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cs">Computer Science</SelectItem>
                        <SelectItem value="me">Mechanical</SelectItem>
                        <SelectItem value="phy">Physics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ssem">Semester</Label>
                    <Select value={formData.semester} onValueChange={(val) => setFormData({...formData, semester: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1st Semester</SelectItem>
                        <SelectItem value="2">2nd Semester</SelectItem>
                        <SelectItem value="3">3rd Semester</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Enrolling...' : 'Complete Enrollment'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name, ID or email..." 
                  className="pl-10 h-10 bg-secondary/30 border-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-10">
                  <Filter className="h-4 w-4 mr-2" /> Advanced Filters
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredStudents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6">Student</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialFetch ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="pl-6"><div className="h-10 w-48 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-md"></div></TableCell>
                        <TableCell><div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-md"></div></TableCell>
                        <TableCell><div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-md"></div></TableCell>
                        <TableCell><div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-md"></div></TableCell>
                        <TableCell><div className="h-6 w-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full"></div></TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    ))
                  ) : filteredStudents.map((student) => (
                    <TableRow key={student._id || student.id} className="group hover:bg-secondary/20 transition-colors">
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} />
                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">{student.name}</p>
                            <p className="text-[10px] text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono">{student.id}</TableCell>
                      <TableCell className="text-sm">{student.department}</TableCell>
                      <TableCell className="text-sm font-bold">{student.semester}</TableCell>
                      <TableCell>
                        <Badge variant={student.status === 'Active' ? 'default' : 'secondary'} className={
                          student.status === 'Active' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-none px-3' : 'border-none px-3'
                        }>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Edit2 className="h-4 w-4 mr-2" /> Edit Profile</DropdownMenuItem>
                            <DropdownMenuItem><Mail className="h-4 w-4 mr-2" /> Send Email</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(student._id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Revoke Enrollment</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                  <User className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-slate-400">No students enrolled</p>
                  <p className="text-sm text-muted-foreground">Start by enrolling a new student to your institution.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}