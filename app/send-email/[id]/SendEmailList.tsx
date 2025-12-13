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
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm ${emailStatus === 'success' ? 'bg-green-500' : 'bg-slate-700'}`}>
                  {student.fields.name_class ? student.fields.name_class.substring(0, 1) : '?'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {student.fields.full_name || 'ไม่ระบุชื่อ'}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500">{student.fields.name_class || '-'}</span>
                    <span className="text-slate-300">•</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
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
