
"use client"

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Clock, BookOpen, User, MoreVertical, LayoutGrid, List } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = ['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '03:30 PM'];

const MOCK_SCHEDULE = [
  { day: 'Monday', time: '09:00 AM', subject: 'Advanced Algorithms', faculty: 'Dr. Alan Turing', room: 'Lab 402', color: 'bg-blue-100 text-blue-700' },
  { day: 'Monday', time: '12:00 PM', subject: 'Cloud Computing', faculty: 'Dr. Jane Cloud', room: 'Hall B', color: 'bg-green-100 text-green-700' },
  { day: 'Tuesday', time: '10:30 AM', subject: 'Cyber Security', faculty: 'Dr. Kevin Mitnick', room: 'Room 101', color: 'bg-purple-100 text-purple-700' },
];

export default function TimetablePage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">Timetable & Scheduling</h1>
            <p className="text-muted-foreground">Organize class slots, room availability, and faculty loads</p>
          </div>
          <div className="flex gap-2">
            <div className="bg-secondary/50 p-1 rounded-md flex">
              <Button 
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button className="pulse-hover">
              <Plus className="h-4 w-4 mr-2" /> Create Entry
            </Button>
          </div>
        </div>

        <Tabs defaultValue="CS" className="space-y-6">
          <TabsList className="bg-secondary/50 p-1 rounded-xl h-11">
            <TabsTrigger value="CS" className="rounded-lg">Computer Science</TabsTrigger>
            <TabsTrigger value="ME" className="rounded-lg">Mechanical</TabsTrigger>
            <TabsTrigger value="PHY" className="rounded-lg">Physics</TabsTrigger>
          </TabsList>

          <TabsContent value="CS" className="space-y-6">
            {viewMode === 'grid' ? (
              <Card className="border-none shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-secondary/30">
                        <th className="p-4 border-r border-b text-left text-xs font-bold uppercase tracking-wider text-muted-foreground w-32">Time / Day</th>
                        {DAYS.map(day => (
                          <th key={day} className="p-4 border-b text-center text-xs font-bold uppercase tracking-wider text-muted-foreground min-w-[150px]">
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {TIME_SLOTS.map(slot => (
                        <tr key={slot}>
                          <td className="p-4 border-r border-b text-xs font-bold bg-secondary/10">{slot}</td>
                          {DAYS.map(day => {
                            const entry = MOCK_SCHEDULE.find(s => s.day === day && s.time === slot);
                            return (
                              <td key={`${day}-${slot}`} className="p-2 border-b h-24 relative hover:bg-secondary/5 transition-colors">
                                {entry ? (
                                  <div className={`h-full w-full p-2 rounded-lg ${entry.color} text-[10px] space-y-1 shadow-sm`}>
                                    <p className="font-bold truncate">{entry.subject}</p>
                                    <p className="opacity-80 flex items-center gap-1"><User className="h-2 w-2" /> {entry.faculty}</p>
                                    <p className="opacity-80 flex items-center gap-1"><Calendar className="h-2 w-2" /> {entry.room}</p>
                                  </div>
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-secondary">
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {MOCK_SCHEDULE.map((item, i) => (
                  <Card key={i} className="border-none shadow-sm hover:bg-secondary/10 transition-colors">
                    <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary font-bold text-xs">
                          {item.day}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary">{item.time}</p>
                          <h3 className="text-lg font-bold">{item.subject}</h3>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-6 items-center">
                        <Badge variant="secondary">{item.room}</Badge>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" /> {item.faculty}
                        </div>
                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
