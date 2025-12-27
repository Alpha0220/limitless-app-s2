'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StudentUpdateForm from './StudentUpdateForm';
import SlipUpload from './SlipUpload';
import { formatDate } from '@/lib/utils';
import { updateSaleName } from '@/actions/student';
import { updatePayerName } from '@/actions/registration';

interface StudentData {
  id: string;
  fields: {
    uuid?: string;
    full_name?: string;
    nickname?: string;
    name_class?: string;
    date?: string;
    company_name?: string;
    taxpayer_name?: string;
    tax_id?: string;
    tax_addres?: string;
    bill_email?: string;
    user_email?: string;
    full_name_certificate?: string;
    phone_num?: string;
    name_sale?: string;
    remark?: string;
    is_update?: boolean;
  };
}

export default function StudentList({ 
  students, 
  salesList = [],
  registration
}: { 
  students: StudentData[], 
  salesList?: string[],
  registration?: any
}) {
  // Find a student who has completed the update to use as a template
  const billingTemplate = students.find(s => s.fields.is_update);

  // Calculate stats
  const total = students.length;
  const completed = students.filter(s => s.fields.is_update).length;

  // Initialize sale name from existing data if available, default to 'โฟน'
  const initialSale = students.find(s => s.fields.name_sale)?.fields.name_sale || 'โฟน';
  const [selectedSale, setSelectedSale] = useState(initialSale);
  const [isUpdatingSale, setIsUpdatingSale] = useState(false);

  // Initialize payer name from registration data
  const [selectedPayer, setSelectedPayer] = useState(registration?.fields?.name_regis || '');
  const [isUpdatingPayer, setIsUpdatingPayer] = useState(false);

  // Track expanded students
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Trigger success modal when all are completed
  useEffect(() => {
    if (total > 0 && completed === total) {
      // Small delay for better UX
      const timer = setTimeout(() => setShowSuccessModal(true), 800);
      return () => clearTimeout(timer);
    } else {
      setShowSuccessModal(false);
    }
  }, [completed, total]);

  // Update expandedIds when students prop changes (e.g., after submission)
  // Shows all uncompleted forms, hides completed ones
  useEffect(() => {
    const uncompletedIds = students
      .filter(s => !s.fields.is_update)
      .map(s => s.id);
    setExpandedIds(uncompletedIds);
  }, [students]);

  const toggleAccordion = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSaleChange = async (sale: string) => {
    setSelectedSale(sale);
    setIsUpdatingSale(true);
    const recordIds = students.map(s => s.id);
    await updateSaleName(recordIds, sale);
    setIsUpdatingSale(false);
  };

  const handlePayerChange = async (payer: string) => {
    setSelectedPayer(payer);
    // Do not update the backend if the value is empty
    if (!payer) return;
    
    setIsUpdatingPayer(true);
    if (students.length > 0 && students[0].fields.uuid) {
      await updatePayerName(students[0].fields.uuid, payer);
    }
    setIsUpdatingPayer(false);
  };


  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Nested Card Layout - Mobile Optimized */}
      <div className="bg-white/70 backdrop-blur-2xl rounded-xl sm:rounded-xl border border-white/60 shadow-xl shadow-slate-200/50 min-h-[70vh] flex flex-col overflow-hidden">

        {/* Card Header with Stats & Upload */}
        <div className="px-6 py-6 border-b border-slate-100 bg-white/40 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="flex-grow space-y-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
                <div className="w-1.5 h-7 bg-blue-600 rounded-full shadow-sm shadow-blue-200"></div>
                ข้อมูลนักเรียน              </h3>
              
              <div className={`
                px-3 py-1 rounded-lg border text-[13px] font-bold transition-all duration-300 flex items-center gap-2
                ${completed === total 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                  : 'bg-amber-50 text-amber-700 border-amber-100'
                }
              `}>
                <span className={`w-1.5 h-1.5 rounded-full ${completed === total ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                ส่งแล้ว {completed}/{total}
              </div>
            </div>

            <p className="text-sm text-slate-500 font-medium italic ml-4.5">กรุณาอัปเดตข้อมูลให้ครบถ้วนเพื่อดำเนินการต่อ</p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-1.5 ml-4.5">
              
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Sales Group */}
                <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
                  <label className="text-[13px] font-bold text-slate-600 uppercase tracking-wide ml-1">ชื่อเซล <span className="text-red-500">*</span></label>
                  <div className="relative w-full">
                    <select
                      value={selectedSale}
                      onChange={(e) => handleSaleChange(e.target.value)}
                      disabled={isUpdatingSale}
                      className="appearance-none w-full bg-slate-50 border border-slate-200 text-slate-700 text-[12px] font-bold py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      <option value="">เลือกรายชื่อ...</option>
                      {salesList.map(sale => (
                        <option key={sale} value={sale}>{sale}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-400">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Payer Group */}
                <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
                  <label className="text-[13px] font-bold text-slate-600 uppercase tracking-wide ml-1">ชำระเงินโดย <span className="text-red-500">*</span></label>
                  <div className="relative w-full">
                    <select
                      value={selectedPayer}
                      onChange={(e) => handlePayerChange(e.target.value)}
                      disabled={isUpdatingPayer}
                      className="appearance-none w-full bg-emerald-50/50 border border-emerald-100 text-emerald-800 text-[12px] font-bold py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      <option value="">เลือกรายชื่อ...</option>
                      {students.map(student => {
                        const displayName = student.fields.full_name_certificate || student.fields.full_name;
                        return displayName ? (
                          <option key={student.id} value={displayName}>
                            {displayName}
                          </option>
                        ) : null;
                      })}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-emerald-500">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-auto shrink-0 flex lg:justify-end items-end">
            {students.length > 0 && students[0].fields.uuid && (
              <SlipUpload uuid={students[0].fields.uuid} />
            )}
          </div>
        </div>


        <div className="p-0 sm:p-8 space-y-6 flex-grow">
          {students.map((student) => {
            const isCompleted = student.fields.is_update;
            const isExpanded = expandedIds.includes(student.id);
            const displayName = student.fields.full_name_certificate || student.fields.full_name;

            return (
              <div
                key={student.id}
                id={`student-${student.id}`}
                className={`
                  bg-white rounded-2xl border transition-all duration-300 overflow-hidden
                  ${isExpanded 
                    ? 'border-blue-300 shadow-lg shadow-blue-500/5' 
                    : 'border-slate-400'
                  }
                `}
              >
                {/* Header Section (Accordion Trigger) */}
                <button
                  onClick={() => toggleAccordion(student.id)}
                  className={`
                    w-full flex items-center justify-between p-4 transition-colors duration-200
                    ${isExpanded ? 'bg-blue-50/50 border-b border-blue-100' : 'bg-slate-50/50 border-b border-slate-100'}
                  `}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0 transition-transform duration-300
                      ${isCompleted
                        ? 'bg-emerald-500 shadow-emerald-200 shadow-lg'
                        : 'bg-slate-400 shadow-slate-100 shadow-md'
                      }
                      ${isExpanded && !isCompleted ? 'scale-110' : ''}
                    `}>
                      {displayName ? displayName.substring(0, 1) : '?'}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 flex-grow text-sm text-left">
                     <h3 className={`text-lg font-bold transition-colors duration-200 ${isExpanded ? 'text-blue-700' : 'text-slate-800'}`}>
                        {displayName || 'ไม่ระบุชื่อ'}
                      </h3>

                      <div className="flex items-center gap-3">
                        {isCompleted && (
                          <span className="text-[13px] font-bold text-blue-600 px-1">
                            ดูข้อมูล
                          </span>
                        )}
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></span>
                            ส่งแล้ว
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-sm shadow-amber-200"></span>
                            ยังไม่ส่ง
                          </span>
                        )}

                        <div className={`transition-transform duration-300 text-slate-400 ${isExpanded ? 'rotate-180' : ''}`}>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Form Body (Collapsible) */}
                <div 
                  className={`
                    transition-all duration-300 ease-in-out overflow-hidden
                    ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
                  `}
                >
                  <div className="p-0">
                    <StudentUpdateForm student={student} billingTemplate={billingTemplate} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Success Modal Overlay */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl shadow-blue-500/10 border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-500 delay-150 relative">
            {/* Close Button */}
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 z-20"
              aria-label="Close dialog"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-8 sm:p-12 flex flex-col items-center text-center">
              {/* Icon/Decoration */}
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20"></div>
                <svg className="w-10 h-10 text-emerald-500 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">
                Thank You
              </h2>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 mb-10 w-full">
                <p className="text-lg font-bold text-slate-700 leading-relaxed">
                  โปรดเช็คอีเมลการยืนยันลงทะเบียนได้ที่<br />
                  <span className="text-blue-600">อีเมลของคุณ</span>
                </p>
              </div>

              <Link
                href="https://limitless-register.vercel.app"
                className="group relative w-full sm:w-64 py-4 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span>เลือกคลาสเพิ่มเติม</span>
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
