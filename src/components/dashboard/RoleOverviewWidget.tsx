import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, UserCog, Users2, GraduationCap, AlertCircle, Fingerprint } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function RoleOverviewWidget({ data }: { data?: any[] }) {
  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('admin')) return ShieldCheck;
    if (n.includes('director')) return UserCog;
    if (n.includes('hod')) return Users2;
    return GraduationCap;
  };

  return (
    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
      <CardHeader className="pb-4 pt-8 px-8 flex flex-row items-center justify-between border-b border-slate-50/50">
        <div>
            <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Access Control</CardTitle>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Hierarchy Distribution</p>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
            <Fingerprint size={20} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-8">
        {(data || []).length === 0 ? (
            <div className="py-10 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                <p className="text-slate-400 font-bold text-xs">No roles defined</p>
            </div>
        ) : data.map((role, i) => {
          const Icon = getIcon(role.name);
          return (
            <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-50 group hover:border-indigo-100 hover:shadow-sm transition-all">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Icon size={18} strokeWidth={2.5} />
                </div>
                <span className="text-[13px] font-black text-slate-700 uppercase tracking-tighter">{role.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-slate-900">{role.count}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Users</span>
              </div>
            </div>
          );
        })}
        
        {/* Dynamic Alert or Placeholder */}
        <div className="mt-4 p-5 bg-indigo-50/50 rounded-[1.5rem] border border-indigo-100/50 flex gap-4">
          <div className="h-10 w-10 shrink-0 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-black text-indigo-900 uppercase tracking-tight">Security Protocol</p>
            <p className="text-[10px] font-bold text-indigo-600/70 mt-0.5 leading-tight">Multi-role matrix is currently active for all administrative accounts.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
