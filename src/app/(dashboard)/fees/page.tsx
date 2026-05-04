"use client"

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CreditCard, DollarSign, AlertCircle, CheckCircle2, Plus, Settings2, Trash2, Edit, Loader2, Download, Search, Filter, History, Landmark, Receipt, FileText, MoreVertical } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export default function FeesPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('transactions');
  
  // Data State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalCollection: 0, pendingDues: 0, activeStudents: 0 });
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  // Dialog State
  const [openPayment, setOpenPayment] = useState(false);
  const [openStructure, setOpenStructure] = useState(false);

  // Forms
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    studentId: '',
    feeStructureId: '',
    paymentMethod: 'Cash',
    type: 'Tuition',
    status: 'PAID'
  });

  const [structureForm, setStructureForm] = useState({
    name: '',
    amount: '',
    courseId: '',
    description: ''
  });

  const [editingStructure, setEditingStructure] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txn, str, st, std, crs] = await Promise.all([
        api.get('/api/finance/transactions'),
        api.get('/api/finance/fee-structures'),
        api.get('/api/finance/stats'),
        api.get('/api/students/list'),
        api.get('/api/setup/courses')
      ]);
      setTransactions(Array.isArray(txn.data) ? txn.data : (txn.data?.data || []));
      setFeeStructures(Array.isArray(str.data) ? str.data : (str.data?.data || []));
      setStats(st.data || { totalCollection: 0, pendingDues: 0, activeStudents: 0 });
      setStudents(Array.isArray(std.data) ? std.data : (std.data?.data || []));
      setCourses(Array.isArray(crs.data) ? crs.data : (crs.data?.data || []));
    } catch (err) {
      console.error(err);
      toast({ title: "Sync Error", description: "Failed to connect to financial ledger.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.studentId || !paymentForm.amount) {
        toast({ title: "Validation Error", description: "Please select a student and enter amount.", variant: "destructive" });
        return;
    }
    setSubmitting(true);
    try {
      await api.post('/api/finance/transactions', paymentForm);
      toast({ title: "Receipt Generated", description: "Payment has been recorded successfully." });
      setOpenPayment(false);
      // Reset form
      setPaymentForm({
        amount: '',
        studentId: '',
        feeStructureId: '',
        paymentMethod: 'Cash',
        type: 'Tuition',
        status: 'PAID'
      });
      fetchData();
    } catch (err) {
      toast({ title: "Failed", description: "Could not process payment entry.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStructureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingStructure) {
        await api.put(`/api/finance/fee-structures/${editingStructure.id}`, structureForm);
        toast({ title: "Structure Updated", description: "Fee model has been updated." });
      } else {
        await api.post('/api/finance/fee-structures', structureForm);
        toast({ title: "Structure Saved", description: "New fee model has been published." });
      }
      setOpenStructure(false);
      setEditingStructure(null);
      setStructureForm({ name: '', amount: '', courseId: '', description: '' });
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: "Failed to save structure.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteStructure = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fee structure?")) return;
    try {
        await api.delete(`/api/finance/fee-structures/${id}`);
        toast({ title: "Deleted", description: "Fee structure removed." });
        fetchData();
    } catch (err) {
        toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const handleDownloadReceipt = (tx: any) => {
    // Production-ready mock: Open a print-friendly window with receipt details
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const content = `
      <html>
        <head>
          <title>Receipt - ${tx.receiptNo}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 15px; }
            .label { font-weight: bold; color: #666; }
            .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #999; }
            .stamp { border: 2px solid #22c55e; color: #22c55e; padding: 10px; display: inline-block; transform: rotate(-5deg); font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PULSEDESK RECEIPT</h1>
            <p>Official Academic Payment Record</p>
          </div>
          <div class="row"><span class="label">Receipt Number:</span> <span>${tx.receiptNo}</span></div>
          <div class="row"><span class="label">Date:</span> <span>${new Date(tx.paymentDate).toLocaleDateString()}</span></div>
          <hr/>
          <div class="row"><span class="label">Student Name:</span> <span>${tx.student?.user?.firstName} ${tx.student?.user?.lastName}</span></div>
          <div class="row"><span class="label">Enrollment No:</span> <span>${tx.student?.enrollmentNo}</span></div>
          <div class="row"><span class="label">Payment For:</span> <span>${tx.type}</span></div>
          <div class="row"><span class="label">Payment Method:</span> <span>${tx.paymentMethod}</span></div>
          <hr/>
          <div class="row" style="font-size: 24px; margin-top: 20px;">
            <span class="label">Total Amount:</span> <span>₹${tx.amount.toLocaleString()}</span>
          </div>
          <div style="text-align: right;"><div class="stamp">PAID & VERIFIED</div></div>
          <div class="footer">
            <p>This is a computer generated receipt and does not require a physical signature.</p>
            <p>© ${new Date().getFullYear()} PulseDesk Management Platform</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    
    printWindow.document.write(content);
    printWindow.document.close();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-indigo-600/10 rounded-2xl">
                <Landmark className="w-8 h-8 text-indigo-600" />
             </div>
             <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Financial Management</h1>
                <p className="text-slate-500">Centralized ledger for fee structures and student transactions</p>
             </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={openPayment} onOpenChange={setOpenPayment}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 px-6 h-12 rounded-2xl font-bold">
                  <Plus className="h-5 w-5 mr-2" /> New Payment Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl border-none shadow-2xl rounded-3xl">
                <form onSubmit={handlePaymentSubmit}>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Record Transaction</DialogTitle>
                    <DialogDescription>Manually enter a payment received via offline or bank channels.</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-6 py-6">
                    <div className="space-y-2">
                        <Label>Student</Label>
                        <Select required onValueChange={(v) => setPaymentForm({...paymentForm, studentId: v})}>
                            <SelectTrigger className="h-11"><SelectValue placeholder="Search Student" /></SelectTrigger>
                            <SelectContent>
                                {students.map(s => <SelectItem key={s._id} value={s._id}>{s.name} ({s.id})</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Fee Structure / Category</Label>
                        <Select onValueChange={(v) => {
                            const structure = feeStructures.find(f => f.id === v);
                            setPaymentForm({...paymentForm, feeStructureId: v, amount: structure ? structure.amount.toString() : paymentForm.amount});
                        }}>
                            <SelectTrigger className="h-11"><SelectValue placeholder="Select Category" /></SelectTrigger>
                            <SelectContent>
                                {feeStructures.map(f => <SelectItem key={f.id} value={f.id}>{f.name} (₹{f.amount})</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Amount Paid (₹)</Label>
                        <Input type="number" placeholder="0.00" required value={paymentForm.amount} onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})} className="h-11" />
                    </div>
                    <div className="space-y-2">
                        <Label>Payment Method</Label>
                        <Select value={paymentForm.paymentMethod} onValueChange={(v) => setPaymentForm({...paymentForm, paymentMethod: v})}>
                            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="UPI">UPI / Digital</SelectItem>
                                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                <SelectItem value="Cheque">Cheque</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={submitting} className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 text-lg rounded-xl font-bold">
                        {submitting && <Loader2 className="animate-spin mr-2 h-5 w-5" />} Record & Generate Receipt
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-100 p-1.5 rounded-2xl h-14 border border-slate-200">
            <TabsTrigger value="transactions" className="rounded-xl px-8 font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
                <History className="w-4 h-4 mr-2" /> Recent Transactions
            </TabsTrigger>
            <TabsTrigger value="structures" className="rounded-xl px-8 font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
                <Receipt className="w-4 h-4 mr-2" /> Fee Categories & Structures
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-none shadow-xl shadow-indigo-100 bg-indigo-600 text-white rounded-3xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10"><DollarSign size={80} /></div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black uppercase tracking-widest opacity-80 flex items-center gap-2">
                    Total Collection (FY)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-black">₹{(stats.totalCollection/100000).toFixed(2)}L</p>
                  <p className="text-xs opacity-70 mt-2 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Updated just now
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-xl shadow-slate-200 bg-white rounded-3xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    Outstanding Dues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-black text-slate-900">₹{stats.pendingDues.toLocaleString()}</p>
                  <p className="text-xs text-orange-500 mt-2 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Across {stats.activeStudents} active students
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7 bg-slate-50/50">
                <div>
                    <CardTitle className="text-xl font-bold">Transaction History</CardTitle>
                    <CardDescription>Live feed of all institutional payments</CardDescription>
                </div>
                <Button variant="outline" className="rounded-xl font-bold hover:bg-white"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                    <div className="py-20 flex flex-col items-center"><Loader2 className="animate-spin h-10 w-10 text-indigo-500 mb-4" /><p className="text-slate-400">Fetching records...</p></div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/30 hover:bg-transparent">
                            <TableHead className="pl-8 h-12 text-[10px] font-black uppercase tracking-widest">Student</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest">Type</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest">Amount</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest">Date</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-right pr-8">Receipt</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="h-40 text-center text-slate-400 font-medium">No transactions found in this period.</TableCell></TableRow>
                            ) : transactions.map((tx) => (
                            <TableRow key={tx.id} className="group hover:bg-slate-50/50 transition-colors">
                                <TableCell className="pl-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">{tx.student?.user?.firstName.charAt(0)}{tx.student?.user?.lastName.charAt(0)}</div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-900">{tx.student?.user?.firstName} {tx.student?.user?.lastName}</p>
                                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{tx.receiptNo}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell><Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 font-bold text-[10px] rounded-lg">{tx.type}</Badge></TableCell>
                                <TableCell className="font-black text-slate-900">₹{tx.amount.toLocaleString()}</TableCell>
                                <TableCell className="text-slate-500 text-sm font-medium">{new Date(tx.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                                <TableCell className="text-right pr-8">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => handleDownloadReceipt(tx)}
                                        className="text-indigo-600 font-bold hover:bg-indigo-50 rounded-lg"
                                    >
                                        <Download className="h-4 w-4 mr-2" /> Download
                                    </Button>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="structures" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Fee Categories & Models</h2>
                    <p className="text-slate-500">Configure global fee categories and templates for courses</p>
                </div>
                <Dialog open={openStructure} onOpenChange={(val) => { setOpenStructure(val); if(!val) { setEditingStructure(null); setStructureForm({ name: '', amount: '', courseId: '', description: '' }); } }}>
                    <DialogTrigger asChild>
                        <Button className="bg-slate-900 hover:bg-slate-800 rounded-2xl h-11 px-6 font-bold shadow-lg shadow-slate-200"><Plus className="h-4 w-4 mr-2" /> Define New Category</Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl border-none shadow-2xl">
                        <form onSubmit={handleStructureSubmit}>
                            <DialogHeader><DialogTitle className="text-2xl font-bold">{editingStructure ? 'Edit Category' : 'New Fee Category'}</DialogTitle></DialogHeader>
                            <div className="grid gap-6 py-6">
                                <div className="space-y-2">
                                    <Label>Structure Name</Label>
                                    <Input placeholder="e.g. Annual Tuition (B.Tech)" required value={structureForm.name} onChange={(e) => setStructureForm({...structureForm, name: e.target.value})} className="h-11" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Amount (₹)</Label>
                                        <Input type="number" required value={structureForm.amount} onChange={(e) => setStructureForm({...structureForm, amount: e.target.value})} className="h-11" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Course Link (Optional)</Label>
                                        <Select onValueChange={(v) => setStructureForm({...structureForm, courseId: v})}>
                                            <SelectTrigger className="h-11"><SelectValue placeholder="Universal" /></SelectTrigger>
                                            <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input placeholder="Brief details about this fee" value={structureForm.description} onChange={(e) => setStructureForm({...structureForm, description: e.target.value})} className="h-11" />
                                </div>
                            </div>
                            <DialogFooter><Button type="submit" disabled={submitting} className="w-full bg-slate-900 h-11 rounded-xl font-bold">Save Structure</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {feeStructures.length === 0 ? (
                <div className="col-span-full py-20 text-center text-slate-400">No fee structures defined yet.</div>
              ) : feeStructures.map((fee) => (
                <Card key={fee.id} className="border-none shadow-xl shadow-slate-200/50 hover:scale-[1.02] transition-all rounded-3xl overflow-hidden group">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="text-slate-300 hover:text-slate-600"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setEditingStructure(fee); setStructureForm({ name: fee.name, amount: fee.amount.toString(), courseId: fee.courseId || '', description: fee.description || '' }); setOpenStructure(true); }}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => deleteStructure(fee.id)}><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <h3 className="font-bold text-xl text-slate-900 mb-2">{fee.name}</h3>
                    <div className="flex items-center gap-2 mb-6">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold text-[10px]">{fee.course?.code || 'Global'}</Badge>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Permanent Model</span>
                    </div>
                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                        <p className="text-3xl font-black text-indigo-600">₹{fee.amount.toLocaleString()}</p>
                        <Button variant="ghost" size="sm" className="text-xs font-bold text-slate-400 hover:text-slate-900">Details &rarr;</Button>
                    </div>
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
