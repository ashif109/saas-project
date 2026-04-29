import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export function NoticePanel({ data }: { data?: any[] }) {
  return (
    <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Megaphone size={18} />
            </div>
            <CardTitle className="text-xl font-bold">Notice Board</CardTitle>
        </div>
        <Link href="/notices">
            <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 text-slate-400 hover:text-indigo-600">
                <Plus size={20} />
            </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4 py-4">
        {(!data || data.length === 0) ? (
            <div className="py-10 text-center">
                <p className="text-slate-400 font-bold text-sm">No recent notices published.</p>
            </div>
        ) : data.map((notice, i) => (
          <div key={i} className="group cursor-pointer">
            <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">{notice.title}</h4>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500 py-0.5 px-2 border-none rounded-full">
                {notice.audience}
              </Badge>
              <span className="text-[10px] font-bold text-slate-400">
                {formatDistanceToNow(new Date(notice.createdAt))} ago
              </span>
            </div>
            {i !== data.length - 1 && <div className="h-px w-full bg-slate-50 mt-4" />}
          </div>
        ))}
        
        <Link href="/notices" className="block pt-2">
          <Button variant="ghost" className="w-full text-indigo-600 font-black text-xs uppercase tracking-widest hover:bg-indigo-50 rounded-xl flex items-center justify-center gap-2">
            View All Notices <ArrowRight size={14} />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
