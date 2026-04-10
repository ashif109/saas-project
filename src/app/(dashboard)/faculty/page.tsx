"use client"

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Mail, Phone, MoreVertical, UserCheck, BookOpen, Layers, Settings2 } from 'lucide-react';
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

const FACULTY = [
  { id: 'FAC-001', name: 'Dr. Alan Turing', role: 'Professor', department: 'Computer Science', expertise: 'Artificial Intelligence', assignedSubjects: ['Algorithms', 'AI'], status: 'Available' },
  { id: 'FAC-002', name: 'Dr. Marie Curie', role: 'Associate Professor', department: 'Physics', expertise: 'Nuclear Physics', assignedSubjects: ['Quantum Mechanics'], status: 'In Class' },
  { id: 'FAC-003', name: 'Prof. Richard Feynman', role: 'Professor', department: 'Physics', expertise: 'Quantum Mechanics', assignedSubjects: ['Electrodynamics'], status: 'Available' },
  { id: 'FAC-004', name: 'Dr. Ada Lovelace', role: 'Assistant Professor', department: 'Computer Science', expertise: 'Algorithms', assignedSubjects: ['Programming 101'], status: 'On Leave' },
];

export default function FacultyPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">Faculty & Academics</h1>
            <p className="text-muted-foreground">Manage faculty members, assign subjects, and track teaching loads</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="pulse-hover">
                <Plus className="h-4 w-4 mr-2" /> Add Faculty
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Onboard New Faculty</DialogTitle>
                <DialogDescription>Enter professional details and initial departmental assignment.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Dr. John Smith" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
                  <Input id="email" type="email" placeholder="smith@college.edu" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dept">Department</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cs">Computer Science</SelectItem>
                      <SelectItem value="me">Mechanical</SelectItem>
                      <SelectItem value="phy">Physics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role / Designation</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Designation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prof">Professor</SelectItem>
                      <SelectItem value="assoc">Associate Professor</SelectItem>
                      <SelectItem value="assist">Assistant Professor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Complete Onboarding</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-none shadow-sm bg-primary/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Faculty</p>
                <p className="text-xl font-bold">124</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Assigned Slots</p>
                <p className="text-xl font-bold">452</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, expertise or department..." 
            className="pl-10 h-10 bg-secondary/30 border-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Card className="border-none shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Faculty Member</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Expertise</TableHead>
                  <TableHead>Teaching Load</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {FACULTY.map((member) => (
                  <TableRow key={member.id} className="group">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border">
                          <AvatarImage src={`https://picsum.photos/seed/${member.id}/100/100`} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1.5">
                        <Layers className="h-3 w-3 text-muted-foreground" />
                        {member.department}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <Badge variant="outline" className="font-normal">{member.expertise}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {member.assignedSubjects.map((sub, idx) => (
                          <Badge key={idx} variant="secondary" className="text-[10px] bg-primary/5 text-primary border-none">
                            {sub}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${
                          member.status === 'Available' ? 'bg-green-500' : 
                          member.status === 'In Class' ? 'bg-blue-500' : 'bg-orange-500'
                        }`} />
                        <span className="text-xs font-medium">{member.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                          <Settings2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}