'use client';

import { useFormStatus, useFormState } from 'react-dom';
import { updateStudent } from '@/app/actions';
import { useEffect, useState } from 'react';

// Submit button component for pending state
function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className={`
        w-full py-3 px-6 rounded-lg font-bold text-white shadow-sm transition-all duration-300
        ${disabled
          ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-blue-200'
        }
      `}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          กำลังบันทึก...
        </span>
      ) : disabled ? (
        'ข้อมูลถูกบันทึกแล้ว'
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

const initialState = {
  success: false,
  message: '',
};

export default function StudentUpdateForm({ student, billingTemplate }: { student: StudentData, billingTemplate?: StudentData }) {
  const [state, formAction] = useFormState(updateStudent, initialState);
  const isReadOnly = student.fields.is_update === true || state.success;

  // State for billing fields to allow auto-fill
  const [billingData, setBillingData] = useState({
    company_name: student.fields.company_name || '',
    taxpayer_name: student.fields.taxpayer_name || '',
    tax_id: student.fields.tax_id || '',
    bill_email: student.fields.bill_email || '',
    tax_addres: student.fields.tax_addres || '',
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

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBillingData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white p-6">

      {/* Compact Info Header */}
      <div className="bg-slate-50 rounded-lg p-3 mb-5 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        <div>
          <div className="text-xs text-slate-500 mb-0.5">ชื่อ-นามสกุล</div>
          <div className="font-medium text-slate-900">{student.fields.full_name || '-'}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-0.5">รหัสคลาส</div>
          <div className="font-medium text-slate-900">{student.fields.name_class || '-'}</div>
        </div>
        <div className="col-span-2 md:col-span-1">
          <div className="text-xs text-slate-500 mb-0.5">Reference ID</div>
          <div className="font-mono text-xs text-slate-600">{student.fields.uuid || '-'}</div>
        </div>
      </div>



      <form action={formAction} className="space-y-5">
        <input type="hidden" name="recordId" value={student.id} />

        {/* Personal Info */}
        <section>
          <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-1 border-b border-slate-200">
            ข้อมูลส่วนตัว
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
            <InputField
              label="ชื่อเล่น"
              name="nickname"
              defaultValue={student.fields.nickname}
              disabled={isReadOnly}
              placeholder="ชื่อเล่นของคุณ"
            />
            <InputField
              label="อีเมลส่วนตัว"
              name="user_email"
              type="email"
              defaultValue={student.fields.user_email}
              disabled={isReadOnly}
              placeholder="example@email.com"
            />
          </div>
        </section>

        {/* Billing Info */}
        <section>
          <div className="flex items-center justify-between mb-3 pb-1 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700">
              ข้อมูลใบกำกับภาษี
            </h3>
            {billingTemplate && !isReadOnly && billingTemplate.id !== student.id && (
              <button
                type="button"
                onClick={handleCopyBilling}
                className="text-xs flex items-center gap-1.5 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors font-medium"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
                ใช้ข้อมูลเดิมที่มีในระบบ
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
            <InputField
              label="ชื่อบริษัท"
              name="company_name"
              value={billingData.company_name}
              onChange={handleBillingChange}
              disabled={isReadOnly}
              placeholder="ถ้ามี"
            />
            <InputField
              label="ชื่อผู้เสียภาษี"
              name="taxpayer_name"
              value={billingData.taxpayer_name}
              onChange={handleBillingChange}
              disabled={isReadOnly}
            />
            <InputField
              label="เลขประจำตัวผู้เสียภาษี"
              name="tax_id"
              value={billingData.tax_id}
              onChange={handleBillingChange}
              disabled={isReadOnly}
            />
            <InputField
              label="อีเมลรับบิล"
              name="bill_email"
              type="email"
              value={billingData.bill_email}
              onChange={handleBillingChange}
              disabled={isReadOnly}
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">ที่อยู่ใบกำกับภาษี</label>
              <textarea
                name="tax_addres"
                value={billingData.tax_addres}
                onChange={handleBillingChange}
                disabled={isReadOnly}
                rows={3}
                placeholder="ที่อยู่สำหรับออกใบกำกับภาษี..."
                className={`
                  w-full border rounded-lg p-2.5 text-sm text-slate-900 placeholder-slate-400
                  focus:ring-1 focus:ring-slate-300 focus:border-slate-400 transition-colors outline-none resize-none
                  ${isReadOnly
                    ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                  }
                `}
              />
            </div>
          </div>
        </section>

        {/* Additional Info */}
        <section>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">หมายเหตุ</label>
              <textarea
                name="remark"
                defaultValue={student.fields.remark}
                disabled={isReadOnly}
                rows={2}
                placeholder="ระบุเพิ่มเติม..."
                className={`
                  w-full border rounded-lg p-2.5 text-sm text-slate-900 placeholder-slate-400
                  focus:ring-1 focus:ring-slate-300 focus:border-slate-400 transition-colors outline-none resize-none
                  ${isReadOnly
                    ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                  }
                `}
              />
            </div>
          </div>
        </section>

        <div className="pt-0 space-y-3">
          {state.message && (
            <div className={`p-3 rounded-lg border text-sm text-center font-medium ${state.success ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {state.success ? '✓ บันทึกข้อมูลสำเร็จ' : state.message}
            </div>
          )}
          <SubmitButton disabled={isReadOnly} />
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
  placeholder
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`
          w-full border rounded-lg p-3 text-sm text-slate-900 placeholder-slate-400
          focus:ring-1 focus:ring-slate-300 focus:border-slate-400 transition-colors outline-none
          ${disabled
            ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
            : 'bg-white border-slate-200 hover:border-slate-300'
          }
        `}
      />
    </div>
  );
}
