import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, CreditCard, Calendar, ShieldCheck, Clock, Activity } from 'lucide-react';
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
    if (action.includes('ENROLL')) return 'text-indigo-600 bg-indigo-50 border-indigo-100';
    if (action.includes('PAYMENT')) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (action.includes('TIMETABLE')) return 'text-blue-600 bg-blue-50 border-blue-100';
    if (action.includes('ROLE')) return 'text-orange-600 bg-orange-50 border-orange-100';
    return 'text-slate-600 bg-slate-50 border-slate-100';
  };

  return (
    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
      <CardHeader className="pb-6 pt-8 px-8 flex flex-row items-center justify-between">
        <div>
            <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Audit Trail</CardTitle>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Institutional Integrity</p>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
            <Activity size={20} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6 relative px-8 pb-8">
        <div className="absolute left-[3.25rem] top-8 bottom-24 w-[1px] bg-slate-100" />
        
        {(!data || data.length === 0) ? (
            <div className="py-12 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                <Clock className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 font-bold text-sm">No activity records</p>
            </div>
        ) : data.map((item, i) => {
          const Icon = getIcon(item.action);
          const colors = getIconColor(item.action);
          return (
            <div key={i} className="flex gap-5 relative z-10 group">
              <div className={`h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center shadow-sm border transition-transform group-hover:scale-110 ${colors}`}>
                <Icon size={20} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{item.action.replace(/_/g, ' ')}</p>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{item.user}</p>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <p className="text-[10px] font-black text-indigo-500/60 uppercase tracking-tighter">
                        {formatDistanceToNow(new Date(item.time))} ago
                    </p>
                </div>
              </div>
            </div>
          );
        })}

        <Button variant="outline" className="w-full mt-2 h-14 rounded-2xl border-slate-100 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 transition-all">
          Sync Full History
        </Button>
      </CardContent>
    </Card>
  );
}
