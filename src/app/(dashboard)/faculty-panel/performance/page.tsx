"use client"

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, AlertTriangle, TrendingUp, TrendingDown, Users, ChevronRight, Activity, CheckCircle2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

export default function PerformanceTrackerPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('b1');

  const students = [
    { id: '1', name: 'Alex Johnson', enrollment: 'CS23001', attendance: 85, marksAvg: 78, status: 'Good' },
    { id: '2', name: 'Sarah Williams', enrollment: 'CS23002', attendance: 65, marksAvg: 82, status: 'At Risk (Attendance)' },
    { id: '3', name: 'Michael Brown', enrollment: 'CS23003', attendance: 90, marksAvg: 45, status: 'At Risk (Marks)' },
    { id: '4', name: 'Emily Davis', enrollment: 'CS23004', attendance: 72, marksAvg: 58, status: 'Warning' },
    { id: '5', name: 'James Wilson', enrollment: 'CS23005', attendance: 95, marksAvg: 92, status: 'Excellent' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Performance Tracker</h1>
            <p className="text-slate-500">Analyze attendance trends and identify at-risk students.</p>
          </div>
          <Select value={selectedBatch} onValueChange={setSelectedBatch}>
            <SelectTrigger className="w-64 h-11 bg-white"><SelectValue placeholder="Select Batch" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="b1">CS 2nd Year (Data Structures)</SelectItem>
              <SelectItem value="b2">IT 3rd Year (Algorithms)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-none shadow-xl shadow-slate-200/40">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1">Class Avg Attendance</p>
                  <h3 className="text-3xl font-black text-slate-800">81.4%</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-xl shadow-slate-200/40">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1">Class Avg Marks</p>
                  <h3 className="text-3xl font-black text-slate-800">71.0%</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/40 bg-rose-50 border-rose-100">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-rose-600 mb-1">Attendance Defaulters</p>
                  <h3 className="text-3xl font-black text-rose-700">2 <span className="text-sm font-medium opacity-70">below 75%</span></h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-rose-200 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/40 bg-amber-50 border-amber-100">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-amber-600 mb-1">Academic Warning</p>
                  <h3 className="text-3xl font-black text-amber-700">1 <span className="text-sm font-medium opacity-70">below 50%</span></h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-amber-200 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-xl shadow-slate-200/40">
          <CardHeader className="bg-white border-b border-slate-50 pb-6 flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Student Roster</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search students..." 
                className="pl-10 h-10 bg-slate-50 border-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-4 pl-6 w-1/3">Student</th>
                    <th className="p-4">Overall Attendance</th>
                    <th className="p-4">Internal Marks (Avg)</th>
                    <th className="p-4">Status Flag</th>
                    <th className="p-4 text-right pr-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 group">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">{student.name.substring(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-slate-900">{student.name}</p>
                            <p className="text-xs text-slate-500 font-mono">{student.enrollment}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-2 max-w-[150px]">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className={student.attendance < 75 ? 'text-rose-600' : 'text-emerald-600'}>{student.attendance}%</span>
                            <span className="text-slate-400">100%</span>
                          </div>
                          <Progress value={student.attendance} className={`h-2 ${student.attendance < 75 ? 'bg-rose-100 [&>div]:bg-rose-500' : 'bg-emerald-100 [&>div]:bg-emerald-500'}`} />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-2 max-w-[150px]">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className={student.marksAvg < 50 ? 'text-rose-600' : 'text-blue-600'}>{student.marksAvg}%</span>
                          </div>
                          <Progress value={student.marksAvg} className={`h-2 ${student.marksAvg < 50 ? 'bg-rose-100 [&>div]:bg-rose-500' : 'bg-blue-100 [&>div]:bg-blue-500'}`} />
                        </div>
                      </td>
                      <td className="p-4">
                        {student.status.includes('At Risk') || student.status === 'Warning' ? (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            student.status.includes('At Risk') ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {student.status}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {student.status}
                          </span>
                        )}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <Button variant="ghost" size="sm" className="font-semibold text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700">
                          View Details <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
