'use server';

import { updateStudentInAirtable } from '@/lib/airtable';
import { revalidatePath } from 'next/cache';

export async function updateStudent(prevState: any, formData: FormData) {
  const recordId = formData.get('recordId') as string;

  if (!recordId) {
    return { success: false, message: 'Record ID is missing' };
  }

  // Extract fields from FormData
  // Note: We only map fields that are editable/required
  const data = {
    nickname: formData.get('nickname') as string | undefined,
    company_name: formData.get('company_name') as string | undefined,
    taxpayer_name: formData.get('taxpayer_name') as string | undefined,
    tax_id: formData.get('tax_id') as string | undefined,
    tax_addres: formData.get('tax_addres') as string | undefined, // Note: typo 'addres' preserved from prompt
    bill_email: formData.get('bill_email') as string | undefined,
    user_email: formData.get('user_email') as string | undefined,
    remark: formData.get('remark') as string | undefined,
  };

  try {
    await updateStudentInAirtable(recordId, data);
    revalidatePath('/create/id');
    return { success: true, message: 'บันทึกข้อมูลสำเร็จ' };
  } catch (error) {
    console.error('Failed to update student:', error);
    return { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' };
  }
}
