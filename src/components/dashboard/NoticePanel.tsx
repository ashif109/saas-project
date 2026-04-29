import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone, Plus, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export function NoticePanel({ data }: { data?: any[] }) {
  return (
    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white group/card">
      <CardHeader className="pb-4 flex flex-row items-center justify-between border-b border-slate-50/50 bg-slate-50/30">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200 group-hover/card:scale-110 transition-transform">
                <Megaphone size={18} />
            </div>
            <div>
                <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Broadcasting</CardTitle>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Campus Updates</p>
            </div>
        </div>
        <Link href="/notices">
            <Button variant="ghost" size="icon" className="rounded-2xl h-10 w-10 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                <Plus size={22} />
            </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-5 p-8">
        {(!data || data.length === 0) ? (
            <div className="py-12 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                <Sparkles className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 font-bold text-sm tracking-tight">No recent broadcasts</p>
            </div>
        ) : data.map((notice, i) => (
          <div key={i} className="group cursor-pointer">
            <h4 className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">{notice.title}</h4>
            <div className="flex items-center gap-3 mt-3">
              <Badge variant="secondary" className={`text-[9px] font-black uppercase tracking-tighter py-0.5 px-3 border-none rounded-full ${
                  notice.priority === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-indigo-50 text-indigo-600'
              }`}>
                {notice.audience}
              </Badge>
              <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-slate-200" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    {formatDistanceToNow(new Date(notice.createdAt))} ago
                  </span>
              </div>
            </div>
            {i !== data.length - 1 && <div className="h-px w-full bg-slate-50 mt-5" />}
          </div>
        ))}
        
        <Link href="/notices" className="block pt-3">
          <Button variant="ghost" className="w-full text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-50 rounded-2xl flex items-center justify-center gap-3 h-12 border border-dashed border-indigo-100 group">
            Access Hub <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
