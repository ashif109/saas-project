
"use client"

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Megaphone, Send, Users, ShieldAlert, Info, Clock, Trash2 } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const RECENT_NOTICES = [
  { id: 1, title: 'Semester Exams Rescheduled', target: 'All Students', type: 'Critical', time: '1h ago' },
  { id: 2, title: 'Cultural Fest Volunteers Needed', target: 'UG Students', type: 'Info', time: '5h ago' },
  { id: 3, title: 'Holiday Announcement', target: 'Staff & Students', type: 'Standard', time: '1d ago' },
];

export default function NoticesPage() {
  const [loading, setLoading] = useState(false);

  const handleBroadcast = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Broadcasting & Notices</h1>
          <p className="text-muted-foreground">Send real-time announcements to students, faculty, or entire departments</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" /> Create Announcement
              </CardTitle>
              <CardDescription>Draft and broadcast your message instantly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Title</label>
                <Input placeholder="Enter notice title..." className="bg-secondary/30 border-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Audience</label>
                  <Select defaultValue="all">
                    <SelectTrigger className="bg-secondary/30 border-none">
                      <SelectValue placeholder="Target Audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Everyone</SelectItem>
                      <SelectItem value="students">Students Only</SelectItem>
                      <SelectItem value="faculty">Faculty Only</SelectItem>
                      <SelectItem value="cs">CS Department</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Priority</label>
                  <Select defaultValue="standard">
                    <SelectTrigger className="bg-secondary/30 border-none">
                      <SelectValue placeholder="Priority Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Standard / Info</SelectItem>
                      <SelectItem value="medium">Important</SelectItem>
                      <SelectItem value="high">Critical Alert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Message Body</label>
                <Textarea 
                  placeholder="Write your announcement details here..." 
                  className="min-h-[150px] bg-secondary/30 border-none"
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button className="pulse-hover w-full sm:w-auto" onClick={handleBroadcast} disabled={loading}>
                  {loading ? 'Broadcasting...' : (
                    <>
                      <Send className="h-4 w-4 mr-2" /> Send Announcement
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Recent Broadcasts</h3>
            {RECENT_NOTICES.map((notice) => (
              <Card key={notice.id} className="border-none shadow-sm group">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={notice.type === 'Critical' ? 'destructive' : 'secondary'} className="text-[10px]">
                      {notice.type}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                  <h4 className="font-bold text-sm mb-1">{notice.title}</h4>
                  <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {notice.target}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {notice.time}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
