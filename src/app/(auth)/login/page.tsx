"use client"

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, LogIn, Mail, Lock, ShieldCheck, ChevronRight, ArrowRight } from 'lucide-react';
import api from '@/lib/axios';

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

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" })
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setError(null);
    
    // Clean data
    const payload = {
      email: data.email.trim().toLowerCase(),
      password: data.password
    };
    
    try {
      const response = await api.post('/api/auth/login', payload);
      const { token, ...user } = response.data;
      
      login({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        collegeId: user.college?._id
      }, token);

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-body overflow-hidden">
      {/* Left Panel: Branding & Visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0f172a] items-center justify-center p-12 overflow-hidden border-r border-white/10">
        {/* Abstract background elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        </div>

        <div className="relative z-10 w-full max-w-lg space-y-12">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 p-3 text-white ring-4 ring-white/10">
              <PulseLogo />
            </div>
            <div>
              <h1 className="text-4xl font-headline font-black tracking-tighter text-white leading-none">
                PULSE<span className="text-primary">DESK</span>
              </h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] mt-1">Enterprise Edition</p>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-5xl font-headline font-bold text-white leading-[1.1] tracking-tight">
              The Next Generation of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">Institutional</span> Intelligence.
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed font-medium">
              A comprehensive multi-tenant SaaS ecosystem designed to streamline academic operations, automate administrative tasks, and deliver real-time insights for modern educational institutions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {[
              { label: 'Real-time Analytics', desc: 'Instant data visibility' },
              { label: 'Automated Workflows', desc: 'Efficiency at scale' },
              { label: 'Enterprise Security', desc: 'Grade-A data protection' },
              { label: 'Seamless Integration', desc: 'Unified platform' },
            ].map((feature, i) => (
              <div key={i} className="flex gap-3 items-start p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default group">
                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">{feature.label}</p>
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 flex items-center gap-6 border-t border-white/10">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-10 w-10 rounded-full border-2 border-[#0f172a] bg-slate-800 flex items-center justify-center overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                </div>
              ))}
            </div>
            <p className="text-slate-400 text-sm font-medium italic">
              "Trusted by 500+ global educational institutions."
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-slate-50/30">
        <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="space-y-2">
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center p-2 text-white">
                <PulseLogo />
              </div>
              <h1 className="text-2xl font-headline font-black tracking-tight text-slate-900">PULSEDESK</h1>
            </div>
            <h3 className="text-4xl font-headline font-bold text-slate-900 tracking-tight">Welcome Back</h3>
            <p className="text-slate-500 font-medium">Please enter your professional credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-2 group">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-500 group-focus-within:text-primary transition-colors">Business Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="email" 
                    placeholder="admin@institution.edu" 
                    {...register('email')} 
                    className={`pl-12 h-14 bg-white border-2 border-slate-200 rounded-2xl focus-visible:ring-primary/20 focus-visible:border-primary transition-all font-medium ${errors.email ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive font-bold mt-1 px-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-2 group">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-500 group-focus-within:text-primary transition-colors">Access Key</Label>
                  <Link href="/forgot-password" title="Recover access to your account" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 group/link">
                    Forgot password?
                    <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••••••"
                    {...register('password')}
                    className={`pl-12 h-14 bg-white border-2 border-slate-200 rounded-2xl focus-visible:ring-primary/20 focus-visible:border-primary transition-all font-medium ${errors.password ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.password && <p className="text-xs text-destructive font-bold mt-1 px-1">{errors.password.message}</p>}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border-2 border-rose-100 text-rose-600 text-sm font-bold rounded-2xl flex items-center gap-3 animate-in shake duration-300">
                <div className="h-6 w-6 rounded-full bg-rose-600/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-14 rounded-2xl bg-[#0f172a] hover:bg-primary text-white font-bold text-lg shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] group" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-3" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to Dashboard
                  <LogIn className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="space-y-6">
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Onboarding</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-500 font-medium">
                New institution?{' '}
                <Link href="/signup" className="text-primary font-bold hover:underline underline-offset-4 decoration-2">
                  Register your college
                </Link>
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 flex items-center justify-between gap-4 group cursor-help transition-all hover:border-primary/20 hover:bg-primary/[0.02]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Quick Access</p>
                  <p className="text-xs font-bold text-slate-700">Use 'super@admin.com' for platform root access.</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </div>

          <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} PulseDesk SaaS Ecosystem. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
