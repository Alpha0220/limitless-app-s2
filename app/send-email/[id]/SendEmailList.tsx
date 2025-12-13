'use client';

import { useState } from 'react';
import SendEmailForm from './SendEmailForm';

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
    is_email_sent?: 'success' | 'fail' | 'pending';
  };
}

export default function SendEmailList({ students }: { students: StudentData[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(
    students.length === 1 ? students[0].id : null
  );

  const toggleAccordion = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-3">
      {students.map((student) => {
        const isExpanded = expandedId === student.id;
        const emailStatus = student.fields.is_email_sent || 'pending';

        let statusColor = 'bg-slate-100 text-slate-600';
        let statusText = 'ยังไม่ส่ง';
        if (emailStatus === 'success') {
          statusColor = 'bg-green-100 text-green-700';
          statusText = 'ส่งแล้ว';
        } else if (emailStatus === 'fail') {
          statusColor = 'bg-red-100 text-red-700';
          statusText = 'ส่งไม่สำเร็จ';
        }

        return (
          <div
            key={student.id}
            className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${isExpanded ? 'border-indigo-300 shadow-md ring-1 ring-indigo-100' : 'border-slate-200 hover:border-indigo-200'}`}
          >
            {/* Header */}
            <div
              onClick={() => toggleAccordion(student.id)}
              className="p-4 flex items-center justify-between cursor-pointer group bg-white"
            >
              <div className="flex items-center gap-4 w-full">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm shrink-0 ${emailStatus === 'success' ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-slate-700 to-slate-800'}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>

                {/* Content */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 w-full text-sm">
                  <div className="font-bold text-slate-800 text-base">
                    คุณ {student.fields.full_name || 'ไม่ระบุชื่อ'}
                  </div>

                  <div className="hidden sm:block text-slate-300">/</div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Class</span>
                    <span className="font-medium text-slate-600">{student.fields.name_class || '-'}</span>
                  </div>

                  <div className="hidden sm:block text-slate-300">/</div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Status :</span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wide border ${emailStatus === 'success' ? 'bg-green-50 text-green-700 border-green-200' :
                        emailStatus === 'fail' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                      {statusText}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-indigo-500' : ''}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            {/* Body */}
            {isExpanded && (
              <SendEmailForm student={student} />
            )}
          </div>
        );
      })}
    </div>
  );
}
