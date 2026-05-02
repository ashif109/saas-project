"use client"

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, RotateCcw } from 'lucide-react';

interface Filters {
  department: string;
  semester: string;
  status: string;
}

interface AdvancedFilterSheetProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  departments: any[];
}

export function AdvancedFilterSheet({ filters, setFilters, departments }: AdvancedFilterSheetProps) {
  const handleReset = () => {
    setFilters({
      department: 'all',
      semester: 'all',
      status: 'all'
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-10">
          <Filter className="h-4 w-4 mr-2" /> Advanced Filters
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">Advanced Filters</SheetTitle>
          <SheetDescription>
            Refine the student list based on specific academic and enrollment criteria.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-8">
          <div className="space-y-2">
            <Label>Department</Label>
            <Select 
              value={filters.department} 
              onValueChange={(val) => setFilters({ ...filters, department: val })}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Semester</Label>
            <Select 
              value={filters.semester} 
              onValueChange={(val) => setFilters({ ...filters, semester: val })}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="All Semesters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                <SelectItem value="1">1st Semester</SelectItem>
                <SelectItem value="2">2nd Semester</SelectItem>
                <SelectItem value="3">3rd Semester</SelectItem>
                <SelectItem value="4">4th Semester</SelectItem>
                <SelectItem value="5">5th Semester</SelectItem>
                <SelectItem value="6">6th Semester</SelectItem>
                <SelectItem value="7">7th Semester</SelectItem>
                <SelectItem value="8">8th Semester</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Enrollment Status</Label>
            <Select 
              value={filters.status} 
              onValueChange={(val) => setFilters({ ...filters, status: val })}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button variant="ghost" onClick={handleReset} className="w-full sm:flex-1 h-11 font-bold">
            <RotateCcw className="h-4 w-4 mr-2" /> Reset Filters
          </Button>
          <Button className="w-full sm:flex-1 h-11 bg-blue-600 hover:bg-blue-700 font-bold">
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
