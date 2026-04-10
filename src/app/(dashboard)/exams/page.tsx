
"use client"

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, Plus, FileText } from 'lucide-react';

const EXAMS = [
  { id: 'EX-101', name: 'Mid-Term Examination', date: '2024-05-15', department: 'Computer Science', status: 'Scheduled' },
  { id: 'EX-102', name: 'Final Semester Project', date: '2024-06-10', department: 'Physics', status: 'Pending' },
  { id: 'EX-103', name: 'Practical Assessment', date: '2024-05-20', department: 'Chemistry', status: 'Completed' },
];

export default function ExamsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">Examination Management</h1>
            <p className="text-muted-foreground">Schedule and manage academic assessments</p>
          </div>
          <Button className="pulse-hover">
            <Plus className="h-4 w-4 mr-2" /> Schedule Exam
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" /> Active Exams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">12</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Exam Schedule</CardTitle>
            <CardDescription>Upcoming and past examinations</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {EXAMS.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.name}</TableCell>
                    <TableCell>{exam.date}</TableCell>
                    <TableCell>{exam.department}</TableCell>
                    <TableCell>
                      <Badge variant={exam.status === 'Completed' ? 'default' : 'secondary'}>
                        {exam.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4 mr-2" /> Results
                      </Button>
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
