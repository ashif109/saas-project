
"use client"

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { School, Award, Users, Plus } from 'lucide-react';

const SCHOLARSHIPS = [
  { name: 'Merit Excellence Award', amount: 'Full Tuition', candidates: 12, status: 'Active' },
  { name: 'Need-based Grant', amount: '$2,000 / Semester', candidates: 45, status: 'Active' },
  { name: 'Sports Scholarship', amount: '50% Tuition', candidates: 8, status: 'Closed' },
];

export default function ScholarshipsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">Scholarships</h1>
            <p className="text-muted-foreground">Manage financial aid and academic grants</p>
          </div>
          <Button className="pulse-hover">
            <Plus className="h-4 w-4 mr-2" /> Create Scholarship
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SCHOLARSHIPS.map((item, i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardHeader>
                <div className="h-10 w-10 bg-accent/20 rounded-lg flex items-center justify-center text-accent-foreground mb-4">
                  <Award className="h-6 w-6" />
                </div>
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>{item.amount}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" /> {item.candidates} candidates
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    item.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-secondary text-muted-foreground'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <Button variant="outline" className="w-full mt-6" size="sm">Manage Applications</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
