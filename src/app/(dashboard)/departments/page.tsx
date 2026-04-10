
"use client"

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Layers, BookOpen, Users, MoreVertical, Edit2, Trash2 } from 'lucide-react';
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

const DEPARTMENTS = [
  { id: '1', name: 'Computer Science', code: 'CS', head: 'Dr. Alan Turing', courses: 12, students: 450 },
  { id: '2', name: 'Mechanical Engineering', code: 'ME', head: 'Dr. Nikola Tesla', courses: 8, students: 320 },
  { id: '3', name: 'Physics', code: 'PHY', head: 'Dr. Marie Curie', courses: 6, students: 180 },
];

export default function DepartmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">Departments & Courses</h1>
            <p className="text-muted-foreground">Define academic structure and curricular offerings</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="pulse-hover">
                <Plus className="h-4 w-4 mr-2" /> Add Department
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Department</DialogTitle>
                <DialogDescription>Create a new academic unit and assign a head.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" className="col-span-3" placeholder="Civil Engineering" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="code" className="text-right">Code</Label>
                  <Input id="code" className="col-span-3" placeholder="CE" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="head" className="text-right">HOD</Label>
                  <Input id="head" className="col-span-3" placeholder="Faculty Name" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Department</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search departments..." 
            className="pl-10 h-11 bg-secondary/50 border-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEPARTMENTS.map((dept) => (
            <Card key={dept.id} className="border-none shadow-sm hover:shadow-md transition-all group">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary mb-2">
                    <Layers className="h-6 w-6" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Edit2 className="h-4 w-4 mr-2" /> Edit Details</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="text-xl">{dept.name}</CardTitle>
                <CardDescription>Code: <Badge variant="outline" className="font-mono text-[10px]">{dept.code}</Badge></CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" /> Head
                  </div>
                  <span className="font-semibold">{dept.head}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4" /> Courses
                  </div>
                  <span className="font-semibold">{dept.courses} Available</span>
                </div>
                <div className="pt-4 border-t flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{dept.students} Students Enrolled</span>
                  <Button variant="link" size="sm" className="h-auto p-0 text-primary">Manage Curriculum</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
