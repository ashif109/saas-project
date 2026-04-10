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
import { Loader2, ArrowLeft, Mail, KeyRound, Lock, CheckCircle2 } from 'lucide-react';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';

const emailSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

const otpSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 digits" }),
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type EmailFormValues = z.infer<typeof emailSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
  });

  const resetForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onEmailSubmit = async (data: EmailFormValues) => {
    setLoading(true);
    const sanitizedEmail = data.email.trim().toLowerCase();
    try {
      await api.post('/api/auth/forgot-password', { email: sanitizedEmail });
      setEmail(sanitizedEmail);
      setStep(2);
      toast({
        title: "OTP Sent",
        description: "Please check your email for the verification code.",
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to send OTP";
      emailForm.setError('email', {
        type: 'manual',
        message: errorMessage,
      });
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const onOtpSubmit = async (data: OtpFormValues) => {
    setLoading(true);
    try {
      await api.post('/api/auth/verify-otp', { email: email.trim().toLowerCase(), otp: data.otp });
      setOtp(data.otp);
      setStep(3);
      toast({
        title: "OTP Verified",
        description: "You can now reset your password.",
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Invalid OTP";
      otpForm.setError('otp', {
        type: 'manual',
        message: errorMessage,
      });
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetPasswordFormValues) => {
    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', { 
        email: email.trim().toLowerCase(), 
        otp, 
        password: data.password 
      });
      setStep(4);
      toast({
        title: "Password Reset Successful",
        description: "You can now sign in with your new password.",
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to reset password";
      resetForm.setError('password', {
        type: 'manual',
        message: errorMessage,
      });
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-3xl" />

      <Card className="w-full max-w-md shadow-2xl border-none glass-morphism animate-in fade-in zoom-in duration-500">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm text-primary p-2">
              {step === 1 && <Mail className="h-8 w-8" />}
              {step === 2 && <KeyRound className="h-8 w-8" />}
              {step === 3 && <Lock className="h-8 w-8" />}
              {step === 4 && <CheckCircle2 className="h-8 w-8 text-green-500" />}
            </div>
          </div>
          <CardTitle className="text-2xl font-headline font-bold">
            {step === 1 && "Forgot Password"}
            {step === 2 && "Verify OTP"}
            {step === 3 && "New Password"}
            {step === 4 && "Success!"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Enter your email address to receive a reset code"}
            {step === 2 && `We've sent a 6-digit code to ${email}`}
            {step === 3 && "Create a strong new password for your account"}
            {step === 4 && "Your password has been reset successfully"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  placeholder="admin@college.edu" 
                  {...emailForm.register('email')} 
                  className={emailForm.formState.errors.email ? 'border-destructive' : ''}
                />
                {emailForm.formState.errors.email && (
                  <p className="text-xs text-destructive mt-1">{emailForm.formState.errors.email.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full pulse-hover" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Send Reset Code
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input 
                  id="otp" 
                  placeholder="000000" 
                  maxLength={6}
                  {...otpForm.register('otp')} 
                  className={otpForm.formState.errors.otp ? 'border-destructive text-center tracking-[1em] font-bold' : 'text-center tracking-[1em] font-bold'}
                />
                {otpForm.formState.errors.otp && (
                  <p className="text-xs text-destructive mt-1 text-center">{otpForm.formState.errors.otp.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full pulse-hover" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Verify Code
              </Button>
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="w-full text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Use a different email address
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input 
                  id="password" 
                  type="password"
                  placeholder="••••••••"
                  {...resetForm.register('password')} 
                  className={resetForm.formState.errors.password ? 'border-destructive' : ''}
                />
                {resetForm.formState.errors.password && (
                  <p className="text-xs text-destructive mt-1">{resetForm.formState.errors.password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password"
                  placeholder="••••••••"
                  {...resetForm.register('confirmPassword')} 
                  className={resetForm.formState.errors.confirmPassword ? 'border-destructive' : ''}
                />
                {resetForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive mt-1">{resetForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full pulse-hover" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Reset Password
              </Button>
            </form>
          )}

          {step === 4 && (
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground">You can now use your new password to sign in to PulseDesk.</p>
              <Button asChild className="w-full pulse-hover">
                <Link href="/login">Go to Login</Link>
              </Button>
            </div>
          )}
        </CardContent>
        {step !== 4 && (
          <CardFooter>
            <Link 
              href="/login" 
              className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mx-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
