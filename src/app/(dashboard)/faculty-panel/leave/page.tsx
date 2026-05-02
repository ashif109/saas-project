"use client"

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, Plus, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function FacultyLeavePage() {
  const [open, setOpen] = useState(false);
  const [leaves, setLeaves] = useState([
    { id: '1', startDate: '2026-06-15', endDate: '2026-06-18', reason: 'Attending AI Conference', status: 'APPROVED', substitute: 'Dr. Jane Smith' },
    { id: '2', startDate: '2026-05-20', endDate: '2026-05-21', reason: 'Personal Emergency', status: 'PENDING', substitute: null }
  ]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Leave application submitted successfully for HOD approval.");
    setOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Leave Management</h1>
            <p className="text-slate-500">Apply for leaves and coordinate substitute faculty for your classes.</p>
          </div>
          <Button onClick={() => setOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 h-11 px-6 shadow-lg shadow-indigo-600/20">
            <Plus className="h-4 w-4 mr-2" /> Apply for Leave
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-none shadow-xl shadow-slate-200/40 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <CardContent className="p-6">
              <p className="text-indigo-100 font-semibold mb-2">Leave Balance</p>
              <h2 className="text-4xl font-black">12 <span className="text-xl font-medium opacity-80">Days</span></h2>
              <p className="text-xs text-indigo-200 mt-4 flex items-center gap-1"><Info className="h-3 w-3" /> Resets end of academic year</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-xl shadow-slate-200/40">
            <CardContent className="p-6">
              <p className="text-slate-500 font-semibold mb-2">Approved Leaves</p>
              <h2 className="text-4xl font-black text-slate-800">4</h2>
            </CardContent>
          </Card>
          <Card className="border-none shadow-xl shadow-slate-200/40">
            <CardContent className="p-6">
              <p className="text-slate-500 font-semibold mb-2">Pending Approval</p>
              <h2 className="text-4xl font-black text-amber-500">1</h2>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-xl shadow-slate-200/40">
          <CardHeader className="border-b border-slate-50">
            <CardTitle>Leave History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {leaves.map(leave => (
                <div key={leave.id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <CalendarIcon className="h-6 w-6 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">{leave.reason}</h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500 font-medium">
                        <span className="flex items-center gap-1"><CalendarIcon className="h-3.5 w-3.5" /> {leave.startDate} to {leave.endDate}</span>
                        {leave.substitute && <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md text-slate-700 text-xs">Sub: {leave.substitute}</span>}
                      </div>
                    </div>
                  </div>
                  <div>
                    {leave.status === 'APPROVED' && (
                      <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold">
                        <CheckCircle2 className="h-5 w-5" /> Approved
                      </div>
                    )}
                    {leave.status === 'PENDING' && (
                      <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-xl font-bold">
                        <Clock className="h-5 w-5" /> Pending
                      </div>
                    )}
                    {leave.status === 'REJECTED' && (
                      <div className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-xl font-bold">
                        <XCircle className="h-5 w-5" /> Rejected
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl border-none shadow-2xl">
          <form onSubmit={handleApply}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Apply for Leave</DialogTitle>
              <DialogDescription>Submit your leave application for HOD review. Ensure you've coordinated a substitute if you have active lectures.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" required className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" required className="h-11" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reason for Leave</Label>
                <Textarea required placeholder="Please provide a brief reason..." className="h-24 resize-none" />
              </div>
              <div className="space-y-2">
                <Label>Substitute Faculty (Optional)</Label>
                <Select>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Select Colleague" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="f1">Dr. Jane Smith</SelectItem>
                    <SelectItem value="f2">Prof. Alan Turing</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">Your selected substitute will receive an automated request to cover your lectures.</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Submit Application</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
