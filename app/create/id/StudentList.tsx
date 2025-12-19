'use client';

import { useState } from 'react';
import StudentUpdateForm from './StudentUpdateForm';
import { formatDate } from '@/lib/utils';

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
    remark?: string;
    is_update?: boolean;
  };
}

export default function StudentList({ students }: { students: StudentData[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(
    students.length === 1 ? students[0].id : null
  );

  const toggleAccordion = (id: string) => {
    const isOpening = expandedId !== id;
    setExpandedId(isOpening ? id : null);
  };

  // Find a student who has completed the update to use as a template
  const billingTemplate = students.find(s => s.fields.is_update);

  // Calculate stats
  const total = students.length;
  const completed = students.filter(s => s.fields.is_update).length;
  const pending = total - completed;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Nested Card Layout - Mobile Optimized */}
      <div className="bg-white/70 backdrop-blur-2xl rounded-xl sm:rounded-xl border border-white/60 shadow-xl shadow-slate-200/50 min-h-[70vh] flex flex-col overflow-hidden">

        {/* Card Header with Stats */}
        <div className="px-6 py-5 border-b border-slate-100 bg-white/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
              <div className="w-1.5 h-7 bg-blue-600 rounded-full shadow-sm shadow-blue-200"></div>
              ตรวจสอบข้อมูล
            </h3>
            <p className="text-sm text-slate-500 mt-1 ml-4.5 font-medium italic">กรุณาอัปเดตข้อมูลให้ครบถ้วนเพื่อดำเนินการต่อ</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <div className={`
              px-4 py-2 rounded-full border shadow-sm transition-all duration-300 flex items-center gap-2
              ${completed === total 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                : 'bg-amber-50 text-amber-700 border-amber-100'
              }
            `}>
              <span className={`w-1.5 h-1.5 rounded-full ${completed === total ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              ส่งแล้ว {completed}/{total}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-8 space-y-3 flex-grow">
          {students.map((student) => {
            const isExpanded = expandedId === student.id;
            const isCompleted = student.fields.is_update;

            return (
              <div
                key={student.id}
                id={`student-${student.id}`}
                className={`
              bg-white rounded-2xl border transition-all duration-300
              ${isExpanded
                    ? 'border-blue-100 shadow-xl shadow-blue-500/5 ring-4 ring-blue-50/20'
                    : 'border-slate-100 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/40'
                  }
            `}
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleAccordion(student.id)}
                  className="w-full flex items-center justify-between p-3 text-left focus:outline-none group"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0 transition-transform duration-300 group-hover:scale-110
                      ${isCompleted
                        ? 'bg-emerald-500 shadow-emerald-200 shadow-lg'
                        : 'bg-slate-400 shadow-slate-100 shadow-md'
                      }
                    `}>
                      {student.fields.full_name ? student.fields.full_name.substring(0, 1) : '?'}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 flex-grow text-sm">
                     <h3 className={`text-lg font-bold transition-colors duration-200 ${isExpanded ? 'text-blue-700' : 'text-slate-800'}`}>
                        {student.fields.full_name || 'ไม่ระบุชื่อ'}
                      </h3>

                      <div>
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></span>
                            ส่งแล้ว
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-sm shadow-amber-200"></span>
                            ยังไม่ส่ง
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={`
                transition-transform duration-200 text-slate-400
                ${isExpanded ? 'rotate-180' : ''}
              `}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Accordion Body */}
                <div
                  className={`
                transition-all duration-300 ease-in-out overflow-hidden
                ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
              `}
                >
                  <div className="border-t border-slate-100">
                    {isExpanded && <StudentUpdateForm student={student} billingTemplate={billingTemplate} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
