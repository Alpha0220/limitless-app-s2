'use client';

import { useFormStatus, useFormState } from 'react-dom';
import { sendEmailWithAttachment } from '@/app/actions';
import { useState } from 'react';

// Submit button component
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`
        w-full py-2.5 px-4 rounded-lg font-medium text-white shadow-sm transition-all duration-200 flex items-center justify-center gap-2
        ${pending
          ? 'bg-slate-400 cursor-not-allowed'
          : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
        }
      `}
    >
      {pending ? (
        <>
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          กำลังส่งอีเมล...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          ยืนยันและส่งอีเมล
        </>
      )}
    </button>
  );
}

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

const initialState = {
  success: false,
  message: '',
};

export default function SendEmailForm({ student }: { student: StudentData }) {
  const [state, formAction] = useFormState(sendEmailWithAttachment, initialState);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName(null);
    }
  };

  return (
    <div className="bg-slate-50/50 p-6 rounded-b-xl border-t border-slate-100">

      {state.message && (
        <div className={`mb-4 p-3 rounded-lg border text-sm flex items-center gap-2 ${state.success ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {state.success ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          )}
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="recordId" value={student.id} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* General Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2">ข้อมูลทั่วไป</h4>
            <InputField label="ชื่อ-นามสกุล" name="full_name" defaultValue={student.fields.full_name} />
            <InputField label="รหัสคลาส" name="name_class" defaultValue={student.fields.name_class} />
          </div>

          {/* Tax Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2">ใบกำกับภาษี</h4>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="ชื่อบริษัท" name="company_name" defaultValue={student.fields.company_name} placeholder="-" />
              <InputField label="เลขผู้เสียภาษี" name="tax_id" defaultValue={student.fields.tax_id} placeholder="-" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">ที่อยู่</label>
              <textarea
                name="tax_addres"
                defaultValue={student.fields.tax_addres}
                rows={2}
                className="w-full border border-slate-200 rounded-md p-2 text-sm text-slate-900 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>
            <InputField label="Email รับบิล (สำคัญ)" name="bill_email" type="email" defaultValue={student.fields.bill_email} placeholder="example@mail.com" required />
          </div>
        </div>

        {/* File Upload */}
        <div className="border-t border-slate-200 pt-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">แนบไฟล์ (ใบเสร็จ/Tax Invoice)</label>
          <div className="flex items-center gap-3">
            <label className="relative cursor-pointer bg-white border border-slate-300 rounded-lg py-2 px-4 shadow-sm hover:bg-slate-50 transition-colors">
              <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                เลือกไฟล์...
              </span>
              <input type="file" name="attachment" className="hidden" onChange={handleFileChange} />
            </label>
            <span className="text-sm text-slate-500 italic">
              {fileName || 'ยังไม่ได้เลือกไฟล์'}
            </span>
          </div>
        </div>

        <div className="pt-2">
          <SubmitButton />
        </div>

      </form>
    </div>
  );
}

function InputField({ label, name, type = "text", defaultValue, placeholder, required = false }: any) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="w-full border border-slate-200 rounded-md p-2 text-sm text-slate-900 focus:ring-1 focus:ring-indigo-500 outline-none"
      />
    </div>
  );
}
