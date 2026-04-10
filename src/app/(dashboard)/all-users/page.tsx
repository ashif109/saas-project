"use client"

import React, { useState } from 'react';
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
  GraduationCap
} from 'lucide-react';
import { TableComponent } from '@/components/superadmin/TableComponent';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ALL_USERS_DATA = [
  { id: '1', name: 'Rajesh Kumar', email: 'rajesh@pulse.edu', role: 'SUPER_ADMIN', college: 'System', status: 'Active' },
  { id: '2', name: 'Dr. Sarah Smith', email: 'sarah.s@stanford.edu', role: 'COLLEGE_ADMIN', college: 'Stanford University', status: 'Active' },
  { id: '3', name: 'Prof. Alan Turing', email: 'alan@mit.edu', role: 'FACULTY', college: 'MIT', status: 'Active' },
  { id: '4', name: 'Alex Johnson', email: 'alex.j@mit.edu', role: 'STUDENT', college: 'MIT', status: 'Active' },
  { id: '5', name: 'James Miller', email: 'james@harvard.edu', role: 'COLLEGE_ADMIN', college: 'Harvard University', status: 'Inactive' },
];

export default function AllUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');

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
            <span className="font-medium">{item.name}</span>
            <span className="text-xs text-muted-foreground">{item.email}</span>
          </div>
        </div>
      )
    },
    { 
      header: 'Role', 
      accessor: (item: any) => (
        <Badge variant="outline" className="capitalize font-medium">
          {item.role.toLowerCase().replace('_', ' ')}
        </Badge>
      )
    },
    { 
      header: 'College', 
      accessor: (item: any) => (
        <div className="flex items-center gap-2 text-sm">
          <Building2 className="h-3 w-3 text-muted-foreground" />
          {item.college}
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: (item: any) => (
        <Badge variant={item.status === 'Active' ? 'default' : 'secondary'} className="h-5 text-[10px]">
          {item.status}
        </Badge>
      )
    },
    { 
      header: 'Actions', 
      accessor: (item: any) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit Profile</DropdownMenuItem>
              <DropdownMenuItem>Reset Password</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Suspend User</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">Manage all system users, roles, and access controls</p>
          </div>
          <Button className="pulse-hover">
            <Plus className="h-4 w-4 mr-2" /> Add New User
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-none shadow-sm bg-primary/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Users</p>
                <p className="text-xl font-bold">14,240</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Admins</p>
                <p className="text-xl font-bold">52</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 bg-green-50 rounded-lg text-green-500">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Now</p>
                <p className="text-xl font-bold">1,840</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search users..." 
                  className="pl-10 h-10 bg-secondary/30 border-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-10">
                  <Filter className="h-4 w-4 mr-2" /> All Roles
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <TableComponent 
              data={ALL_USERS_DATA} 
              columns={columns} 
              className="border-none"
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
