
"use client"

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  School, 
  Settings2, 
  Lock, 
  Mail, 
  Layout, 
  ShieldAlert, 
  Database, 
  Palette,
  CheckCircle2,
  AlertCircle,
  CloudUpload,
  Clock,
  Activity,
  Users as UsersIcon,
  HardDrive
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/axios';
import { Loader2, Camera, Trash2, Check, Copy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const { settings, fetchSettings, updateSettings } = useSettingsStore();
  const [loading, setLoading] = React.useState(false);
  const [fetching, setFetching] = React.useState(true);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(user?.avatar || null);

  // Profile Settings State
  const [profileSettings, setProfileSettings] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false);

  // Notification Preferences State
  const [notifPrefs, setNotifPrefs] = React.useState({
    emailNotifications: true,
    systemAlerts: true,
    chatSound: false,
  });

  // System Settings State
  const [systemSettings, setSystemSettings] = React.useState({
    // Platform Configuration
    studentLimit: '5000',
    facultyLimit: '250',
    defaultPlan: 'Basic',
    autoApproval: false,

    // Authentication Settings
    forcePasswordReset: true,
    minPasswordLength: '10',
    sessionTimeout: '60',

    // Email & Notifications
    sendWelcomeEmail: true,
    sendCredentials: true,
    systemAlerts: true,

    // Feature Control (Global)
    globalDoubtSystem: true,
    globalAttendance: true,
    globalAnalytics: true,

    // College Rules
    maxColleges: '50',
    duplicateNameRestriction: true,
    approvalRequirement: true,

    // Alert Settings
    lowActivityThreshold: '15',
    inactiveDaysAlert: '30',

    // Backup Settings
    autoBackup: true,
    backupFrequency: 'Daily',
    lastBackup: '2024-05-20 03:00 AM',

    // Branding
    platformName: 'PulseDesk',
    themeColor: '#14b8a6',
    logoUrl: ''
  });

  // Fetch settings on mount
  React.useEffect(() => {
    const loadSettings = async () => {
      setFetching(true);
      await fetchSettings();
      setFetching(false);
    };
    loadSettings();
  }, [fetchSettings]);

  // Update local state when user or store settings change
  React.useEffect(() => {
    if (user) {
      setProfileSettings({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
      });
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  React.useEffect(() => {
    if (settings) {
      setSystemSettings(prev => ({ ...prev, ...settings }));
      if (settings.logoUrl) setLogoPreview(settings.logoUrl);
    }
  }, [settings]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.put('/api/auth/profile', profileSettings);
      updateUser({
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar,
        phone: data.phone,
        collegeId: data.college?._id
      }, data.token);
      toast({
        title: "Profile Updated",
        description: "Your account preferences have been saved.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!securitySettings.currentPassword || !securitySettings.newPassword) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please enter both your current and new password.",
      });
      return;
    }

    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords Don't Match",
        description: "The new password and confirmation password do not match.",
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await api.put('/api/auth/profile', {
        password: securitySettings.newPassword,
        currentPassword: securitySettings.currentPassword
      });
      
      setSecuritySettings({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.response?.data?.message || "Could not update password.",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarPreview(base64String);
        setProfileSettings(prev => ({ ...prev, avatar: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoPreview(base64String);
        setSystemSettings(prev => ({ ...prev, logoUrl: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSystemSettings = async () => {
    setLoading(true);
    try {
      await updateSettings(systemSettings);
      toast({
        title: "Success",
        description: "System settings and branding updated successfully.",
      });
      // Force a re-fetch to ensure all components stay in sync
      await fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings. Please check your connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and system configurations</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="bg-secondary/50 p-1 rounded-lg">
            <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" /> Profile</TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
            <TabsTrigger value="security" className="gap-2"><Shield className="h-4 w-4" /> Security</TabsTrigger>
            {user?.role === 'SUPER_ADMIN' && (
              <TabsTrigger value="system" className="gap-2"><School className="h-4 w-4" /> System</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Public Profile</CardTitle>
                <CardDescription>How others see you on the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center gap-8 p-6 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="relative group">
                    <Avatar className="h-32 w-32 md:h-40 md:w-32 rounded-2xl border-4 border-white shadow-xl transition-transform group-hover:scale-[1.02]">
                      <AvatarImage src={avatarPreview} alt={user?.name} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-primary text-4xl font-black">
                        {user?.name?.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase() || '??'}
                      </AvatarFallback>
                    </Avatar>
                    <label 
                      htmlFor="avatar-upload" 
                      className="absolute -bottom-3 -right-3 h-10 w-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:bg-primary/90 transition-colors border-2 border-white"
                    >
                      <Camera className="h-5 w-5" />
                      <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    </label>
                  </div>
                  <div className="flex-1 space-y-4 text-center sm:text-left">
                    <div>
                      <h3 className="text-lg font-bold">Profile Picture</h3>
                      <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-bold">PNG, JPG or GIF (Max. 2MB)</p>
                    </div>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                      <Button variant="outline" size="sm" className="rounded-xl font-bold" asChild>
                        <label htmlFor="avatar-upload" className="cursor-pointer">Change Image</label>
                      </Button>
                      {avatarPreview && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl font-bold"
                          onClick={() => {
                            setAvatarPreview(null);
                            setProfileSettings(prev => ({ ...prev, avatar: '' }));
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2.5">
                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-slate-500">Full Name</Label>
                    <Input 
                      id="name" 
                      value={profileSettings.name}
                      onChange={(e) => setProfileSettings({...profileSettings, name: e.target.value})} 
                      className="h-12 rounded-xl border-2 bg-white focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-500">Email Address</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input 
                        id="email" 
                        value={profileSettings.email} 
                        onChange={(e) => setProfileSettings({...profileSettings, email: e.target.value})}
                        className="pl-12 h-12 rounded-xl border-2 bg-white focus-visible:ring-primary/20 transition-all" 
                      />
                      <Copy className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 cursor-pointer hover:text-primary transition-colors" onClick={() => {
                        navigator.clipboard.writeText(profileSettings.email);
                        toast({ title: "Copied", description: "Email address copied to clipboard" });
                      }} />
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-slate-500">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={profileSettings.phone}
                      placeholder="+91 00000 00000"
                      onChange={(e) => setProfileSettings({...profileSettings, phone: e.target.value})}
                      className="h-12 rounded-xl border-2 bg-white focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="role" className="text-xs font-bold uppercase tracking-widest text-slate-500">Account Role</Label>
                    <Badge variant="outline" className="h-12 w-full flex items-center justify-start px-4 rounded-xl border-2 bg-slate-50/50 text-slate-600 font-bold uppercase tracking-tighter">
                      {user?.role?.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-end pt-6 border-t">
                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={loading}
                    className="h-12 px-10 font-bold rounded-xl shadow-lg shadow-primary/20 min-w-[180px] pulse-hover"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                    {loading ? 'Updating Profile...' : 'Save Profile Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Control when and how you receive updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-semibold text-sm">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive daily summaries of student doubts</p>
                  </div>
                  <Switch 
                    checked={notifPrefs.emailNotifications}
                    onCheckedChange={(v) => setNotifPrefs({...notifPrefs, emailNotifications: v})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-semibold text-sm">System Alerts</p>
                    <p className="text-xs text-muted-foreground">Real-time alerts for critical system events</p>
                  </div>
                  <Switch 
                    checked={notifPrefs.systemAlerts}
                    onCheckedChange={(v) => setNotifPrefs({...notifPrefs, systemAlerts: v})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-semibold text-sm">Chat Sound</p>
                    <p className="text-xs text-muted-foreground">Play a sound when a new message arrives</p>
                  </div>
                  <Switch 
                    checked={notifPrefs.chatSound}
                    onCheckedChange={(v) => setNotifPrefs({...notifPrefs, chatSound: v})}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>Secure your administrative access with a strong password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                      <Label htmlFor="cur-pass" className="text-xs font-bold uppercase tracking-widest text-slate-500">Current Access Key</Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input 
                          id="cur-pass" 
                          type="password" 
                          placeholder="••••••••••••"
                          value={securitySettings.currentPassword}
                          onChange={(e) => setSecuritySettings({...securitySettings, currentPassword: e.target.value})}
                          className="pl-12 h-12 rounded-xl border-2 bg-white focus-visible:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>
                    <div className="hidden md:block"></div>
                    <div className="space-y-2.5">
                      <Label htmlFor="new-pass" className="text-xs font-bold uppercase tracking-widest text-slate-500">New Access Key</Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input 
                          id="new-pass" 
                          type="password" 
                          placeholder="••••••••••••"
                          value={securitySettings.newPassword}
                          onChange={(e) => setSecuritySettings({...securitySettings, newPassword: e.target.value})}
                          className="pl-12 h-12 rounded-xl border-2 bg-white focus-visible:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <Label htmlFor="confirm-pass" className="text-xs font-bold uppercase tracking-widest text-slate-500">Confirm New Key</Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input 
                          id="confirm-pass" 
                          type="password" 
                          placeholder="••••••••••••"
                          value={securitySettings.confirmPassword}
                          onChange={(e) => setSecuritySettings({...securitySettings, confirmPassword: e.target.value})}
                          className="pl-12 h-12 rounded-xl border-2 bg-white focus-visible:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-6 border-t">
                    <Button 
                      onClick={handleUpdatePassword} 
                      disabled={isUpdatingPassword}
                      className="h-12 px-10 font-bold rounded-xl shadow-lg shadow-primary/20 min-w-[200px] pulse-hover"
                    >
                      {isUpdatingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
                      {isUpdatingPassword ? 'Updating Security...' : 'Update Access Key'}
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Shield className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Two-Factor Authentication</p>
                      <p className="text-xs text-slate-500 font-medium">Add an extra layer of security to your admin account</p>
                    </div>
                  </div>
                  <Button variant="outline" className="rounded-xl font-bold border-2 hover:bg-primary hover:text-white hover:border-primary transition-all">Enable 2FA</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {user?.role === 'SUPER_ADMIN' && (
            <TabsContent value="system" className="mt-6 space-y-6 pb-12">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">System Configuration</h2>
                  <p className="text-sm text-muted-foreground">Manage platform-wide settings and restrictions</p>
                </div>
                <Button 
                  onClick={handleSaveSystemSettings} 
                  disabled={loading}
                  className="pulse-hover bg-primary shadow-lg font-bold"
                >
                  {loading ? 'Saving...' : 'Save Global Changes'}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Platform Configuration */}
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Settings2 className="h-4 w-4 text-primary" /> Platform Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs uppercase text-muted-foreground font-bold">Default Student Limit</Label>
                        <Input 
                          type="number" 
                          value={systemSettings.studentLimit}
                          onChange={(e) => setSystemSettings({...systemSettings, studentLimit: e.target.value})}
                          className="h-9 bg-secondary/50 border-none" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs uppercase text-muted-foreground font-bold">Default Faculty Limit</Label>
                        <Input 
                          type="number"
                          value={systemSettings.facultyLimit}
                          onChange={(e) => setSystemSettings({...systemSettings, facultyLimit: e.target.value})}
                          className="h-9 bg-secondary/50 border-none" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase text-muted-foreground font-bold">Default Subscription Plan</Label>
                      <Select 
                        value={systemSettings.defaultPlan}
                        onValueChange={(v) => setSystemSettings({...systemSettings, defaultPlan: v})}
                      >
                        <SelectTrigger className="h-9 bg-secondary/50 border-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Free">Free</SelectItem>
                          <SelectItem value="Basic">Basic</SelectItem>
                          <SelectItem value="Premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-semibold">Auto-approval</Label>
                        <p className="text-[10px] text-muted-foreground">Automatically approve new college requests</p>
                      </div>
                      <Switch 
                        checked={systemSettings.autoApproval}
                        onCheckedChange={(v) => setSystemSettings({...systemSettings, autoApproval: v})}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 2. Authentication Settings */}
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" /> Authentication Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-semibold">Force Password Reset</Label>
                        <p className="text-[10px] text-muted-foreground">Require new admins to change password</p>
                      </div>
                      <Switch 
                        checked={systemSettings.forcePasswordReset}
                        onCheckedChange={(v) => setSystemSettings({...systemSettings, forcePasswordReset: v})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs uppercase text-muted-foreground font-bold">Min. Password Length</Label>
                        <Input 
                          type="number"
                          value={systemSettings.minPasswordLength}
                          onChange={(e) => setSystemSettings({...systemSettings, minPasswordLength: e.target.value})}
                          className="h-9 bg-secondary/50 border-none" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs uppercase text-muted-foreground font-bold">Session Timeout (min)</Label>
                        <Input 
                          type="number"
                          value={systemSettings.sessionTimeout}
                          onChange={(e) => setSystemSettings({...systemSettings, sessionTimeout: e.target.value})}
                          className="h-9 bg-secondary/50 border-none" 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 3. Email & Notifications */}
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" /> Email & Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-semibold">Welcome Email</Label>
                        <p className="text-[10px] text-muted-foreground">Send automated onboarding email</p>
                      </div>
                      <Switch 
                        checked={systemSettings.sendWelcomeEmail}
                        onCheckedChange={(v) => setSystemSettings({...systemSettings, sendWelcomeEmail: v})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-semibold">Send Credentials</Label>
                        <p className="text-[10px] text-muted-foreground">Securely email admin passwords</p>
                      </div>
                      <Switch 
                        checked={systemSettings.sendCredentials}
                        onCheckedChange={(v) => setSystemSettings({...systemSettings, sendCredentials: v})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-semibold">Critical Alerts</Label>
                        <p className="text-[10px] text-muted-foreground">Enable system health notifications</p>
                      </div>
                      <Switch 
                        checked={systemSettings.systemAlerts}
                        onCheckedChange={(v) => setSystemSettings({...systemSettings, systemAlerts: v})}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 4. Global Feature Control */}
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Layout className="h-4 w-4 text-primary" /> Global Feature Control
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-semibold">Doubt System</Label>
                        <p className="text-[10px] text-muted-foreground">Enable AI resolving globally</p>
                      </div>
                      <Switch 
                        checked={systemSettings.globalDoubtSystem}
                        onCheckedChange={(v) => setSystemSettings({...systemSettings, globalDoubtSystem: v})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-semibold">Attendance System</Label>
                        <p className="text-[10px] text-muted-foreground">Enable biometric tracking platform-wide</p>
                      </div>
                      <Switch 
                        checked={systemSettings.globalAttendance}
                        onCheckedChange={(v) => setSystemSettings({...systemSettings, globalAttendance: v})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-semibold">Advanced Analytics</Label>
                        <p className="text-[10px] text-muted-foreground">Institutional data aggregation</p>
                      </div>
                      <Switch 
                        checked={systemSettings.globalAnalytics}
                        onCheckedChange={(v) => setSystemSettings({...systemSettings, globalAnalytics: v})}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 5. College Rules */}
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <School className="h-4 w-4 text-primary" /> College Rules
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase text-muted-foreground font-bold">Max Colleges Allowed</Label>
                      <Input 
                        type="number"
                        value={systemSettings.maxColleges}
                        onChange={(e) => setSystemSettings({...systemSettings, maxColleges: e.target.value})}
                        className="h-9 bg-secondary/50 border-none" 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-semibold">Duplicate Name Restriction</Label>
                        <p className="text-[10px] text-muted-foreground">Prevent colleges with same name</p>
                      </div>
                      <Switch 
                        checked={systemSettings.duplicateNameRestriction}
                        onCheckedChange={(v) => setSystemSettings({...systemSettings, duplicateNameRestriction: v})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-semibold">Approval Requirement</Label>
                        <p className="text-[10px] text-muted-foreground">Manual check for every registration</p>
                      </div>
                      <Switch 
                        checked={systemSettings.approvalRequirement}
                        onCheckedChange={(v) => setSystemSettings({...systemSettings, approvalRequirement: v})}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 6. Alert Settings */}
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-primary" /> Alert Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase text-muted-foreground font-bold">Low Activity Threshold (%)</Label>
                      <Input 
                        type="number"
                        value={systemSettings.lowActivityThreshold}
                        onChange={(e) => setSystemSettings({...systemSettings, lowActivityThreshold: e.target.value})}
                        className="h-9 bg-secondary/50 border-none" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase text-muted-foreground font-bold">Inactive Days Alert</Label>
                      <Input 
                        type="number"
                        value={systemSettings.inactiveDaysAlert}
                        onChange={(e) => setSystemSettings({...systemSettings, inactiveDaysAlert: e.target.value})}
                        className="h-9 bg-secondary/50 border-none" 
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 7. Backup Settings */}
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Database className="h-4 w-4 text-primary" /> Backup Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-semibold">Auto Backup</Label>
                        <p className="text-[10px] text-muted-foreground">Automated database snapshots</p>
                      </div>
                      <Switch 
                        checked={systemSettings.autoBackup}
                        onCheckedChange={(v) => setSystemSettings({...systemSettings, autoBackup: v})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase text-muted-foreground font-bold">Backup Frequency</Label>
                      <Select 
                        value={systemSettings.backupFrequency}
                        onValueChange={(v) => setSystemSettings({...systemSettings, backupFrequency: v})}
                      >
                        <SelectTrigger className="h-9 bg-secondary/50 border-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Hourly">Every Hour</SelectItem>
                          <SelectItem value="Daily">Daily</SelectItem>
                          <SelectItem value="Weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-lg border-dashed border border-muted-foreground/20">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-green-500" /> Last Backup: {systemSettings.lastBackup}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 8. Branding */}
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Palette className="h-4 w-4 text-primary" /> Branding
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase text-muted-foreground font-bold">Platform Name</Label>
                      <Input 
                        value={systemSettings.platformName}
                        onChange={(e) => setSystemSettings({...systemSettings, platformName: e.target.value})}
                        className="h-9 bg-secondary/50 border-none" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase text-muted-foreground font-bold">Logo Configuration</Label>
                      <div className="flex items-center gap-4">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo Preview" className="h-10 w-10 object-contain bg-secondary/20 rounded" />
                        ) : (
                          <div className="h-10 w-10 bg-primary/20 rounded flex items-center justify-center text-primary font-bold">
                            {systemSettings.platformName.charAt(0)}
                          </div>
                        )}
                        <div className="relative">
                          <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleLogoUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                          />
                          <Button variant="outline" size="sm" className="h-8 text-xs pointer-events-none">
                            <CloudUpload className="h-3.5 w-3.5 mr-2" /> Replace Logo
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase text-muted-foreground font-bold">Primary Theme Color</Label>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded border border-input shadow-sm" style={{ backgroundColor: systemSettings.themeColor }} />
                        <Input 
                          value={systemSettings.themeColor}
                          onChange={(e) => setSystemSettings({...systemSettings, themeColor: e.target.value})}
                          className="h-9 flex-1 bg-secondary/50 border-none" 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
