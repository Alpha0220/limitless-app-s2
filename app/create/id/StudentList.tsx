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

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3">
      {students.map((student) => {
        const isExpanded = expandedId === student.id;
        const isCompleted = student.fields.is_update;

        return (
          <div
            key={student.id}
            id={`student-${student.id}`}
            className={`
              bg-white rounded-lg border transition-all duration-200
              ${isExpanded
                ? 'border-slate-300 shadow-md'
                : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }
            `}
          >
            {/* Accordion Header */}
            <button
              onClick={() => toggleAccordion(student.id)}
              className="w-full flex items-center justify-between p-5 text-left focus:outline-none group"
            >
              <div className="flex items-center gap-4">
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-base
                  ${isCompleted
                    ? 'bg-emerald-500'
                    : 'bg-slate-700'
                  }
                `}>
                  {student.fields.name_class ? student.fields.name_class.substring(0, 1) : '?'}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {student.fields.full_name || 'ไม่ระบุชื่อ'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-slate-500">
                      {student.fields.name_class}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${isCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {isCompleted ? 'ยืนยันแล้ว' : 'รอตรวจสอบ'}
                    </span>
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
                {isExpanded && <StudentUpdateForm student={student} />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
