"use client"

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Megaphone, Send, Loader2, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';

export default function PublishNoticePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const ROLES = [
    { id: 'STUDENT', label: 'Students' },
    { id: 'FACULTY', label: 'Faculty' },
    { id: 'COLLEGE_ADMIN', label: 'Admin Staff' },
  ];

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(r => r !== roleId) 
        : [...prev, roleId]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      content: formData.get('content'),
      targetRoles: selectedRoles,
      targetDepts: [], // Simplified for now
    };

    try {
      await api.post('/api/notices', data);
      toast({
        title: "Notice Published",
        description: "Your announcement is now live for the selected audience.",
      });
      router.push('/notices');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to publish notice.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-600/10 rounded-2xl">
            <Megaphone className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Broadcast New Notice
            </h1>
            <p className="text-slate-500">
              Send important announcements and updates to your campus community.
            </p>
          </div>
        </div>

        <Card className="border-none shadow-xl shadow-blue-500/5 bg-white/80 backdrop-blur-sm">
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />
          <CardHeader>
            <CardTitle>Notice Details</CardTitle>
            <CardDescription>Draft your message and select the target audience.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold text-slate-700">Notice Title</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    placeholder="e.g. End Semester Examination Schedule 2024" 
                    required 
                    className="h-12 border-slate-200 focus:ring-blue-500 text-lg font-medium"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-sm font-semibold text-slate-700">Announcement Content</Label>
                  <Textarea 
                    id="content" 
                    name="content" 
                    placeholder="Write your detailed announcement here..." 
                    required 
                    className="min-h-[200px] border-slate-200 focus:ring-blue-500 leading-relaxed"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    Target Audience
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                  </Label>
                  <div className="flex flex-wrap gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    {ROLES.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={role.id} 
                          checked={selectedRoles.includes(role.id)}
                          onCheckedChange={() => handleRoleToggle(role.id)}
                        />
                        <label
                          htmlFor={role.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 cursor-pointer"
                        >
                          {role.label}
                        </label>
                      </div>
                    ))}
                    <div className="text-[11px] text-slate-400 italic mt-1 w-full">
                      * Leave unchecked to broadcast to everyone.
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => router.back()}
                  className="h-12 px-6 font-medium text-slate-500 hover:text-slate-700"
                >
                  Save as Draft
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="h-12 px-10 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 font-semibold transition-all hover:scale-[1.02] active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Publish Notice
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
