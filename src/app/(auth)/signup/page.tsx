"use client"

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, UserPlus } from 'lucide-react';

function PulseLogo() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M20 45V35C20 32.2386 22.2386 30 25 30H40L50 20L65 40L75 15L85 30H90V75C90 77.7614 87.7614 80 85 80H25C22.2386 80 20 77.7614 20 75V45Z" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M30 65H40L50 55L65 75L75 60H85" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

const signupSchema = z.object({
  collegeName: z.string().min(3, { message: "College name must be at least 3 characters" }),
  adminName: z.string().min(2, { message: "Admin name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
    .regex(/[0-9]/, { message: "Must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, { message: "Must contain at least one special character" }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setLoading(true);
    // Simulate API registration
    setTimeout(() => {
      setLoading(false);
      router.push('/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
      
      <Card className="w-full max-w-lg shadow-2xl border-none glass-morphism animate-in fade-in zoom-in duration-500">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg p-2">
              <PulseLogo />
            </div>
          </div>
          <CardTitle className="text-2xl font-headline font-bold">Register College</CardTitle>
          <CardDescription>
            Join PulseDesk to manage your institution efficiently
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="collegeName">Institution Name</Label>
                <Input id="collegeName" placeholder="Harvard University" {...register('collegeName')} />
                {errors.collegeName && <p className="text-xs text-destructive">{errors.collegeName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminName">Admin Full Name</Label>
                <Input id="adminName" placeholder="John Doe" {...register('adminName')} />
                {errors.adminName && <p className="text-xs text-destructive">{errors.adminName.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <Input id="email" type="email" placeholder="admin@college.edu" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full pulse-hover" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Log in instead
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}