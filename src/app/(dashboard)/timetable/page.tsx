"use client"

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Clock, BookOpen, User, MoreVertical, LayoutGrid, List, Loader2, Search, Trash2, MapPin } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = ['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '03:30 PM'];

export default function TimetablePage() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<{batches: any[], subjects: any[], faculties: any[]}>({
    batches: [],
    subjects: [],
    faculties: []
  });
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    dayOfWeek: 'Monday',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    roomInfo: '',
    batchId: '',
    facultyId: '',
    subjectId: ''
  });

  const fetchMetadata = async () => {
    try {
      const res = await api.get('/api/timetable/metadata');
      setMetadata(res.data);
      if (res.data.batches.length > 0) {
        setSelectedBatch(res.data.batches[0].id);
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Setup Error", description: "Failed to load batches/faculties.", variant: "destructive" });
    }
  };

  const fetchTimetable = async (batchId: string) => {
    if (!batchId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/timetable?batchId=${batchId}`);
      setEntries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchTimetable(selectedBatch);
    }
  }, [selectedBatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/timetable', { ...formData, batchId: formData.batchId || selectedBatch });
      toast({ title: "Slot Assigned", description: "Timetable entry created successfully." });
      setOpen(false);
      fetchTimetable(selectedBatch);
    } catch (err: any) {
      toast({ 
        title: "Conflict or Error", 
        description: err.response?.data?.message || "Failed to create entry.", 
        variant: "destructive" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/timetable/${id}`);
      toast({ title: "Removed", description: "Entry deleted." });
      fetchTimetable(selectedBatch);
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const getEntryForSlot = (day: string, slot: string) => {
    return entries.find(e => e.dayOfWeek === day && e.startTime === slot);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Timetable & Scheduling</h1>
            <p className="text-slate-500">Real-time class coordination and resource allocation</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex bg-slate-100 p-1 rounded-xl">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                    onClick={() => setViewMode('grid')}
                >
                    <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`rounded-lg ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                    onClick={() => setViewMode('list')}
                >
                    <List className="h-4 w-4" />
                </Button>
             </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20">
                  <Plus className="h-4 w-4 mr-2" /> Create Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl border-none shadow-2xl">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Schedule Class Slot</DialogTitle>
                    <DialogDescription>Assign a subject, faculty, and room to a specific time slot.</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-6 py-6">
                    <div className="space-y-2">
                        <Label>Select Batch</Label>
                        <Select value={formData.batchId || selectedBatch} onValueChange={(v) => setFormData({...formData, batchId: v})}>
                            <SelectTrigger className="h-11"><SelectValue placeholder="Select Batch" /></SelectTrigger>
                            <SelectContent>
                                {metadata.batches.map(b => <SelectItem key={b.id} value={b.id}>{b.name} ({b.course?.code})</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Subject</Label>
                        <Select required onValueChange={(v) => setFormData({...formData, subjectId: v})}>
                            <SelectTrigger className="h-11"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                            <SelectContent>
                                {metadata.subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Faculty Member</Label>
                        <Select required onValueChange={(v) => setFormData({...formData, facultyId: v})}>
                            <SelectTrigger className="h-11"><SelectValue placeholder="Assign Faculty" /></SelectTrigger>
                            <SelectContent>
                                {metadata.faculties.map(f => (
                                    <SelectItem key={f.id} value={f.id}>
                                        {f.user?.firstName} {f.user?.lastName} ({f.department?.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Room / Lab</Label>
                        <Input placeholder="e.g. Room 102 or Lab B" value={formData.roomInfo} onChange={(e) => setFormData({...formData, roomInfo: e.target.value})} className="h-11" />
                    </div>
                    <div className="space-y-2">
                        <Label>Day of Week</Label>
                        <Select value={formData.dayOfWeek} onValueChange={(v) => setFormData({...formData, dayOfWeek: v})}>
                            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Time</Label>
                            <Select value={formData.startTime} onValueChange={(v) => setFormData({...formData, startTime: v})}>
                                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {TIME_SLOTS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>End Time</Label>
                            <Input placeholder="10:00 AM" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} className="h-11" />
                        </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 px-8">
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Confirm Assignment
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <Search className="h-5 w-5 text-slate-400" />
            <div className="flex-1 max-w-sm">
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                    <SelectTrigger className="border-none bg-slate-50 font-bold focus:ring-0">
                        <SelectValue placeholder="Filter by Batch" />
                    </SelectTrigger>
                    <SelectContent>
                         {metadata.batches.map(b => <SelectItem key={b.id} value={b.id}>{b.name} ({b.course?.code})</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </div>

        {viewMode === 'grid' ? (
          <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden rounded-3xl">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/80">
                    <th className="p-6 border-r border-b border-slate-100 text-left text-xs font-black uppercase tracking-widest text-slate-400 w-32">Time / Day</th>
                    {DAYS.map(day => (
                      <th key={day} className="p-6 border-b border-slate-100 text-center text-xs font-black uppercase tracking-widest text-slate-600 min-w-[180px]">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map(slot => (
                    <tr key={slot}>
                      <td className="p-6 border-r border-b border-slate-100 text-sm font-bold bg-slate-50/30 text-slate-900">{slot}</td>
                      {DAYS.map(day => {
                        const entry = getEntryForSlot(day, slot);
                        return (
                          <td key={`${day}-${slot}`} className="p-3 border-b border-slate-100 h-32 relative hover:bg-slate-50/50 transition-colors group">
                            {entry ? (
                              <div className="h-full w-full p-4 rounded-2xl bg-white border border-blue-100 shadow-sm flex flex-col justify-between group-hover:shadow-md transition-all relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="h-3 w-3" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(entry.id)}>
                                                <Trash2 className="h-3 w-3 mr-2" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-blue-900 text-xs leading-tight line-clamp-2">{entry.subject?.name || 'Session'}</p>
                                    <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium"><User className="h-2 w-2" /> {entry.faculty?.user?.firstName} {entry.faculty?.user?.lastName}</p>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 text-[9px] px-2 py-0 border-none font-bold">
                                        <MapPin className="h-2 w-2 mr-1" /> {entry.roomInfo || 'TBD'}
                                    </Badge>
                                </div>
                              </div>
                            ) : (
                              <div className="h-full w-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-10 w-10 rounded-full bg-slate-100 text-slate-400 hover:bg-blue-600 hover:text-white shadow-sm"
                                    onClick={() => {
                                        setFormData({...formData, dayOfWeek: day, startTime: slot});
                                        setOpen(true);
                                    }}
                                >
                                  <Plus className="h-5 w-5" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
                [...Array(6)].map((_, i) => <Card key={i} className="h-32 bg-slate-50 animate-pulse border-none rounded-3xl" />)
            ) : entries.length === 0 ? (
                <div className="col-span-full py-20 text-center text-slate-400 font-medium">No slots scheduled for this batch.</div>
            ) : (
                entries.map((item, i) => (
                    <Card key={i} className="border-none shadow-lg shadow-slate-200/40 hover:scale-[1.02] transition-all rounded-3xl group">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-blue-600 border-none rounded-lg text-[10px] font-black">{item.dayOfWeek}</Badge>
                                        <span className="text-xs font-bold text-slate-400">{item.startTime}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{item.subject?.name}</h3>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-slate-300 group-hover:text-slate-600"><MoreVertical className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 mr-2" /> Delete Entry</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                        <User className="h-4 w-4" />
                                    </div>
                                    {item.faculty?.user?.firstName} {item.faculty?.user?.lastName}
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                        <MapPin className="h-3 w-3" /> {item.roomInfo}
                                    </div>
                                    <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-none font-bold text-[10px]">{item.batch?.name}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
