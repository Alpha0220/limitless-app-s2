'use server';

import { revalidatePath } from 'next/cache';
import { updateStudentInAirtable, updateEmailStatus, updateDocumentField, updateRegistrationReceiptByUuid, updateRegistrationPayerByUuid, base, TABLE_NAME, REGISTRATION_TABLE_NAME } from '@/lib/airtable';
import { login, logout } from '@/lib/auth';
import { redirect } from 'next/navigation';
import nodemailer from 'nodemailer';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (Hardcoded as requested for immediate task, ideally move to env)
cloudinary.config({ 
  cloud_name: 'dl9wvlkkk', 
  api_key: '112138484749645', 
  api_secret: 'xFnFZsCjNp3xh8x6o1r02zpr-so' 
});

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
  const full_name = formData.get('full_name') as string;
  const full_name_certificate = formData.get('full_name_certificate') as string;
  const nickname = formData.get('nickname') as string;
  const user_email = formData.get('user_email') as string;
  const company_name = formData.get('company_name') as string;
  const tax_id = formData.get('tax_id') as string;
  const tax_addres = formData.get('tax_addres') as string;
  const bill_email = formData.get('bill_email') as string;
  const phone_num = formData.get('phone_num') as string;
  const remark = formData.get('remark') as string;

  // Validation
  if (!full_name || !full_name_certificate || !nickname || !user_email || !company_name || !tax_id || !tax_addres || !bill_email || !phone_num) {
    return { success: false, message: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' };
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(user_email) || !emailRegex.test(bill_email)) {
    return { success: false, message: 'รูปแบบอีเมลไม่ถูกต้อง' };
  }

  // Phone validation (10 digits)
  if (!/^[0-9]{10}$/.test(phone_num)) {
    return { success: false, message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก' };
  }

  // Tax ID validation (13 digits)
  if (!/^[0-9]{13}$/.test(tax_id)) {
    return { success: false, message: 'เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก' };
  }

  // English name validation
  if (!/^[a-zA-Z\s]+$/.test(full_name_certificate)) {
    return { success: false, message: 'ชื่อ-นามสกุล (English) ต้องเป็นภาษาอังกฤษเท่านั้น' };
  }

  const data = {
    full_name,
    full_name_certificate,
    nickname,
    user_email,
    company_name,
    tax_id,
    tax_addres,
    bill_email,
    phone_num,
    remark,
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

    // 2. Prepare Attachment and Upload to Cloudinary
    let attachments = [];
    let fileUrl = '';

    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Determine file type and Cloudinary resource_type
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension || '');
      const isPDF = fileExtension === 'pdf';
      
      // Set appropriate resource_type for Cloudinary
      // PDFs should use 'raw', images use 'image', others use 'auto'
      const resourceType = isPDF ? 'raw' : (isImage ? 'image' : 'auto');
      
      console.log(`[File Upload] File: ${file.name}, Type: ${file.type}, Extension: ${fileExtension}, Resource Type: ${resourceType}, Size: ${file.size} bytes`);

      // Upload to Cloudinary
      try {
        const cloudinaryResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { 
              folder: 'documents',
              resource_type: resourceType,
              // For PDFs, ensure proper handling
              ...(isPDF && { 
                format: 'pdf',
                use_filename: true,
                unique_filename: false
              })
            },
            (error: any, result: any) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        }) as any;

        if (cloudinaryResult?.secure_url) {
          fileUrl = cloudinaryResult.secure_url;
          console.log(`[Cloudinary] Upload successful: ${fileUrl}`);
          console.log(`[Cloudinary] Resource type: ${cloudinaryResult.resource_type}, Format: ${cloudinaryResult.format}`);
          
          // Update Airtable document field using dedicated function with retry logic
          try {
            console.log(`[Airtable] Updating Document field for ${file.name} (${fileExtension})`);
            const updateResult = await updateDocumentField(recordId, fileUrl, file.name);
            
            // Verify the update was successful
            if (updateResult?.success && updateResult?.record) {
              const documentField = updateResult.record.fields?.Document;
              if (documentField && Array.isArray(documentField) && documentField.length > 0) {
                console.log(`[Airtable] ✓ Document field verified: ${documentField.length} attachment(s) found`);
                console.log(`[Airtable] Attachment ID: ${documentField[0]?.id || 'N/A'}`);
                console.log(`[Airtable] Attachment URL: ${documentField[0]?.url || 'N/A'}`);
              } else {
                console.warn(`[Airtable] ⚠ Document field exists but appears empty in response`);
              }
            }
            
            console.log(`[Airtable] Document field updated successfully for ${file.name}`);
          } catch (documentError: any) {
            console.error('[Airtable] Error updating Document field:', documentError);
            // Log detailed error information
            if (documentError?.error) {
              console.error('[Airtable] Error details:', JSON.stringify(documentError.error, null, 2));
            }
            if (documentError?.message) {
              console.error('[Airtable] Error message:', documentError.message);
            }
            // Don't throw - allow email to be sent even if document update fails
          }
        } else {
          console.warn('[Cloudinary] Upload completed but no secure_url returned');
        }
      } catch (uploadError: any) {
        console.error('[Cloudinary] Upload Error:', uploadError);
        console.error('[Cloudinary] Error details:', uploadError?.message || uploadError);
        // Continue even if upload fails - email attachment uses Buffer so it should still work
      }

      attachments.push({
        filename: file.name,
        content: buffer,
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

export async function updateSaleName(recordIds: string[], saleName: string) {
  try {
    const promises = recordIds.map(id => 
      base(TABLE_NAME).update(id, { name_sale: saleName })
    );
    await Promise.all(promises);
    revalidatePath('/create/id');
    return { success: true };
  } catch (error) {
    console.error('Update sale name error:', error);
    return { success: false, message: 'Failed to update sale name' };
  }
}
export async function uploadSlips(formData: FormData) {
  const uuid = formData.get('uuid') as string;
  const files = formData.getAll('slips') as File[];

  if (!uuid || files.length === 0) {
    return { success: false, message: 'กรุณาเลือกรูปภาพสลิป' };
  }

  try {
    const uploadPromises = files.filter(f => f.size > 0).map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      return new Promise<string>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { 
            folder: 'slips',
            resource_type: 'auto'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result?.secure_url || '');
          }
        ).end(buffer);
      });
    });

    const urls = await Promise.all(uploadPromises);
    const validUrls = urls.filter(Boolean);

    if (validUrls.length === 0) {
      return { success: false, message: 'ไม่สามารถอัปโหลดรูปภาพได้' };
    }

    const attachmentData = validUrls.map((url, index) => ({ 
      url,
      filename: `slip_${Date.now()}_${index}.jpg` 
    }));

    // Update the record in Registration table by uuid
    await updateRegistrationReceiptByUuid(uuid, attachmentData);
    
    revalidatePath('/create/id');
    
    return { success: true, message: 'อัปโหลดสลิปเรียบร้อยแล้ว' };
  } catch (error) {
    console.error('Upload slips error:', error);
    return { success: false, message: 'เกิดข้อผิดพลาดในการอัปโหลด หรือไม่พบข้อมูลการลงทะเบียน (UUID)' };
  }
}

export async function updatePayerName(uuid: string, payerName: string) {
  try {
    await updateRegistrationPayerByUuid(uuid, payerName);
    revalidatePath('/create/id');
    return { success: true };
  } catch (error) {
    console.error('Update payer name error:', error);
    return { success: false, message: 'Failed to update payer name' };
  }
}
export async function handleLogin(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const callbackUrl = formData.get('callbackUrl') as string || '/';

  const success = await login(username, password);

  if (success) {
    redirect(callbackUrl);
  } else {
    return { success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
  }
}

export async function handleLogout() {
  await logout();
  revalidatePath('/');
  redirect('/login');
}
