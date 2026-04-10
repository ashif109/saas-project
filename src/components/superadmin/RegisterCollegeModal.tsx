"use client"

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Copy, 
  Download, 
  RefreshCw, 
  Eye, 
  EyeOff,
  School,
  MapPin,
  User,
  Settings2,
  AlertCircle,
  Globe,
  Upload,
  Loader2,
  Trash2
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';
import { useCollegeStore } from '@/store/useCollegeStore';

interface RegisterCollegeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newCollege: any) => void;
}

export default function RegisterCollegeModal({ isOpen, onClose, onSuccess }: RegisterCollegeModalProps) {
  const { toast } = useToast();
  const { addCollege, colleges, fetchColleges } = useCollegeStore();
  const [step, setStep] = useState(1);

  // Refresh colleges list on open
  useEffect(() => {
    if (isOpen) {
      fetchColleges();
    }
  }, [isOpen, fetchColleges]);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [fetchingLogo, setFetchingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const existingCodes = colleges.map(c => c.code.toUpperCase());

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    website: '',
    logoUrl: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    subscription: 'Basic',
    status: 'Active',
    features: {
      doubtSystem: true,
      attendance: true,
      analytics: true
    }
  });

  // Errors State
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password Generator
  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  };

  // Initial password generation
  useEffect(() => {
    if (isOpen && !formData.adminPassword) {
      setFormData(prev => ({ ...prev, adminPassword: generatePassword() }));
    }
  }, [isOpen]);

  // Smart Email Auto-generation
  useEffect(() => {
    if (formData.code) {
      const generatedEmail = `admin@${formData.code.toLowerCase().replace(/\s+/g, '')}.pulse.com`;
      setFormData(prev => ({ ...prev, adminEmail: generatedEmail }));
    }
  }, [formData.code]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File too large", description: "Logo must be less than 2MB" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
        setFormData(prev => ({ ...prev, logoUrl: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchLogoFromWebsite = async () => {
    if (!formData.website) {
      toast({ variant: "destructive", title: "URL required", description: "Please enter a website URL first." });
      return;
    }
    
    setFetchingLogo(true);
    try {
      // Clean URL
      let url = formData.website.trim();
      if (!url.startsWith('http')) url = `https://${url}`;
      
      // Use a free favicon/logo service
      const logoUrl = `https://logo.clearbit.com/${new URL(url).hostname}`;
      
      // Check if logo exists
      const img = new Image();
      img.onload = () => {
        setLogoPreview(logoUrl);
        setFormData(prev => ({ ...prev, logoUrl }));
        setFetchingLogo(false);
        toast({ title: "Logo Found", description: "Successfully fetched logo from website." });
      };
      img.onerror = () => {
        setFetchingLogo(false);
        toast({ variant: "destructive", title: "Fetch Failed", description: "Could not find a logo on this website." });
      };
      img.src = logoUrl;
    } catch (err) {
      setFetchingLogo(false);
      toast({ variant: "destructive", title: "Invalid URL", description: "Please enter a valid website address." });
    }
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!formData.name) newErrors.name = "College name is required";
      if (!formData.code) newErrors.code = "College code is required";
      if (!formData.email) newErrors.email = "Primary email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    }

    if (currentStep === 2) {
      if (!formData.city) newErrors.city = "City is required";
      if (!formData.state) newErrors.state = "State is required";
    }

    if (currentStep === 3) {
      if (!formData.adminName) newErrors.adminName = "Admin name is required";
      if (!formData.adminEmail) newErrors.adminEmail = "Admin email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) newErrors.adminEmail = "Invalid email format";
      if (!formData.adminPassword) newErrors.adminPassword = "Password is required";
      else if (formData.adminPassword.length < 10) newErrors.adminPassword = "Minimum 10 characters required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    setLoading(true);
    try {
      const newCollege = await addCollege(formData);
      setSuccessData(newCollege);
      onSuccess?.(newCollege);
      toast({
        title: "Success",
        description: `${formData.name} has been registered successfully.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: err.message || "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const downloadCredentials = () => {
    const content = `
Pulse Dashboard - College Credentials
------------------------------------
College: ${successData.name}
College Code: ${successData.code}
Admin Email: ${successData.adminEmail}
Admin Password: ${successData.adminPassword}
Generated On: ${new Date().toLocaleString()}
    `;
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${successData.code}_credentials.txt`;
    document.body.appendChild(element);
    element.click();
  };

  const renderStepIndicator = () => {
    const steps = ["Basic", "Location", "Admin", "Config"];
    return (
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step > i + 1 ? 'bg-primary text-white' : 
                step === i + 1 ? 'bg-primary/20 text-primary border-2 border-primary' : 
                'bg-secondary text-muted-foreground'
              }`}>
                {step > i + 1 ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${
                step === i + 1 ? 'text-primary' : 'text-muted-foreground'
              }`}>{s}</span>
            </div>
          ))}
        </div>
        <Progress value={(step / 4) * 100} className="h-1 bg-secondary" />
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !successData && onClose()}>
      <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden border-none rounded-3xl">
        {successData ? (
          <div className="p-6 md:p-10 animate-in fade-in zoom-in-95 duration-300">
            <div className="h-20 w-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-500 mx-auto mb-8 shadow-sm">
              <Check className="h-10 w-10" />
            </div>
            <DialogHeader className="text-center space-y-2">
              <DialogTitle className="text-2xl md:text-3xl font-black tracking-tight">Registration Successful!</DialogTitle>
              <DialogDescription className="text-sm md:text-base font-medium text-muted-foreground">
                {successData.name} has been successfully registered and onboarded.
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-10 space-y-4">
              <div className="p-6 bg-slate-50 rounded-2xl space-y-4 border border-slate-100">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Admin Email</span>
                  <div className="flex items-center justify-between sm:justify-end gap-3 bg-white p-2 rounded-lg border shadow-sm">
                    <span className="text-sm font-bold truncate max-w-[200px]">{successData.adminEmail}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100" onClick={() => copyToClipboard(successData.adminEmail, "Email")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-t pt-4">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Initial Password</span>
                  <div className="flex items-center justify-between sm:justify-end gap-3 bg-white p-2 rounded-lg border shadow-sm">
                    <span className="text-sm font-mono font-bold tracking-tight">{successData.adminPassword}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100" onClick={() => copyToClipboard(successData.adminPassword, "Password")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6">
                <Button variant="outline" className="h-12 font-bold rounded-xl border-2" onClick={downloadCredentials}>
                  <Download className="h-4 w-4 mr-2" /> Download Credentials
                </Button>
                <Button className="h-12 font-bold rounded-xl shadow-lg shadow-primary/20" onClick={onClose}>
                  Complete Onboarding
                </Button>
              </div>
              <div className="pt-2">
                <Button variant="ghost" className="h-10 font-bold rounded-xl" onClick={async () => {
                  try {
                    setLoading(true);
                    await api.post('/api/colleges/resend-credentials', {
                      adminEmail: successData.adminEmail,
                      collegeCode: successData.code
                    });
                    toast({ title: "Email Sent", description: "Credentials email has been resent." });
                  } catch (e: any) {
                    toast({ variant: "destructive", title: "Failed to Send", description: e.message || "Unable to resend email." });
                  } finally {
                    setLoading(false);
                  }
                }}>
                  Resend Credentials Email
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full max-h-[90vh]">
            <div className="p-6 md:p-8 pb-0">
              <DialogHeader className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <School className="h-6 w-6" />
                  </div>
                  <DialogTitle className="text-2xl font-black tracking-tight">Register New College</DialogTitle>
                </div>
                <DialogDescription className="text-sm font-medium">Follow the multi-step process to set up a new institutional tenant.</DialogDescription>
              </DialogHeader>

              {renderStepIndicator()}
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 pt-0">
              <div className="min-h-[350px]">
                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-3">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">College Logo & Branding</Label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-5 rounded-2xl border-2 border-dashed bg-slate-50/50 group hover:bg-slate-50 hover:border-primary/30 transition-all">
                        <div className="relative group">
                          <div className="h-24 w-24 rounded-2xl bg-white border-2 shadow-sm flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                            {logoPreview ? (
                              <img src={logoPreview} alt="Logo Preview" className="h-full w-full object-contain p-2" />
                            ) : (
                              <School className="h-10 w-10 text-slate-200" />
                            )}
                          </div>
                          {logoPreview && (
                            <button 
                              className="absolute -top-2 -right-2 h-7 w-7 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600 transition-colors z-10"
                              onClick={() => {
                                setLogoPreview(null);
                                setFormData(prev => ({ ...prev, logoUrl: '' }));
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="flex-1 space-y-4 w-full">
                          <div className="flex flex-col gap-2">
                            <Label htmlFor="website" className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                              <Globe className="h-3 w-3" /> Auto-fetch from Website
                            </Label>
                            <div className="flex gap-2">
                              <Input 
                                id="website"
                                placeholder="e.g. stanford.edu"
                                value={formData.website}
                                onChange={(e) => setFormData({...formData, website: e.target.value})}
                                className="h-10 rounded-xl border-2 bg-white focus-visible:ring-primary/20"
                              />
                              <Button 
                                type="button" 
                                variant="outline" 
                                className="h-10 px-4 font-bold rounded-xl border-2 hover:bg-primary/5 min-w-[80px]" 
                                onClick={fetchLogoFromWebsite}
                                disabled={fetchingLogo}
                              >
                                {fetchingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch"}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="relative">
                            <input 
                              type="file" 
                              id="logo-upload" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={handleLogoUpload}
                            />
                            <Label 
                              htmlFor="logo-upload" 
                              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-primary cursor-pointer hover:underline"
                            >
                              <Upload className="h-3 w-3" /> Or upload manually (Max 2MB)
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <School className="h-3.5 w-3.5" /> Institutional Name
                      </Label>
                      <Input 
                        placeholder="e.g. Stanford University" 
                        className={`h-12 rounded-xl border-2 focus-visible:ring-primary/20 ${errors.name ? "border-destructive/50 bg-destructive/5" : "bg-slate-50/50 border-slate-100"}`}
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                      {errors.name && <p className="text-[10px] font-bold text-destructive flex items-center gap-1 uppercase tracking-wider"><AlertCircle className="h-3 w-3" /> {errors.name}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2.5">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">College Code</Label>
                        <Input 
                          placeholder="e.g. STAN" 
                          className={`h-12 rounded-xl border-2 uppercase font-bold tracking-widest ${errors.code ? "border-destructive/50 bg-destructive/5" : "bg-slate-50/50 border-slate-100"}`}
                          value={formData.code}
                          onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                        />
                        {errors.code && <p className="text-[10px] font-bold text-destructive flex items-center gap-1 uppercase tracking-wider"><AlertCircle className="h-3 w-3" /> {errors.code}</p>}
                      </div>
                      <div className="space-y-2.5">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Primary Contact Email</Label>
                        <Input 
                          type="email"
                          placeholder="registrar@college.edu" 
                          className={`h-12 rounded-xl border-2 ${errors.email ? "border-destructive/50 bg-destructive/5" : "bg-slate-50/50 border-slate-100"}`}
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                        {errors.email && <p className="text-[10px] font-bold text-destructive flex items-center gap-1 uppercase tracking-wider"><AlertCircle className="h-3 w-3" /> {errors.email}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2.5">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" /> Full Physical Address
                      </Label>
                      <Input 
                        placeholder="Street name, building, campus location..." 
                        className="h-12 rounded-xl border-2 bg-slate-50/50 border-slate-100"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2.5">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">City</Label>
                        <Input 
                          placeholder="e.g. Palo Alto" 
                          className={`h-12 rounded-xl border-2 bg-slate-50/50 border-slate-100 ${errors.city ? "border-destructive/50" : ""}`}
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2.5">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">State / Province</Label>
                        <Input 
                          placeholder="e.g. California" 
                          className={`h-12 rounded-xl border-2 bg-slate-50/50 border-slate-100 ${errors.state ? "border-destructive/50" : ""}`}
                          value={formData.state}
                          onChange={(e) => setFormData({...formData, state: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Contact Phone Number</Label>
                      <Input 
                        placeholder="+1 (650) 000-0000" 
                        className="h-12 rounded-xl border-2 bg-slate-50/50 border-slate-100"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2.5">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <User className="h-3.5 w-3.5" /> Primary Administrator Name
                      </Label>
                      <Input 
                        placeholder="e.g. Dr. Sarah Connor" 
                        className={`h-12 rounded-xl border-2 bg-slate-50/50 border-slate-100 ${errors.adminName ? "border-destructive/50" : ""}`}
                        value={formData.adminName}
                        onChange={(e) => setFormData({...formData, adminName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Platform Admin Email</Label>
                      <Input 
                        type="email"
                        placeholder="admin@college.edu"
                        className={`h-12 rounded-xl border-2 ${errors.adminEmail ? "border-destructive/50 bg-destructive/5" : "bg-slate-50/50 border-slate-100"}`}
                        value={formData.adminEmail}
                        onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
                      />
                      {errors.adminEmail && <p className="text-[10px] font-bold text-destructive uppercase tracking-wider">{errors.adminEmail}</p>}
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Secure Access Password</Label>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"}
                          value={formData.adminPassword}
                          className={`h-12 pr-24 rounded-xl border-2 font-mono bg-slate-50/50 border-slate-100 ${errors.adminPassword ? "border-destructive/50" : ""}`}
                          onChange={(e) => setFormData({...formData, adminPassword: e.target.value})}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-white" onClick={() => setFormData(prev => ({ ...prev, adminPassword: generatePassword() }))}>
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {errors.adminPassword && <p className="text-[10px] font-bold text-destructive uppercase tracking-wider">{errors.adminPassword}</p>}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2.5">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Subscription Tier</Label>
                        <Select value={formData.subscription} onValueChange={(v) => setFormData({...formData, subscription: v})}>
                          <SelectTrigger className="h-12 rounded-xl border-2 bg-slate-50/50 border-slate-100 font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="Free">Free Tier</SelectItem>
                            <SelectItem value="Basic">Basic Platform</SelectItem>
                            <SelectItem value="Premium">Premium Suite</SelectItem>
                            <SelectItem value="Enterprise">Enterprise Solution</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2.5">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Initial Account Status</Label>
                        <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                          <SelectTrigger className="h-12 rounded-xl border-2 bg-slate-50/50 border-slate-100 font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Disabled">Disabled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Settings2 className="h-3.5 w-3.5" /> Feature Configuration
                      </Label>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border-2 border-slate-100 hover:border-primary/20 transition-colors">
                          <div className="space-y-1">
                            <p className="text-sm font-bold">Doubt Resolution System</p>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">AI-powered 24/7 academic support</p>
                          </div>
                          <Switch checked={formData.features.doubtSystem} onCheckedChange={(v) => setFormData({...formData, features: { ...formData.features, doubtSystem: v }})} />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border-2 border-slate-100 hover:border-primary/20 transition-colors">
                          <div className="space-y-1">
                            <p className="text-sm font-bold">Biometric Attendance</p>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Automated tracking for campus presence</p>
                          </div>
                          <Switch checked={formData.features.attendance} onCheckedChange={(v) => setFormData({...formData, features: { ...formData.features, attendance: v }})} />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border-2 border-slate-100 hover:border-primary/20 transition-colors">
                          <div className="space-y-1">
                            <p className="text-sm font-bold">Advanced Analytics Suite</p>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Deep insights into institutional growth</p>
                          </div>
                          <Switch checked={formData.features.analytics} onCheckedChange={(v) => setFormData({...formData, features: { ...formData.features, analytics: v }})} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 md:p-8 border-t bg-slate-50/30 flex flex-col sm:flex-row justify-between gap-3">
              <Button 
                variant="ghost" 
                className="h-12 font-bold rounded-xl w-full sm:w-auto px-8" 
                onClick={step === 1 ? onClose : handleBack}
              >
                {step === 1 ? 'Discard' : 'Back'}
              </Button>
              <Button 
                className="h-12 px-10 font-bold rounded-xl w-full sm:w-auto shadow-lg shadow-primary/20 min-w-[180px]" 
                disabled={loading}
                onClick={step === 4 ? handleSubmit : handleNext}
              >
                {loading ? 'Processing...' : step === 4 ? 'Complete Setup' : 'Continue'}
                {!loading && step < 4 && <ChevronRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
