"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
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
import { toast } from 'sonner';
import api from '@/lib/axios';

export function EnrollStudentDialog({ onStudentEnrolled }: { onStudentEnrolled: (student: any) => void }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    semester: '',
    batchId: ''
  });

  const fetchBatches = async () => {
    try {
      const res = await api.get('/api/setup/batches');
      setBatches(res.data || []);
    } catch (err) {
      console.error('Fetch Batches error:', err);
    }
  };

  React.useEffect(() => {
    if (isDialogOpen) {
      fetchBatches();
    }
  }, [isDialogOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent empty submissions
    if (!formData.name || !formData.email) {
      toast.error('Please fill required fields.');
      return;
    }

    setLoading(true);
    
    try {
      const res = await api.post('/api/students/enroll', formData);
      const newStudent = res.data.student;
      
      // Close securely first
      setIsDialogOpen(false);
      
      setTimeout(() => {
        onStudentEnrolled(newStudent);
        toast.success(res.data.message || 'Student Enrolled successfully!');
        setFormData({ name: '', email: '', department: '', semester: '', batchId: '' });
      }, 150);
      
    } catch (error: any) {
      console.error('Enroll Error:', error);
      toast.error(error.response?.data?.message || 'Failed to enroll student. Please check network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="pulse-hover">
          <Plus className="h-4 w-4 mr-2" /> Enroll Student
        </Button>
      </DialogTrigger>
      {/* 
        CRITICAL FIX: aria-describedby={undefined} and focus overrides prevent Radix 
        from crashing focus hooks when the user types rapidly in Next.js 18 Strict mode.
      */}
      <DialogContent 
        className="max-w-2xl" 
        aria-describedby={undefined}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          // If loading, prevent accidental closing by clicking outside
          if (loading) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Enroll New Student</DialogTitle>
          <DialogDescription>Enter academic and personal details to create a new student record.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sname">Full Name <span className="text-destructive">*</span></Label>
              <Input 
                id="sname" 
                placeholder="Alex Johnson" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="semail">College Email <span className="text-destructive">*</span></Label>
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
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cs">Computer Science</SelectItem>
                  <SelectItem value="me">Mechanical</SelectItem>
                  <SelectItem value="civil">Civil Engineering</SelectItem>
                  <SelectItem value="ee">Electrical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sbatch">Academic Batch <span className="text-destructive">*</span></Label>
              <Select required value={formData.batchId} onValueChange={(val) => setFormData({...formData, batchId: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ssem">Semester</Label>
              <Select value={formData.semester} onValueChange={(val) => setFormData({...formData, semester: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1st Semester</SelectItem>
                  <SelectItem value="2">2nd Semester</SelectItem>
                  <SelectItem value="3">3rd Semester</SelectItem>
                  <SelectItem value="4">4th Semester</SelectItem>
                  <SelectItem value="5">5th Semester</SelectItem>
                  <SelectItem value="6">6th Semester</SelectItem>
                  <SelectItem value="7">7th Semester</SelectItem>
                  <SelectItem value="8">8th Semester</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[150px]">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enrolling...
                </>
              ) : (
                'Complete Enrollment'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
