'use server';

import { revalidatePath } from 'next/cache';
import { updateStudentInAirtable, updateEmailStatus } from '@/lib/airtable';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function updateStudent(prevState: any, formData: FormData) {
  const recordId = formData.get('recordId') as string;

  if (!recordId) {
    return { success: false, message: 'Missing Record ID' };
  }

  // Extract form data
  const data = {
    nickname: formData.get('nickname') as string,
    user_email: formData.get('user_email') as string,
    company_name: formData.get('company_name') as string,
    taxpayer_name: formData.get('taxpayer_name') as string,
    tax_id: formData.get('tax_id') as string,
    tax_addres: formData.get('tax_addres') as string,
    bill_email: formData.get('bill_email') as string,
    remark: formData.get('remark') as string,
  };

  try {
    await updateStudentInAirtable(recordId, data);
    revalidatePath(`/create/id`);
    return { success: true, message: 'บันทึกข้อมูลสำเร็จ' };
  } catch (error) {
    console.error('Update error:', error);
    return { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' };
  }
}

export async function sendEmailWithAttachment(prevState: any, formData: FormData) {
  const recordId = formData.get('recordId') as string;
  const billEmail = formData.get('bill_email') as string;
  const file = formData.get('attachment') as File;

  // Extract Structured Content
  const subject = formData.get('email_subject') as string || 'ใบเสร็จรับเงิน/ใบกำกับภาษี';
  const header = formData.get('email_header') as string;
  const recipient = formData.get('email_recipient') as string;
  const boldText = formData.get('email_bold_text') as string;
  const detail = formData.get('email_detail') as string;
  const footer = formData.get('email_footer') as string;

  if (!recordId || !billEmail) {
    return { success: false, message: 'ข้อมูลไม่ครบถ้วน (Record ID หรือ Email)' };
  }

  // Extract other fields for update first
  const data = {
    full_name: formData.get('full_name') as string,
    name_class: formData.get('name_class') as string,
    company_name: formData.get('company_name') as string,
    tax_id: formData.get('tax_id') as string,
    tax_addres: formData.get('tax_addres') as string,
    bill_email: billEmail,
  };

  try {
    // 1. Update Student Data First
    await updateStudentInAirtable(recordId, data);

    // 2. Prepare Attachment
    let attachments = [];
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      attachments.push({
        filename: file.name,
        content: Buffer.from(arrayBuffer),
      });
    }

    // 3. Send Email via Gmail (Nodemailer)
    console.log(`[Gmail] Sending email to: ${billEmail}`);

    // Format detail lines
    const formattedDetail = detail ? detail.replace(/\n/g, '<br/>') : '';

    await transporter.sendMail({
      from: `"Limitless Club" <${process.env.GMAIL_USER}>`,
      to: billEmail,
      subject: subject,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
          
          ${header ? `<h1 style="color: #4f46e5; margin-bottom: 20px; font-size: 24px; text-align: center;">${header}</h1>` : ''}
          
          <div style="margin-bottom: 20px;">
            <p style="font-size: 16px; margin-bottom: 10px;">เรียน ${recipient || 'ลูกค้าผู้มีอุปการคุณ'},</p>
            
            ${boldText ? `<p style="font-weight: bold; font-size: 18px; color: #111; margin: 15px 0;">${boldText}</p>` : ''}
            
            <div style="color: #555; margin-bottom: 20px;">
              ${formattedDetail}
            </div>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <div style="text-align: center; color: #888; font-size: 14px;">
            <p style="font-weight: bold; color: #4f46e5; margin-bottom: 5px;">${footer || 'Limitless Club Team'}</p>
           <p style="font-size: 12px;">-</p>
          </div>
        </div>
      `,
      attachments: attachments
    });

    console.log('[Gmail Success] Email sent');

    // 4. Update Email Status in Airtable
    await updateEmailStatus(recordId, 'success');

    revalidatePath(`/send-email/${recordId}`);
    revalidatePath(`/`);

    return { success: true, message: 'ส่งอีเมลสำเร็จเรียบร้อย' };
  } catch (error) {
    console.error('Send Email Error:', error);

    // Try to update status to fail
    try {
      await updateEmailStatus(recordId, 'fail');
    } catch (innerError) {
      console.error('Failed to update error status:', innerError);
    }

    return { success: false, message: 'เกิดข้อผิดพลาดในการส่งอีเมล (โปรดตรวจสอบ App Password)' };
  }
}
