import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, CreditCard, Calendar, ShieldCheck, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function RecentActivity({ data }: { data?: any[] }) {
  const getIcon = (action: string) => {
    if (action.includes('ENROLL')) return UserPlus;
    if (action.includes('PAYMENT') || action.includes('FEE')) return CreditCard;
    if (action.includes('TIMETABLE')) return Calendar;
    if (action.includes('ROLE')) return ShieldCheck;
    return Clock;
  };

  const getIconColor = (action: string) => {
    if (action.includes('ENROLL')) return 'text-indigo-500 bg-indigo-50';
    if (action.includes('PAYMENT')) return 'text-emerald-500 bg-emerald-50';
    if (action.includes('TIMETABLE')) return 'text-blue-500 bg-blue-50';
    if (action.includes('ROLE')) return 'text-orange-500 bg-orange-50';
    return 'text-slate-500 bg-slate-50';
  };

  return (
    <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 relative">
        <div className="absolute left-10 top-10 bottom-24 w-0.5 bg-slate-50" />
        
        {(!data || data.length === 0) ? (
            <div className="py-10 text-center">
                <p className="text-slate-400 font-bold text-sm">No activity logs found.</p>
            </div>
        ) : data.map((item, i) => {
          const Icon = getIcon(item.action);
          const colors = getIconColor(item.action);
          return (
            <div key={i} className="flex gap-4 relative z-10">
              <div className={`h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center shadow-sm ${colors}`}>
                <Icon size={18} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 leading-snug">{item.action.replace(/_/g, ' ')}</p>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">{item.user}</p>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-tighter mt-1">
                    {formatDistanceToNow(new Date(item.time))} ago
                </p>
              </div>
            </div>
          );
        })}

        <Button variant="outline" className="w-full mt-2 py-6 rounded-2xl border-slate-100 font-bold text-slate-500 hover:bg-slate-50 transition-all">
          View All Logs
        </Button>
      </CardContent>
    </Card>
  );
}
