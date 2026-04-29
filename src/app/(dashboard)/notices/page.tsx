"use client"

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Megaphone, Send, Users, ShieldAlert, Info, Clock, Trash2, Loader2, Sparkles, Bell, ArrowRight } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export default function NoticesPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [notices, setNotices] = useState<any[]>([]);

  // Form States
  const [form, setForm] = useState({
    title: '',
    content: '',
    audience: 'Everyone',
    priority: 'Standard'
  });

  const fetchNotices = async () => {
    try {
      const res = await api.get('/api/notices');
      setNotices(res.data);
    } catch (err) {
      toast({ title: "Fetch Error", description: "Failed to load recent broadcasts.", variant: "destructive" });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleBroadcast = async () => {
    if (!form.title || !form.content) {
      return toast({ title: "Validation Error", description: "Title and message are required.", variant: "destructive" });
    }

    setLoading(true);
    try {
      await api.post('/api/notices', form);
      toast({ 
        title: "Broadcast Successful", 
        description: "Your announcement has been sent to the target audience.",
      });
      setForm({ title: '', content: '', audience: 'Everyone', priority: 'Standard' });
      fetchNotices();
    } catch (err) {
      toast({ title: "Broadcast Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/notices/${id}`);
      setNotices(notices.filter(n => n.id !== id));
      toast({ title: "Notice Removed" });
    } catch (err) {
      toast({ title: "Delete Failed", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-between items-end">
            <div>
                <div className="flex items-center gap-2 text-indigo-600 font-bold mb-2">
                    <Bell className="h-5 w-5" />
                    <span className="text-sm tracking-widest uppercase">Communication Hub</span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Broadcasting & Notices</h1>
                <p className="text-slate-500 font-medium mt-1">Send real-time announcements to students, faculty, or entire departments</p>
            </div>
            <div className="hidden lg:flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600">
                    <Megaphone className="h-5 w-5" />
                </div>
                <div className="pr-4">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">Live Status</p>
                    <p className="text-sm font-bold text-slate-700">System Online</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl border border-white">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-indigo-500" /> Draft Announcement
              </CardTitle>
              <CardDescription className="text-slate-500 font-medium">Compose a message that will be broadcasted instantly.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Announcement Title</label>
                <Input 
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                    placeholder="Enter a catchy and clear title..." 
                    className="h-14 rounded-2xl bg-slate-50/50 border-slate-100 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-lg px-6" 
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Target Audience</label>
                  <Select value={form.audience} onValueChange={(v) => setForm({...form, audience: v})}>
                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50/50 border-slate-100 px-6 font-bold text-slate-700">
                      <SelectValue placeholder="Target Audience" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                      <SelectItem value="Everyone">Everyone</SelectItem>
                      <SelectItem value="Students">Students Only</SelectItem>
                      <SelectItem value="Faculty">Faculty Only</SelectItem>
                      <SelectItem value="Staff">Administrative Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Urgency Level</label>
                  <Select value={form.priority} onValueChange={(v) => setForm({...form, priority: v})}>
                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50/50 border-slate-100 px-6 font-bold text-slate-700">
                      <SelectValue placeholder="Priority Level" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                      <SelectItem value="Standard">Standard / General</SelectItem>
                      <SelectItem value="Info">Informational</SelectItem>
                      <SelectItem value="Critical">Critical / Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Detailed Message</label>
                <Textarea 
                  value={form.content}
                  onChange={(e) => setForm({...form, content: e.target.value})}
                  placeholder="Provide all necessary details here..." 
                  className="min-h-[180px] rounded-[2rem] bg-slate-50/50 border-slate-100 p-6 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button 
                    className="w-full sm:w-auto h-14 px-10 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-lg shadow-xl shadow-slate-200 transition-all active:scale-95 flex gap-3" 
                    onClick={handleBroadcast} 
                    disabled={loading}
                >
                  {loading ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Broadcasting...
                    </>
                  ) : (
                    <>
                      Send Announcement <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">History & Logs</h3>
                <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-none font-black text-[10px]">{notices.length} Sent</Badge>
            </div>
            
            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                {fetching ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-32 w-full bg-slate-50 rounded-3xl animate-pulse border border-slate-100" />
                    ))
                ) : notices.length === 0 ? (
                    <div className="py-20 text-center bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                        <Megaphone className="h-10 w-10 mx-auto text-slate-300 mb-3 opacity-50" />
                        <p className="text-slate-400 font-bold text-sm">No recent broadcasts</p>
                    </div>
                ) : (
                    notices.map((notice) => (
                        <Card key={notice.id} className="border-none shadow-lg shadow-slate-200/40 group hover:shadow-xl transition-all rounded-3xl overflow-hidden bg-white">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <Badge className={`text-[9px] font-black uppercase tracking-widest border-none px-3 py-1 rounded-full ${
                                        notice.priority === 'Critical' ? 'bg-red-100 text-red-600' : 
                                        notice.priority === 'Info' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        {notice.priority}
                                    </Badge>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => handleDelete(notice.id)}
                                        className="h-8 w-8 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <h4 className="font-bold text-slate-900 leading-tight mb-2">{notice.title}</h4>
                                <p className="text-xs text-slate-500 line-clamp-2 font-medium mb-4">
                                    {notice.content}
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50 text-[10px] font-bold">
                                    <span className="flex items-center gap-1.5 text-slate-400"><Users className="h-3.5 w-3.5" /> {notice.audience}</span>
                                    <span className="flex items-center gap-1.5 text-slate-400"><Clock className="h-3.5 w-3.5" /> {formatDistanceToNow(new Date(notice.createdAt))} ago</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
