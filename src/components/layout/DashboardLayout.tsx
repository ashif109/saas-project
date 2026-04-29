"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarTrigger,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  School, 
  BarChart3, 
  Bell, 
  Settings, 
  LogOut, 
  Users, 
  GraduationCap, 
  Calendar, 
  ClipboardList, 
  CreditCard, 
  Trophy,
  MessageSquare,
  Search,
  Activity,
  FileText,
  Megaphone,
  Layers,
  PieChart,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCollegeStore } from '@/store/useCollegeStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { colorToHSL } from '@/lib/utils';

const SUPER_ADMIN_ITEMS = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  { title: "Colleges", icon: School, url: "/colleges" },
  { title: "Analytics", icon: BarChart3, url: "/analytics" },
  { title: "System Stats", icon: Activity, url: "/system-stats" },
  { title: "Logs", icon: FileText, url: "/logs" },
  { title: "Notifications", icon: Bell, url: "/notifications" },
  { title: "Settings", icon: Settings, url: "/settings" },
];

const COLLEGE_ADMIN_ITEMS = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  { title: "Students", icon: GraduationCap, url: "/students" },
  { title: "Faculty & Roles", icon: Users, url: "/faculty" },
  { title: "Departments & Courses", icon: Layers, url: "/departments" },
  { title: "Academic Setup", icon: Calendar, url: "/academic-setup" },
  { title: "Timetable Control", icon: ClipboardList, url: "/timetable" },
  { title: "Fees & Finance", icon: CreditCard, url: "/fees" },
  { title: "Scholarships", icon: School, url: "/scholarships" },
  { title: "Reports & Analytics", icon: PieChart, url: "/reports" },
  { title: "Broadcasting", icon: Megaphone, url: "/notices" },
  { title: "Settings", icon: Settings, url: "/settings" },
];

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

function AppSidebar({ menuItems, pathname, onLogout, settings }: { menuItems: any[], pathname: string, onLogout: () => void, settings: any }) {
  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar-background">
      <SidebarHeader className="p-4 md:p-6">
        <Link href="/dashboard" className="flex items-center gap-3 group/logo">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary flex items-center justify-center overflow-hidden transition-all group-hover/logo:scale-105 group-hover/logo:shadow-lg group-hover/logo:shadow-primary/20 p-2 text-white">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="h-full w-full object-contain" />
            ) : (
              <PulseLogo />
            )}
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-headline text-xl font-black tracking-tight text-white leading-none">
              {settings?.platformName || 'PulseDesk'}
            </span>
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              Management Platform
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2 px-4">Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url || (item.url !== '/dashboard' && pathname?.startsWith(`${item.url}/`))}
                    tooltip={item.title}
                    className="h-11 rounded-xl transition-all duration-200 hover:bg-white/10"
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className={`h-5 w-5 ${pathname === item.url ? 'text-white' : 'text-slate-400'}`} />
                      <span className="font-bold tracking-tight text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 h-11 rounded-xl text-rose-500 hover:bg-rose-500/10 font-bold" 
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated, isImpersonating, originalUser, stopImpersonating } = useAuthStore();
  const { notifications, markNotificationRead } = useCollegeStore();
  const { settings, fetchSettings } = useSettingsStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!settings) {
      fetchSettings();
    }
  }, [isAuthenticated, router, settings, fetchSettings]);

  if (!mounted || !user) return null;

  const menuItems = useMemo(() => {
    const baseItems = user.role === 'SUPER_ADMIN' ? SUPER_ADMIN_ITEMS : COLLEGE_ADMIN_ITEMS;
    return baseItems.filter(item => {
      if (item.title === 'Doubts' && settings && !settings.globalDoubtSystem) return false;
      if (item.title === 'Attendance' && settings && !settings.globalAttendance) return false;
      if (item.title === 'Analytics' && settings && !settings.globalAnalytics) return false;
      if (item.title === 'Reports' && settings && !settings.globalAnalytics) return false;
      return true;
    });
  }, [user.role, settings]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleStopImpersonating = () => {
    stopImpersonating();
    router.push('/colleges');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const primaryHSL = useMemo(() => {
    const primaryColor = settings?.themeColor || '#3b82f6';
    return colorToHSL(primaryColor);
  }, [settings?.themeColor]);

  return (
    <SidebarProvider>
      <div 
        className="flex min-h-screen w-full bg-background/50" 
        style={{ 
          '--primary': primaryHSL,
          '--accent': primaryHSL 
        } as React.CSSProperties}
      >
        <AppSidebar menuItems={menuItems} pathname={pathname} onLogout={handleLogout} settings={settings} />
        <SidebarInset className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {isImpersonating && (
            <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between z-50 animate-in fade-in slide-in-from-top duration-500">
              <div className="flex items-center gap-2 text-sm font-bold">
                <ShieldCheck className="h-4 w-4" />
                <span>Impersonating: {user.name} ({user.email})</span>
                <span className="opacity-75 font-normal ml-2">Logged in as {user.role}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white h-8 font-bold"
                onClick={handleStopImpersonating}
              >
                Stop Impersonating
              </Button>
            </div>
          )}
          <header className="h-16 md:h-20 border-b bg-background/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger className="md:hidden" />
              <div className="relative w-full max-w-[400px] hidden sm:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-11 h-10 md:h-11 w-full bg-secondary/50 rounded-xl border-none text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-secondary/80">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                      <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-primary rounded-full border-2 border-background animate-pulse" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 overflow-hidden rounded-2xl shadow-2xl border-none" align="end">
                  <div className="p-4 border-b bg-primary/5 flex items-center justify-between">
                    <h4 className="font-bold text-sm tracking-tight">Notifications</h4>
                    {unreadCount > 0 && (
                      <Badge variant="default" className="text-[10px] px-1.5 h-5 font-bold">{unreadCount} New</Badge>
                    )}
                  </div>
                  <div className="max-h-[350px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`p-4 flex gap-3 hover:bg-slate-50 cursor-pointer transition-colors border-b last:border-0 ${!notif.read ? 'bg-primary/[0.02]' : ''}`}
                          onClick={() => markNotificationRead(notif.id)}
                        >
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                            notif.type === 'info' ? 'bg-blue-50 text-blue-600' :
                            notif.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                            notif.type === 'error' ? 'bg-rose-50 text-rose-600' :
                            'bg-emerald-50 text-emerald-600'
                          }`}>
                            {notif.type === 'info' && <Info className="h-5 w-5" />}
                            {notif.type === 'warning' && <AlertTriangle className="h-5 w-5" />}
                            {notif.type === 'error' && <AlertTriangle className="h-5 w-5" />}
                            {notif.type === 'success' && <CheckCircle2 className="h-5 w-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold truncate mb-0.5 ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notif.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed mb-1.5">
                              {notif.message}
                            </p>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {formatDistanceToNow(parseISO(notif.timestamp), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-10 text-center">
                        <Bell className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-xs text-slate-400 font-medium">No new notifications</p>
                      </div>
                    )}
                  </div>
                  <Link 
                    href="/notifications" 
                    className="block p-3 text-center text-[11px] font-bold text-primary hover:bg-primary/5 transition-colors border-t"
                  >
                    View All Notifications
                  </Link>
                </PopoverContent>
              </Popover>
              
              <Separator orientation="vertical" className="h-8 hidden xs:block" />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-3 pl-2 cursor-pointer hover:bg-secondary/50 p-1.5 rounded-xl transition-colors group">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold leading-none mb-1">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{user.role.replace('_', ' ')}</p>
                    </div>
                    <Avatar className="h-8 w-8 md:h-9 md:w-9 border-2 border-primary/10 transition-transform group-hover:scale-105">
                      <AvatarImage src={user.avatar || undefined} alt={user.name} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {user.name?.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase() || '??'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 p-2 rounded-2xl shadow-2xl border-none mt-2" align="end">
                  <DropdownMenuLabel className="p-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground font-bold truncate tracking-tight">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem className="p-3 rounded-xl focus:bg-primary/5 focus:text-primary cursor-pointer group" asChild>
                    <Link href="/settings" className="flex items-center gap-3">
                      <UserIcon className="h-4 w-4 text-slate-400 group-focus:text-primary" />
                      <span className="font-bold text-sm tracking-tight">My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-3 rounded-xl focus:bg-primary/5 focus:text-primary cursor-pointer group" asChild>
                    <Link href="/settings" className="flex items-center gap-3">
                      <Settings className="h-4 w-4 text-slate-400 group-focus:text-primary" />
                      <span className="font-bold text-sm tracking-tight">Account Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem 
                    className="p-3 rounded-xl focus:bg-rose-50 focus:text-rose-500 cursor-pointer group"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 text-slate-400 group-focus:text-rose-500" />
                    <span className="font-bold text-sm tracking-tight">Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
