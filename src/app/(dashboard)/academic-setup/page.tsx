"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Calendar, Layers, BookOpen, Clock, Plus, Settings2, Loader2, Info, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export default function AcademicSetupPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('years');
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openYearDialog, setOpenYearDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Edit State
  const [editingYear, setEditingYear] = useState<any>(null);

  const [yearForm, setYearForm] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });

  const tabs = [
    { id: 'years', label: 'Academic Years', icon: Calendar },
    { id: 'courses', label: 'Courses & Degrees', icon: BookOpen },
    { id: 'batches', label: 'Batch Management', icon: Layers },
    { id: 'terms', label: 'Semesters / Terms', icon: Clock },
  ];

  const fetchYears = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/academic-years');
      setAcademicYears(res.data);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to fetch academic years.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  const handleYearSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingYear) {
        await api.put(`/api/academic-years/${editingYear.id}`, yearForm);
        toast({ title: "Updated", description: "Academic year updated successfully." });
      } else {
        await api.post('/api/academic-years', yearForm);
        toast({ title: "Success", description: "Academic year created successfully." });
      }
      setOpenYearDialog(false);
      setEditingYear(null);
      setYearForm({ name: '', startDate: '', endDate: '' });
      fetchYears();
    } catch (err: any) {
      toast({
        title: "Failed",
        description: err.response?.data?.message || "Something went wrong.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteYear = async (id: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    try {
      await api.delete(`/api/academic-years/${id}`);
      toast({ title: "Deleted", description: "Session removed successfully." });
      fetchYears();
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const startEdit = (year: any) => {
    setEditingYear(year);
    setYearForm({
      name: year.name,
      startDate: new Date(year.startDate).toISOString().split('T')[0],
      endDate: new Date(year.endDate).toISOString().split('T')[0]
    });
    setOpenYearDialog(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 rounded-2xl">
                <Settings2 className="w-8 h-8 text-blue-600" />
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Academic Setup
                </h1>
                <p className="text-slate-500 mt-1">
                Configure your institutional structure, timelines, and academic requirements.
                </p>
            </div>
          </div>
          
          <Dialog open={openYearDialog} onOpenChange={(val) => {
              setOpenYearDialog(val);
              if (!val) { setEditingYear(null); setYearForm({ name: '', startDate: '', endDate: '' }); }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 px-6 py-6 rounded-2xl font-bold transition-all hover:scale-[1.02]">
                <Plus className="mr-2 h-5 w-5" />
                Create New Academic Year
              </Button>
            </DialogTrigger>
            <DialogContent className="border-none shadow-2xl">
              <form onSubmit={handleYearSubmit}>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">{editingYear ? 'Edit Session' : 'Configure Academic Year'}</DialogTitle>
                  <DialogDescription>Set the timeline for the academic session.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                  <div className="space-y-2">
                    <Label htmlFor="yearName">Session Name</Label>
                    <Input 
                      id="yearName" 
                      placeholder="e.g. 2024 - 2025" 
                      required 
                      value={yearForm.name}
                      onChange={(e) => setYearForm({...yearForm, name: e.target.value})}
                      className="h-11"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input 
                        id="startDate" 
                        type="date" 
                        required 
                        value={yearForm.startDate}
                        onChange={(e) => setYearForm({...yearForm, startDate: e.target.value})}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input 
                        id="endDate" 
                        type="date" 
                        required 
                        value={yearForm.endDate}
                        onChange={(e) => setYearForm({...yearForm, endDate: e.target.value})}
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setOpenYearDialog(false)}>Cancel</Button>
                  <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 px-8">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {editingYear ? 'Save Changes' : 'Create Session'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="flex overflow-x-auto border-b border-slate-100 bg-slate-50/30 px-6 pt-6 hide-scrollbar gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all whitespace-nowrap rounded-t-2xl ${
                  activeTab === tab.id 
                    ? 'bg-white text-blue-600 shadow-[0_-4px_0_0_#2563eb] border-x border-t border-slate-100' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8 min-h-[500px]">
            {activeTab === 'years' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-slate-800">Available Academic Sessions</h2>
                    <div className="p-2 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Only one session can be "Active" at a time.
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
                        <p className="font-medium">Loading session timelines...</p>
                    </div>
                ) : academicYears.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-3xl text-slate-400">
                         <Calendar className="w-12 h-12 mb-4 opacity-10" />
                         <p>No academic years configured yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {academicYears.map((year, idx) => (
                            <div 
                                key={year.id} 
                                className={`p-6 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                                    idx === 0 
                                    ? 'border-blue-100 bg-blue-50/50 shadow-sm' 
                                    : 'border-slate-100 hover:border-slate-200'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${idx === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-lg ${idx === 0 ? 'text-blue-900' : 'text-slate-700'}`}>
                                            {year.name} {idx === 0 && "(Active)"}
                                        </h3>
                                        <p className="text-sm text-slate-500 font-medium">
                                            {new Date(year.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} 
                                            {" — "} 
                                            {new Date(year.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {idx === 0 ? (
                                        <span className="bg-blue-600 text-white text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest shadow-lg shadow-blue-600/30">
                                            CURRENT
                                        </span>
                                    ) : (
                                        <span className="bg-slate-200 text-slate-500 text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest">
                                            DRAFT
                                        </span>
                                    )}
                                    
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:bg-white hover:text-blue-600 shadow-sm transition-all rounded-xl">
                                            <Settings2 className="w-5 h-5" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="border-none shadow-2xl rounded-xl p-2">
                                        <DropdownMenuItem onClick={() => startEdit(year)} className="flex items-center gap-2 cursor-pointer rounded-lg p-2.5">
                                          <Edit2 className="w-4 h-4 text-blue-600" />
                                          <span className="font-semibold text-slate-700">Edit Session</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => deleteYear(year.id)} className="flex items-center gap-2 cursor-pointer rounded-lg p-2.5 text-destructive focus:bg-red-50 focus:text-destructive">
                                          <Trash2 className="w-4 h-4" />
                                          <span className="font-semibold">Remove Session</span>
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
              </div>
            )}

            {activeTab !== 'years' && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4 py-20">
                <div className="p-6 bg-slate-50 rounded-3xl">
                    {(() => {
                        const IconComponent = tabs.find(t => t.id === activeTab)?.icon;
                        return IconComponent ? <IconComponent size={48} className="text-slate-200" /> : null;
                    })()}
                </div>
                <div className="text-center">
                    <p className="font-bold text-slate-600 text-lg">Manage {tabs.find(t => t.id === activeTab)?.label}</p>
                    <p className="text-sm max-w-xs mx-auto">Click the button above to start configuring your institutional structure.</p>
                </div>
                <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 font-bold">
                    Learn More &rarr;
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
