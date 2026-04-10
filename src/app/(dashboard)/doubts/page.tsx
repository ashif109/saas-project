"use client"

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Filter, MessageSquare, Clock, CheckCircle2, ChevronRight, User } from 'lucide-react';
import Link from 'next/link';

const DOUBTS = [
  { 
    id: '1', 
    student: 'Alex Johnson', 
    subject: 'Algorithms and Data Structures', 
    department: 'Computer Science', 
    status: 'Pending', 
    lastMessage: 'How do I optimize Dijkstra\'s for large graphs?', 
    time: '2m ago',
    unreadCount: 2
  },
  { 
    id: '2', 
    student: 'Sarah Williams', 
    subject: 'Quantum Physics', 
    department: 'Physics', 
    status: 'Answered', 
    lastMessage: 'Thank you professor, I understand it now.', 
    time: '45m ago',
    unreadCount: 0
  },
  { 
    id: '3', 
    student: 'Michael Brown', 
    subject: 'Organic Chemistry II', 
    department: 'Chemistry', 
    status: 'Pending', 
    lastMessage: 'The reaction mechanism is unclear to me.', 
    time: '2h ago',
    unreadCount: 1
  },
  { 
    id: '4', 
    student: 'Emma Davis', 
    subject: 'Ancient Civilizations', 
    department: 'History', 
    status: 'Pending', 
    lastMessage: 'Is the mid-term including the Roman era?', 
    time: '5h ago',
    unreadCount: 0
  },
  { 
    id: '5', 
    student: 'James Miller', 
    subject: 'Macroeconomics', 
    department: 'Economics', 
    status: 'Answered', 
    lastMessage: 'Resolved.', 
    time: '1d ago',
    unreadCount: 0
  },
];

export default function DoubtsPage() {
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Answered'>('All');

  const filteredDoubts = DOUBTS.filter(d => 
    filterStatus === 'All' || d.status === filterStatus
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">Doubt Monitoring</h1>
            <p className="text-muted-foreground">Monitor and manage student-faculty interactions</p>
          </div>
          <div className="flex gap-2">
            <Button variant={filterStatus === 'All' ? 'default' : 'outline'} onClick={() => setFilterStatus('All')}>All</Button>
            <Button variant={filterStatus === 'Pending' ? 'default' : 'outline'} onClick={() => setFilterStatus('Pending')}>Pending</Button>
            <Button variant={filterStatus === 'Answered' ? 'default' : 'outline'} onClick={() => setFilterStatus('Answered')}>Answered</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 border-none shadow-sm h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Quick Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search students..." className="pl-10" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-bold">Departments</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="justify-start">All</Button>
                  <Button variant="outline" size="sm" className="justify-start">CS</Button>
                  <Button variant="outline" size="sm" className="justify-start">Physics</Button>
                  <Button variant="outline" size="sm" className="justify-start">History</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-none shadow-sm overflow-hidden">
            <div className="divide-y">
              {filteredDoubts.map((doubt) => (
                <Link key={doubt.id} href={`/chat/${doubt.id}`}>
                  <div className="p-4 hover:bg-secondary/50 transition-all flex items-start gap-4 cursor-pointer group">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        {doubt.student.charAt(0)}
                      </div>
                      {doubt.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-white rounded-full text-[10px] flex items-center justify-center border-2 border-background">
                          {doubt.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-foreground truncate">{doubt.student}</h3>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{doubt.time}</span>
                      </div>
                      <p className="text-xs font-medium text-primary mb-1">{doubt.subject}</p>
                      <p className="text-sm text-muted-foreground truncate">{doubt.lastMessage}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={doubt.status === 'Pending' ? 'destructive' : 'default'} className={
                        doubt.status === 'Answered' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-orange-100 text-orange-700 hover:bg-orange-100 border-none'
                      }>
                        {doubt.status === 'Pending' ? <Clock className="h-3 w-3 mr-1" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {doubt.status}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {filteredDoubts.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No doubts found in this category.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}