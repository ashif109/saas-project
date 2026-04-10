
"use client"

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CreditCard, DollarSign, AlertCircle, CheckCircle2, Plus, Settings2, Trash2, Edit } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const TRANSACTIONS = [
  { id: 'TX-9021', student: 'Alex Johnson', amount: '$4,500', date: '2024-04-10', status: 'Paid', type: 'Tuition' },
  { id: 'TX-9022', student: 'Sarah Williams', amount: '$3,800', date: '2024-04-12', status: 'Pending', type: 'Tuition' },
  { id: 'TX-9023', student: 'Michael Brown', amount: '$5,200', date: '2024-04-15', status: 'Paid', type: 'Exam Fee' },
];

const FEE_STRUCTURES = [
  { id: 'S1', name: 'Standard Tuition (BE/B.Tech)', amount: '$12,000', frequency: 'Annual', category: 'Tuition' },
  { id: 'S2', name: 'Standard Tuition (M.Tech)', amount: '$15,000', frequency: 'Annual', category: 'Tuition' },
  { id: 'S3', name: 'Exam Fee (Semester)', amount: '$200', frequency: 'Per Semester', category: 'Other' },
  { id: 'S4', name: 'Lab Maintenance', amount: '$500', frequency: 'Annual', category: 'Laboratory' },
];

export default function FeesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">Financial Management</h1>
            <p className="text-muted-foreground">Handle fee structures, student payments, and revenue monitoring</p>
          </div>
          <Button className="pulse-hover">
            <Plus className="h-4 w-4 mr-2" /> New Payment Entry
          </Button>
        </div>

        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="bg-secondary/50 p-1 rounded-xl h-11">
            <TabsTrigger value="transactions" className="rounded-lg">Recent Transactions</TabsTrigger>
            <TabsTrigger value="structures" className="rounded-lg">Fee Structures</TabsTrigger>
            <TabsTrigger value="due" className="rounded-lg">Outstanding Dues</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-none shadow-sm bg-primary text-primary-foreground">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" /> Total Collection (FY)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">$1.24M</p>
                  <p className="text-xs opacity-80 mt-1">12% growth vs last year</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-600">
                    <AlertCircle className="h-4 w-4" /> Pending Dues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">$42,500</p>
                  <p className="text-xs text-muted-foreground mt-1">Across 14 active students</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="pl-6">Student</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right pr-6">Receipt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {TRANSACTIONS.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="pl-6 font-medium">{tx.student}</TableCell>
                        <TableCell><Badge variant="outline">{tx.type}</Badge></TableCell>
                        <TableCell className="font-bold">{tx.amount}</TableCell>
                        <TableCell>{tx.date}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {tx.status === 'Paid' ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-orange-500" />
                            )}
                            <span className="text-sm">{tx.status}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button variant="ghost" size="sm" className="h-8">Download</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="structures" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Standard Fee Models</h2>
              <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Define New Structure</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FEE_STRUCTURES.map((fee) => (
                <Card key={fee.id} className="border-none shadow-sm hover:bg-secondary/20 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Settings2 className="h-5 w-5" />
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg">{fee.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px]">{fee.category}</Badge>
                      <span className="text-xs text-muted-foreground">{fee.frequency}</span>
                    </div>
                    <p className="text-2xl font-bold mt-4 text-primary">{fee.amount}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
