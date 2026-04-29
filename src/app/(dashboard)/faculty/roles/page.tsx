"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RoleAssigner from '@/components/RoleMatrix/RoleAssigner';
import { UsersRound, Search, Loader2, UserPlus, Shield } from 'lucide-react';
import api from '@/lib/axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function FacultyRolesPage() {
  const [loading, setLoading] = useState(true);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/faculty');
      setFaculty(res.data);
      if (res.data.length > 0) setSelectedFaculty(res.data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const filteredFaculty = faculty.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-bold mb-2 uppercase tracking-widest text-[10px]">
                <Shield className="h-4 w-4" /> Security & Access
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              Role Matrix
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Assign robust access hierarchies to faculty members securely.
            </p>
          </div>
        </div>

        {loading ? (
            <div className="h-[50vh] flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-400 font-bold">Loading Access Matrix...</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Faculty List Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Search Faculty..." 
                            className="h-12 pl-12 rounded-2xl bg-white border-slate-100 shadow-sm focus:ring-2 focus:ring-blue-500/20 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredFaculty.map((f) => (
                            <Card 
                                key={f._id} 
                                onClick={() => setSelectedFaculty(f)}
                                className={`cursor-pointer border-none shadow-sm transition-all rounded-2xl overflow-hidden ${
                                    selectedFaculty?._id === f._id ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-white hover:bg-slate-50'
                                }`}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border-2 border-white/20">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${f.name}`} />
                                            <AvatarFallback>{f.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className={`text-sm font-bold leading-tight ${selectedFaculty?._id === f._id ? 'text-white' : 'text-slate-900'}`}>{f.name}</p>
                                            <p className={`text-[10px] font-medium mt-0.5 ${selectedFaculty?._id === f._id ? 'text-blue-100' : 'text-slate-400'}`}>{f.department} • {f.role}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Role Assigner Matrix */}
                <div className="lg:col-span-8 flex justify-center lg:justify-start">
                    {selectedFaculty ? (
                        <div className="w-full animate-in slide-in-from-right-4 duration-500">
                             <RoleAssigner 
                                userName={selectedFaculty.name} 
                                userEmail={selectedFaculty.email} 
                            />
                        </div>
                    ) : (
                        <div className="w-full h-[400px] bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                            <UserPlus className="h-12 w-12 mb-4 opacity-20" />
                            <p className="font-bold">Select a faculty member to manage roles</p>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    </DashboardLayout>
  );
}
