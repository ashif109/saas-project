"use client"

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send, CheckCircle2, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';

export default function FacultyDoubtsPage() {
  const { user: currentUser } = useAuthStore();
  const [selectedDoubt, setSelectedDoubt] = useState<any>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [doubtsList, setDoubtsList] = useState<any[]>([]);

  const fetchDoubts = async () => {
    try {
      const res = await api.get('/api/doubts');
      setDoubtsList(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch doubts");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDoubts();
  }, []);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selectedDoubt) return;
    
    try {
      await api.post(`/api/doubts/${selectedDoubt.id}/reply`, { message: reply });
      toast.success("Reply sent to student.");
      setReply('');
      fetchDoubts();
      // Refresh selected doubt to show new reply
      const updatedDoubt = { ...selectedDoubt };
      updatedDoubt.replies.push({
          message: reply,
          user: { firstName: currentUser?.firstName, lastName: currentUser?.lastName },
          createdAt: new Date().toISOString(),
          userId: currentUser?.id
      });
      setSelectedDoubt(updatedDoubt);
    } catch (err) {
      toast.error("Failed to send reply");
    }
  };

  const markResolved = async () => {
    if (!selectedDoubt) return;
    try {
        await api.patch(`/api/doubts/${selectedDoubt.id}`, { status: 'RESOLVED' });
        toast.success("Query marked as resolved.");
        fetchDoubts();
        setSelectedDoubt(prev => ({ ...prev, status: 'RESOLVED' }));
    } catch (err) {
        toast.error("Failed to update status");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-100px)] flex flex-col">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Doubt & Query Resolution</h1>
          <p className="text-slate-500">Respond to student academic queries efficiently.</p>
        </div>

        <div className="flex gap-6 h-full min-h-[500px]">
          {/* List of Doubts */}
          <Card className="w-1/3 border-none shadow-xl shadow-slate-200/40 flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Inbox (2)</h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="divide-y divide-slate-100">
                {doubtsList.map(doubt => (
                  <div 
                    key={doubt.id} 
                    onClick={() => setSelectedDoubt(doubt)}
                    className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${selectedDoubt?.id === doubt.id ? 'bg-indigo-50/50 border-l-4 border-indigo-500' : 'border-l-4 border-transparent'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-slate-200 text-slate-600 text-xs font-bold">{doubt.student?.user?.firstName?.substring(0,1)}{doubt.student?.user?.lastName?.substring(0,1)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-none">{doubt.student?.user?.firstName} {doubt.student?.user?.lastName}</p>
                          <p className="text-[10px] text-slate-500">{doubt.subject?.name}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={doubt.status === 'OPEN' ? 'border-rose-200 text-rose-600 bg-rose-50' : 'border-emerald-200 text-emerald-600 bg-emerald-50'}>
                        {doubt.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{doubt.question}</p>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">{new Date(doubt.createdAt).toLocaleTimeString()}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Doubt Detail View */}
          <Card className="flex-1 border-none shadow-xl shadow-slate-200/40 flex flex-col bg-slate-50/30 overflow-hidden">
            {selectedDoubt ? (
              <>
                <div className="p-6 bg-white border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedDoubt.subject?.name} Query</h2>
                    <p className="text-sm text-slate-500">Raised by {selectedDoubt.student?.user?.firstName} {selectedDoubt.student?.user?.lastName}</p>
                  </div>
                  {selectedDoubt.status === 'OPEN' && (
                    <Button onClick={markResolved} variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 font-bold">
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Resolved
                    </Button>
                  )}
                </div>
                
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-6">
                    {/* Original Question */}
                    <div className="flex gap-4">
                      <Avatar className="h-10 w-10 shrink-0 shadow-sm">
                        <AvatarFallback className="bg-slate-200 text-slate-700 font-bold">{selectedDoubt.student?.user?.firstName?.substring(0,1)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm text-slate-800">
                          <p className="leading-relaxed">{selectedDoubt.question}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 ml-1 block font-medium flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(selectedDoubt.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Replies */}
                    {selectedDoubt.replies.map((reply: any, i: number) => (
                      <div key={i} className={`flex gap-4 ${reply.userId === currentUser?.id ? 'flex-row-reverse' : ''}`}>
                        <Avatar className="h-10 w-10 shrink-0 shadow-sm">
                          <AvatarFallback className={reply.userId === currentUser?.id ? 'bg-indigo-100 text-indigo-700 font-bold' : 'bg-slate-200 text-slate-700 font-bold'}>
                            {reply.userId === currentUser?.id ? 'ME' : reply.user?.firstName?.substring(0,1)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className={`p-4 rounded-2xl shadow-sm text-slate-800 ${reply.userId === currentUser?.id ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 rounded-tl-none'}`}>
                            <p className="leading-relaxed">{reply.message}</p>
                          </div>
                          <span className={`text-[10px] text-slate-400 mt-1 block font-medium flex items-center gap-1 ${reply.userId === currentUser?.id ? 'justify-end mr-1' : 'ml-1'}`}><Clock className="h-3 w-3" /> {new Date(reply.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {selectedDoubt.status === 'OPEN' ? (
                  <div className="p-4 bg-white border-t border-slate-100">
                    <form onSubmit={handleSendReply} className="flex gap-2">
                      <Input 
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Type your explanation..." 
                        className="h-12 bg-slate-50 border-slate-200 rounded-xl" 
                      />
                      <Button type="submit" className="h-12 w-12 shrink-0 bg-indigo-600 hover:bg-indigo-700 rounded-xl">
                        <Send className="h-5 w-5" />
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 border-t border-emerald-100 text-center text-emerald-600 font-bold text-sm">
                    This query has been resolved and closed.
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 h-full p-10 text-center">
                <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                  <MessageSquare className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-500 mb-2">Select a Query</h3>
                <p className="max-w-xs text-sm">Choose a student doubt from the inbox to read the details and provide an explanation.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
