'use client';

import { useState } from 'react';
import StudentUpdateForm from './StudentUpdateForm';

interface StudentData {
  id: string;
  fields: {
    uuid?: string;
    full_name?: string;
    nickname?: string;
    name_class?: string;
    company_name?: string;
    taxpayer_name?: string;
    tax_id?: string;
    tax_addres?: string;
    bill_email?: string;
    user_email?: string;
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
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              ข้อมูลที่ต้องตรวจสอบ
            </h3>
            <p className="text-xs text-slate-500 mt-1 ml-3.5">กรุณาตรวจสอบและอัปเดตข้อมูลให้ครบถ้วน</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              ยืนยันแล้ว: <span className="font-bold">{completed}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              ยังไม่ส่ง: <span className="font-bold">{pending}</span>
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
              bg-white rounded-xl border transition-all duration-200
              ${isExpanded
                    ? 'border-slate-300 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
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
                      w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-base shrink-0
                      ${isCompleted
                        ? 'bg-emerald-500 shadow-emerald-200 shadow-md'
                        : 'bg-slate-700 shadow-slate-200 shadow-sm'
                      }
                    `}>
                      {student.fields.full_name ? student.fields.full_name.substring(0, 1) : '?'}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 flex-grow text-sm">
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        {student.fields.full_name || 'ไม่ระบุชื่อ'}
                      </h3>

                      <span className="hidden sm:inline-block text-slate-300"> | </span>

                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="font-medium text-slate-900">Class</span>
                        <span>- {student.fields.name_class}</span>
                      </div>

                      <span className="hidden sm:inline-block text-slate-300"> | </span>

                      <div>
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            ยืนยันแล้ว
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            รอตรวจสอบ
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
