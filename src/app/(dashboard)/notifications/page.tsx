"use client"

import React, { useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Info, AlertTriangle, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCollegeStore } from '@/store/useCollegeStore';
import { differenceInDays, parseISO, formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const { colleges, notifications, markNotificationRead } = useCollegeStore();

  // Generate dynamic subscription notifications
  const dynamicNotifications = useMemo(() => {
    const alerts: any[] = [];
    colleges.forEach(college => {
      if (!college.subscription?.expiryDate) return;
      
      const daysLeft = differenceInDays(parseISO(college.subscription.expiryDate), new Date());
      if (daysLeft <= 7 && daysLeft > 0) {
        alerts.push({
          id: `sub-${college._id}`,
          title: 'Subscription Expiring Soon',
          message: `${college.name}'s subscription will expire in ${daysLeft} days (${new Date(college.subscription.expiryDate).toLocaleDateString()}).`,
          type: 'warning',
          timestamp: new Date().toISOString(),
          read: false,
          category: 'subscription'
        });
      } else if (daysLeft <= 0) {
        alerts.push({
          id: `sub-exp-${college._id}`,
          title: 'Subscription Expired',
          message: `${college.name}'s subscription has expired on ${new Date(college.subscription.expiryDate).toLocaleDateString()}.`,
          type: 'error',
          timestamp: new Date().toISOString(),
          read: false,
          category: 'subscription'
        });
      }
    });
    return alerts;
  }, [colleges]);

  const allNotifications = useMemo(() => {
    return [...dynamicNotifications, ...notifications].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [dynamicNotifications, notifications]);

  const unreadCount = allNotifications.filter(n => !n.read).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">Notifications</h1>
            <p className="text-muted-foreground text-sm">Stay updated with platform activities and alerts</p>
          </div>
          {unreadCount > 0 && (
            <Badge variant="default" className="px-3 py-1 bg-primary text-white font-bold animate-pulse">
              {unreadCount} New
            </Badge>
          )}
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {allNotifications.length > 0 ? (
              allNotifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-6 flex gap-5 transition-all hover:bg-slate-50/80 cursor-pointer group ${!notif.read ? 'bg-primary/[0.02] border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
                  onClick={() => markNotificationRead(notif.id)}
                >
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    notif.type === 'info' ? 'bg-blue-50 text-blue-600' :
                    notif.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                    notif.type === 'error' ? 'bg-rose-50 text-rose-600' :
                    'bg-emerald-50 text-emerald-600'
                  }`}>
                    {notif.type === 'info' && <Info className="h-6 w-6" />}
                    {notif.type === 'warning' && <AlertTriangle className="h-6 w-6" />}
                    {notif.type === 'error' && <AlertTriangle className="h-6 w-6" />}
                    {notif.type === 'success' && <CheckCircle2 className="h-6 w-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1.5">
                      <h3 className={`font-bold text-base tracking-tight ${!notif.read ? 'text-foreground' : 'text-slate-500'}`}>
                        {notif.title}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 whitespace-nowrap">
                          <Clock className="h-3.5 w-3.5" /> {formatDistanceToNow(parseISO(notif.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">{notif.message}</p>
                  </div>
                  {!notif.read && (
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                  )}
                </div>
              ))
            ) : (
              <div className="p-20 flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                  <Bell className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">All caught up!</h3>
                  <p className="text-sm text-slate-500">You have no new notifications at the moment.</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
