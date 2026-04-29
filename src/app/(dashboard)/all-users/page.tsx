"use client"

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  MoreVertical, 
  Mail,
  Shield,
  UserCheck,
  Building2,
  Loader2
} from 'lucide-react';
import { TableComponent } from '@/components/superadmin/TableComponent';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import api from '@/lib/axios';

export default function AllUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    { 
      header: 'User', 
      accessor: (item: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name}`} />
            <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-slate-900">{item.name}</span>
            <span className="text-[10px] text-muted-foreground font-medium">{item.email}</span>
          </div>
        </div>
      )
    },
    { 
      header: 'Role', 
      accessor: (item: any) => (
        <Badge variant="outline" className="capitalize font-bold text-[10px] bg-indigo-50 text-indigo-600 border-none px-3">
          {item.role.toLowerCase().replace('_', ' ')}
        </Badge>
      )
    },
    { 
      header: 'College', 
      accessor: (item: any) => (
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Building2 className="h-3 w-3" />
          {item.college}
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: (item: any) => (
        <Badge variant={item.status === 'Active' ? 'default' : 'secondary'} className={`h-5 text-[9px] font-black tracking-widest uppercase px-2 ${
            item.status === 'Active' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-none' : 'bg-slate-100 text-slate-500 border-none'
        }`}>
          {item.status}
        </Badge>
      )
    },
    { 
      header: 'Actions', 
      accessor: (item: any) => (
        <div className="flex justify-end pr-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-none shadow-2xl">
              <DropdownMenuItem className="font-medium">Edit Profile</DropdownMenuItem>
              <DropdownMenuItem className="font-medium">Reset Password</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive font-bold">Suspend User</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ];

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h1>
            <p className="text-slate-500 font-medium mt-1">Manage all system users, roles, and access controls</p>
          </div>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-12 px-6 font-black shadow-xl shadow-slate-200">
            <Plus className="h-4 w-4 mr-2" /> Add New User
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm bg-indigo-600 text-white rounded-3xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><Users size={60} /></div>
            <CardContent className="p-6">
               <p className="text-xs font-black uppercase tracking-widest opacity-80">Total Users</p>
               <p className="text-3xl font-black mt-2">{loading ? '...' : users.length}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-6">
               <p className="text-xs font-black uppercase tracking-widest text-slate-400">System Admins</p>
               <p className="text-3xl font-black mt-2 text-slate-900">{loading ? '...' : users.filter(u => u.role.includes('ADMIN')).length}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-6">
               <p className="text-xs font-black uppercase tracking-widest text-slate-400">Active Now</p>
               <p className="text-3xl font-black mt-2 text-slate-900">{loading ? '...' : users.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="pb-4 bg-slate-50/50">
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search by name or email..." 
                  className="pl-11 h-12 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="h-12 px-6 rounded-2xl font-bold border-slate-100 bg-white">
                <Filter className="h-4 w-4 mr-2" /> All Roles
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
                    <p className="text-slate-400 font-bold">Synchronizing User Database...</p>
                </div>
            ) : (
                <TableComponent 
                    data={filteredUsers} 
                    columns={columns} 
                    className="border-none"
                />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
