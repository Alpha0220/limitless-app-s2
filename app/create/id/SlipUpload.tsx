'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { uploadSlips } from '@/actions/registration';

interface SlipUploadProps {
  uuid: string;
}

export default function SlipUpload({ uuid }: SlipUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    // Filter out duplicates if any (simple check by name/size)
    const newFiles = selectedFiles.filter(sf => !files.some(f => f.name === sf.name && f.size === sf.size));
    
    if (newFiles.length === 0) return;

    setFiles(prev => [...prev, ...newFiles]);

    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setStatus(null);

    try {
      const formData = new FormData();
      formData.append('uuid', uuid);
      files.forEach(file => {
        formData.append('slips', file);
      });

      const result = await uploadSlips(formData);
      setStatus(result);
      if (result.success) {
        // Revoke all previews
        previews.forEach(p => URL.revokeObjectURL(p));
        setFiles([]);
        setPreviews([]);
      }
    } catch (error) {
      console.error('Upload catch error:', error);
      setStatus({ success: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ หรือขนาดไฟล์ใหญ่เกินไป' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-dashed border-slate-200 p-2 transition-all hover:border-blue-400/50 hover:bg-blue-50/30 group w-full lg:w-fit">
      <div className="flex flex-col items-center justify-center gap-4">
        {previews.length === 0 ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center cursor-pointer py-2 w-full group/upload-btn"
          >
            <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-2 group-hover/upload-btn:scale-110 group-hover/upload-btn:rotate-3 transition-all duration-500 shadow-slate-200/50">
              <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="text-slate-600 font-bold text-xs uppercase tracking-widest group-hover/upload-btn:text-blue-600 transition-colors">แนบสลิปเพิ่มเติม</h4>
          </div>
        ) : (
          <div className="w-full space-y-6">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-slate-800 font-extrabold text-sm uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                รายการสลิป ({files.length})
              </h4>
              <button 
                onClick={() => { previews.forEach(p => URL.revokeObjectURL(p)); setPreviews([]); setFiles([]); }}
                disabled={isUploading}
                className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
              >
                ล้างทั้งหมด
              </button>
            </div>

            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {previews.map((src, idx) => (
                <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm ring-2 ring-transparent hover:ring-blue-100 transition-all">
                  <Image 
                    src={src} 
                    fill 
                    unoptimized 
                    className="object-cover" 
                    alt={`Slip preview ${idx + 1}`} 
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors cursor-default"></div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                    className="absolute top-1.5 right-1.5 w-7 h-7 bg-red-500/90 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors backdrop-blur-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="aspect-[3/4] rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 hover:border-blue-400/50 hover:bg-blue-50/50 transition-all text-slate-400 hover:text-blue-600"
              >
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">เพิ่มรูป</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className={`
                  w-full py-4 px-6 rounded-xl font-bold text-sm uppercase tracking-widest shadow-xl transition-all duration-300
                  ${isUploading
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:transform active:scale-[0.98] text-white shadow-blue-500/20'
                  }
                `}
              >
                {isUploading ? (
                  <span className="flex items-center justify-center gap-2.5">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    กำลังอัปโหลดข้อมูล...
                  </span>
                ) : 'ยืนยันอัปโหลดสลิป'}
              </button>
            </div>
          </div>
        )}

        {status && (
          <div className={`w-full mt-2 p-4 rounded-xl border text-sm text-center font-bold tracking-tight animate-in slide-in-from-top-2 duration-500 ${status.success ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
            <div className="flex items-center justify-center gap-2">
              {status.success && (
                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {status.message}
            </div>
          </div>
        )}

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          multiple 
          accept="image/*" 
          className="hidden" 
        />
      </div>
    </div>
  );
}
