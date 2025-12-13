'use client';

import { useFormStatus, useFormState } from 'react-dom';
import { updateStudent } from '@/app/actions';
import { useEffect } from 'react';

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

export default function StudentUpdateForm({ student }: { student: StudentData }) {
  const [state, formAction] = useFormState(updateStudent, initialState);
  const isReadOnly = student.fields.is_update === true || state.success;

  return (
    <div className="bg-white p-8">

      {/* Compact Info Header */}
      <div className="bg-slate-50 rounded-lg p-4 mb-6 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-xs text-slate-500 mb-1">ชื่อ-นามสกุล</div>
          <div className="font-medium text-slate-900">{student.fields.full_name || '-'}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">รหัสคลาส</div>
          <div className="font-medium text-slate-900">{student.fields.name_class || '-'}</div>
        </div>
        <div className="col-span-2 md:col-span-1">
          <div className="text-xs text-slate-500 mb-1">Reference ID</div>
          <div className="font-mono text-xs text-slate-600">{student.fields.uuid || '-'}</div>
        </div>
      </div>

      {state.message && (
        <div className={`mb-6 p-4 rounded-lg border text-sm ${state.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <div className="font-medium mb-1">{state.success ? '✓ สำเร็จ' : '✕ เกิดข้อผิดพลาด'}</div>
          <div>{state.message}</div>
        </div>
      )}

      <form action={formAction} className="space-y-8">
        <input type="hidden" name="recordId" value={student.id} />

        {/* Personal Info */}
        <section>
          <h3 className="text-sm font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-200">
            ข้อมูลส่วนตัว
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <h3 className="text-sm font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-200">
            ข้อมูลใบกำกับภาษี
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="ชื่อบริษัท"
              name="company_name"
              defaultValue={student.fields.company_name}
              disabled={isReadOnly}
              placeholder="ถ้ามี"
            />
            <InputField
              label="ชื่อผู้เสียภาษี"
              name="taxpayer_name"
              defaultValue={student.fields.taxpayer_name}
              disabled={isReadOnly}
            />
            <InputField
              label="เลขประจำตัวผู้เสียภาษี"
              name="tax_id"
              defaultValue={student.fields.tax_id}
              disabled={isReadOnly}
            />
            <InputField
              label="อีเมลรับบิล"
              name="bill_email"
              type="email"
              defaultValue={student.fields.bill_email}
              disabled={isReadOnly}
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">ที่อยู่ใบกำกับภาษี</label>
              <textarea
                name="tax_addres"
                defaultValue={student.fields.tax_addres}
                disabled={isReadOnly}
                rows={3}
                placeholder="ที่อยู่สำหรับออกใบกำกับภาษี..."
                className={`
                  w-full border rounded-lg p-3 text-sm text-slate-900 placeholder-slate-400
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
              <label className="block text-sm font-medium text-slate-700 mb-2">หมายเหตุ</label>
              <textarea
                name="remark"
                defaultValue={student.fields.remark}
                disabled={isReadOnly}
                rows={2}
                placeholder="ระบุเพิ่มเติม..."
                className={`
                  w-full border rounded-lg p-3 text-sm text-slate-900 placeholder-slate-400
                  focus:ring-1 focus:ring-slate-300 focus:border-slate-400 transition-colors outline-none resize-none
                  ${isReadOnly
                    ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                  }
                `}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">เอกสารแนบ</label>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-slate-300 transition-colors">
                <div className="text-slate-400 text-sm">
                  <svg className="w-8 h-8 mx-auto mb-2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div>คลิกเพื่ออัปโหลดเอกสาร</div>
                  <div className="text-xs text-slate-400 mt-1">(ระบบกำลังพัฒนา)</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="pt-4">
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
  disabled,
  placeholder
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
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
