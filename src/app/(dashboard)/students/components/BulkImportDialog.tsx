"use client"

import React, { useState, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

interface BulkImportDialogProps {
  onImportComplete: () => void;
}

export function BulkImportDialog({ onImportComplete }: BulkImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast.error("Please select a valid CSV file.");
        return;
      }
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    setParsing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const data = lines.slice(1).filter(line => line.trim()).map(line => {
        const [name, email, department, semester] = line.split(',').map(item => item.trim());
        return { name, email, department, semester };
      });
      setPreviewData(data);
      setParsing(false);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (previewData.length === 0) return;
    setUploading(true);
    try {
      const res = await api.post('/api/students/bulk-enroll', { students: previewData });
      toast.success(`Successfully imported ${res.data.successCount} students.`);
      if (res.data.errorCount > 0) {
        toast.warning(`${res.data.errorCount} students failed to import. Check console for details.`);
        console.error("Import Errors:", res.data.errors);
      }
      setOpen(false);
      setFile(null);
      setPreviewData([]);
      onImportComplete();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to import students.");
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreviewData([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-white">
          <Upload className="h-4 w-4 mr-2" /> Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bulk Student Import</DialogTitle>
          <DialogDescription>
            Upload a CSV file containing student details. The format should be: 
            <code className="block mt-2 p-2 bg-slate-100 rounded text-[10px]">
              name, email, department, semester
            </code>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Upload className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="font-bold text-sm">Click to upload CSV</p>
                <p className="text-xs text-slate-500">Maximum file size 5MB</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".csv" 
                className="hidden" 
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-bold truncate max-w-[300px]">{file.name}</p>
                    <p className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(2)} KB • {previewData.length} records found</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={clearFile} className="h-8 w-8 text-slate-400 hover:text-rose-500">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden max-h-[200px] overflow-y-auto">
                <table className="w-full text-[10px]">
                  <thead className="bg-slate-100 sticky top-0">
                    <tr>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Dept</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2">{row.name}</td>
                        <td className="p-2 font-mono">{row.email}</td>
                        <td className="p-2">{row.department}</td>
                      </tr>
                    ))}
                    {previewData.length > 5 && (
                      <tr className="border-t bg-slate-50/50">
                        <td colSpan={3} className="p-2 text-center text-slate-400 font-medium">
                          And {previewData.length - 5} more records...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUpload} 
            disabled={!file || uploading || parsing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Importing...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" /> Start Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
