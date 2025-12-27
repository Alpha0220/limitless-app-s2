'use client';

import { useFormStatus, useFormState } from 'react-dom';
import { updateStudent } from '@/actions/student';
import { useEffect, useState } from 'react';

// Submit button component for pending state
function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className={`
        w-full py-4 px-6 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg transition-all duration-300
        ${disabled
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:transform active:scale-[0.98] text-white shadow-blue-500/20'
        }
      `}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2.5">
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          กำลังบันทึก...
        </span>
      ) : disabled ? (
        'บันทึกข้อมูลเรียบร้อย'
      ) : (
        'ยืนยันข้อมูล'
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
    company_name?: string;
    taxpayer_name?: string;
    tax_id?: string;
    tax_addres?: string;
    bill_email?: string;
    user_email?: string;
    full_name_certificate?: string;
    phone_num?: string;
    name_sale?: string;
    name_class?: string;
    date?: string;
    remark?: string;
    is_update?: boolean;
  };
}

const initialState = {
  success: false,
  message: '',
};

const formatDateLocal = (dateString?: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export default function StudentUpdateForm({ student, billingTemplate }: { student: StudentData, billingTemplate?: StudentData }) {
  const [state, formAction] = useFormState(updateStudent, initialState);
  const [isEditing, setIsEditing] = useState(false);
  const isReadOnly = (student.fields.is_update === true || state.success) && !isEditing;

  // Reset editing state when submission is successful
  useEffect(() => {
    if (state.success) {
      setIsEditing(false);
    }
  }, [state.success]);

  // State for billing fields to allow auto-fill
  const [billingData, setBillingData] = useState({
    company_name: student.fields.company_name || '',
    taxpayer_name: student.fields.taxpayer_name || '',
    tax_id: student.fields.tax_id || '',
    bill_email: student.fields.bill_email || '',
    tax_addres: student.fields.tax_addres || '',
  });

  // State for all other fields to allow reactive background colors
  const [formData, setFormData] = useState({
    nickname: student.fields.nickname || '',
    full_name: student.fields.full_name || '',
    full_name_certificate: student.fields.full_name_certificate || '',
    phone_num: student.fields.phone_num || '',
    user_email: student.fields.user_email || '',
    remark: student.fields.remark || '',
  });

  const handleCopyBilling = () => {
    if (billingTemplate) {
      setBillingData({
        company_name: billingTemplate.fields.company_name || '',
        taxpayer_name: billingTemplate.fields.taxpayer_name || '',
        tax_id: billingTemplate.fields.tax_id || '',
        bill_email: billingTemplate.fields.bill_email || '',
        tax_addres: billingTemplate.fields.tax_addres || '',
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'phone_num') {
      finalValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let finalValue = value;
    
    // Numbers only for Tax ID (max 13)
    if (name === 'tax_id') {
      finalValue = value.replace(/[^0-9]/g, '').slice(0, 13);
    }
    
    setBillingData(prev => ({ ...prev, [name]: finalValue }));
  };

  return (
    <div className="bg-white p-6">

      <div className="flex flex-wrap items-center gap-x-2 md:gap-x-10 gap-y-3 pb-8 px-2 border-b border-slate-50 mb-8">
        <div className="flex flex-col gap-1">
          <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Class เรียน</span>
          <span className="text-lg font-bold text-slate-800 tracking-tight">{student.fields.name_class || '-'}</span>
        </div>
        <div className="flex flex-col gap-1 border-l pl-2 border-slate-200 md:pl-10">
          <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Date</span>
          <span className="text-lg font-bold text-slate-800 tracking-tight">{formatDateLocal(student.fields.date)}</span>
        </div>
      </div>

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="recordId" value={student.id} />
        <input type="hidden" name="name_class" value={student.fields.name_class || ''} />
        <input type="hidden" name="date" value={student.fields.date || ''} />
        <input type="hidden" name="uuid" value={student.fields.uuid || ''} />

        {/* Personal Info */}
        <section>
          <div className="flex items-center gap-3 mb-6 px-1">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">
              ข้อมูลส่วนตัว
            </h3>
            <div className="flex-grow h-px bg-slate-200"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 px-1">
            <div className="md:col-span-2 md:w-[48%]">
              <InputField
                label="Nickname / Social name"
                description="เช่น Matt / Matt Wonderful"
                name="nickname"
                value={formData.nickname}
                onChange={handleInputChange}
                disabled={isReadOnly}
                placeholder="ชื่อเล่นของคุณ"
                required
              />
            </div>
            <InputField
              label="ชื่อ-นามสกุล (ภาษาไทย)"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              disabled={isReadOnly}
              placeholder="ชื่อ-นามสกุล ของท่าน"
              required
            />
            <InputField
              label="ชื่อ-นามสกุล (English)"
              name="full_name_certificate"
              value={formData.full_name_certificate}
              onChange={handleInputChange}
              disabled={isReadOnly}
              placeholder="Your name in English"
              pattern="^[a-zA-Z\s]+$"
              required
            />
             <InputField
              label="เบอร์โทร"
              name="phone_num"
              type="tel"
              value={formData.phone_num}
              onChange={handleInputChange}
              disabled={isReadOnly}
              placeholder="08XXXXXXXX"
              pattern="^[0-9]{10}$"
              inputMode="numeric"
              required
            />
            <InputField
              label="อีเมลส่วนตัว"
              name="user_email"
              type="email"
              value={formData.user_email}
              onChange={handleInputChange}
              disabled={isReadOnly}
              placeholder="example@email.com"
              required
            />
          </div>
        </section>

        {/* Billing Info */}
        <section>
          <div className="flex items-center justify-between mb-6 px-1 mt-4">
            <div className="flex items-center gap-3 flex-grow">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">
                ข้อมูลใบกำกับภาษี
              </h3>
              <div className="flex-grow h-px bg-slate-200 hidden sm:block"></div>
            </div>
            {billingTemplate && !isReadOnly && billingTemplate.id !== student.id && (
              <button
                type="button"
                onClick={handleCopyBilling}
                className="text-xs flex items-center gap-1.5 text-blue-500 hover:text-blue-600 bg-white px-3 py-1.5 rounded-lg transition-all duration-200 font-bold border border-slate-100 hover:border-blue-100 shadow-sm ml-4"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
                ดึงข้อมูลเดิม
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 px-1">
            <InputField
              label="ชื่อบุคคล/ ชื่อนิติบุคคล (ผู้เสียภาษี)"
              name="company_name"
              value={billingData.company_name}
              onChange={handleBillingChange}
              disabled={isReadOnly}
              placeholder="ชื่อบุคคล หรือ ชื่อนิติบุคคล"
              required
            />
            <InputField
              label="เลขทะเบียนผู้เสียภาษี"
              name="tax_id"
              value={billingData.tax_id}
              onChange={handleBillingChange}
              disabled={isReadOnly}
              placeholder="เลข 13 หลัก"
              pattern="^[0-9]{13}$"
              inputMode="numeric"
              required
            />
            <InputField
              label="อีเมล์สำหรับเอกสารทางบัญชี"
              description="email สำหรับส่ง e-tax"
              name="bill_email"
              type="email"
              value={billingData.bill_email}
              onChange={handleBillingChange}
              disabled={isReadOnly}
              placeholder="account@company.com"
              required
            />

            <div className="md:col-span-2">
              <div className="flex flex-col ml-1 mb-2">
                <label className="text-[13px] font-bold text-slate-600 uppercase tracking-wide px-0.5">
                  ที่อยู่ใบกำกับภาษี {!isReadOnly && <span className="text-red-500">*</span>}
                </label>
              </div>
              <textarea
                name="tax_addres"
                value={billingData.tax_addres}
                onChange={handleBillingChange}
                disabled={isReadOnly}
                required
                rows={3}
                placeholder="ที่อยู่สำหรับออกใบกำกับภาษี..."
                className={`
                  w-full border rounded-xl p-3 text-base text-slate-800 placeholder-slate-400
                  focus:ring-2 focus:ring-blue-50/50 focus:border-blue-200 transition-all outline-none resize-none
                  ${isReadOnly
                    ? 'bg-slate-50/50 border-slate-100 text-slate-500 cursor-not-allowed'
                    : !billingData.tax_addres
                      ? ' border-red-200 placeholder-gray-400'
                      : 'bg-white border-slate-300 hover:border-slate-400 shadow-sm'
                  }
                `}
              />
            </div>
          </div>
        </section>

        {/* Additional Info */}
        <section>
          <div className="grid grid-cols-1 gap-4 mt-6">
            <div>
              <div className="flex flex-col ml-1 mb-2">
                <label className="text-[13px] font-bold text-slate-600 uppercase tracking-wide px-0.5">Notes</label>
              </div>
              <textarea
                name="remark"
                value={formData.remark}
                onChange={handleInputChange}
                disabled={isReadOnly}
                rows={2}
                placeholder="ระบุเพิ่มเติม..."
                className={`
                  w-full border rounded-xl p-3 text-base text-slate-800 placeholder-slate-400
                  focus:ring-2 focus:ring-blue-50/50 focus:border-blue-200 transition-all outline-none resize-none
                  ${isReadOnly
                    ? 'bg-slate-50/50 border-slate-100 text-slate-500 cursor-not-allowed'
                    : !formData.remark
                      ? ' border-slate-300 placeholder-gray-400'
                      : 'bg-white border-slate-300 hover:border-slate-400 shadow-sm'
                  }
                `}
              />
            </div>
          </div>
        </section>

        <div className="pt-0 space-y-3">
          {state.message && (
            <div className={`p-4 rounded-xl border text-sm text-center font-medium transition-all duration-500 animate-in fade-in slide-in-from-top-2 ${state.success ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : ' border-red-100 text-red-700'}`}>
              <div className="flex items-center justify-center gap-2">
                {state.success && (
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {state.success ? 'บันทึกข้อมูลสำเร็จแล้ว' : state.message}
              </div>
            </div>
          )}
          {isReadOnly ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="w-full py-4 px-6 rounded-xl font-extrabold text-sm uppercase tracking-widest shadow-lg transition-all duration-300 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              แก้ไขข้อมูล
            </button>
          ) : (
            <SubmitButton disabled={isReadOnly} />
          )}
        </div>
      </form>
    </div>
  );
}

function InputField({
  label,
  name,
  type = "text",
  defaultValue,
  value,
  onChange,
  disabled,
  placeholder,
  description,
  required,
  pattern,
  inputMode
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  placeholder?: string;
  description?: string;
  required?: boolean;
  pattern?: string;
  inputMode?: "numeric" | "text" | "tel" | "email" | "url" | "search" | "decimal" | "none";
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-col ml-1">
        <label className="text-[13px] font-bold text-slate-600 uppercase tracking-wide px-0.5">
          {label} {required && !disabled && <span className="text-red-500">*</span>}
        </label>
        {description && (
          <span className="text-[11px] font-medium text-slate-500 mt-0.5 leading-tight italic">
            {description}
          </span>
        )}
      </div>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        pattern={pattern}
        inputMode={inputMode}
        placeholder={placeholder}
        className={`
          w-full border rounded-xl p-3 text-base text-slate-800 placeholder-slate-400
          focus:ring-2 focus:ring-blue-50/50 focus:border-blue-200 transition-all outline-none
          ${disabled
            ? 'bg-slate-50/50 border-slate-100 text-slate-500 cursor-not-allowed shadow-none'
            : (!value && !defaultValue)
              ? ' border-red-200 placeholder-gray-400'
              : 'bg-white border-slate-300 hover:border-slate-400 shadow-sm'
          }
        `}
      />
    </div>
  );
}
