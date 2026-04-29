import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, UserCog, Users2, GraduationCap, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function RoleOverviewWidget({ data }: { data?: any[] }) {
  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'super admin': return ShieldCheck;
      case 'director': return UserCog;
      case 'hod': return Users2;
      case 'faculty': return GraduationCap;
      default: return GraduationCap;
    }
  };

  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold">Role Distribution</CardTitle>
        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest text-green-600 border-green-100 bg-green-50">Active</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {(data || []).map((role, i) => {
          const Icon = getIcon(role.name);
          return (
            <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100/50 group hover:border-indigo-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm text-slate-400 group-hover:text-indigo-600 transition-colors">
                  <Icon size={18} strokeWidth={2} />
                </div>
                <span className="text-sm font-bold text-slate-700">{role.name}</span>
              </div>
              <span className="text-sm font-black text-slate-900">{role.count}</span>
            </div>
          );
        })}
        
        <div className="mt-4 p-4 bg-red-50 rounded-2xl border border-red-100 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-red-900 uppercase tracking-tight">Department without HOD</p>
            <p className="text-[10px] font-medium text-red-700 mt-0.5">Civil Engineering requires immediate assignment.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
