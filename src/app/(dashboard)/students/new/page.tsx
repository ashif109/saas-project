"use client"

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { UserPlus, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

export default function AddStudentPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await api.get('/api/departments');
        setDepartments(res.data);
      } catch (err) {
        console.error("Failed to fetch departments", err);
      }
    };
    fetchDepts();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      department: formData.get('department'),
      semester: formData.get('semester'),
    };

    try {
      await api.post('/api/students', data);
      toast({
        title: "Success",
        description: "Student registered successfully. Credentials sent to email.",
      });
      router.push('/students');
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-500/10 rounded-2xl">
            <UserPlus className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Register New Student
            </h1>
            <p className="text-slate-500">
              Enroll a new student into the institutional database.
            </p>
          </div>
        </div>

        <Card className="border-none shadow-xl shadow-blue-500/5 bg-white/80 backdrop-blur-sm overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-600" />
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>Enter the personal and academic details of the student.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Full Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="e.g. Sameer Ansari" 
                    required 
                    className="h-12 border-slate-200 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Institutional Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="sameer@college.edu" 
                    required 
                    className="h-12 border-slate-200 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-semibold text-slate-700">Department</Label>
                  <Select name="department" required>
                    <SelectTrigger className="h-12 border-slate-200">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.length > 0 ? (
                        departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Electronics">Electronics</SelectItem>
                          <SelectItem value="Mechanical">Mechanical</SelectItem>
                          <SelectItem value="Civil">Civil</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester" className="text-sm font-semibold text-slate-700">Current Semester</Label>
                  <Select name="semester" defaultValue="1" required>
                    <SelectTrigger className="h-12 border-slate-200">
                      <SelectValue placeholder="Select Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8].map(s => (
                        <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                  className="h-12 px-8 font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="h-12 px-10 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 font-semibold transition-all hover:scale-[1.02] active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Complete Registration
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
           <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
              <p className="text-xs text-blue-700 leading-relaxed">
                Login credentials will be automatically generated and sent to the student's email address.
              </p>
           </div>
           <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
              <p className="text-xs text-indigo-700 leading-relaxed">
                The student will be assigned to the default batch for the selected department and current academic year.
              </p>
           </div>
           <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
              <p className="text-xs text-slate-600 leading-relaxed">
                You can manage student status, edit profiles, and view academic records from the Student Directory.
              </p>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
