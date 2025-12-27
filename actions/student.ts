'use server';

import { revalidatePath } from 'next/cache';
import { updateStudentInAirtable, base, TABLE_NAME, TEMPLATE_EMAIL_TABLE_NAME } from '@/lib/airtable';
import { transporter } from './config';

/**
 * Filter and find a matching active template email
 * Fetches active templates and filters in JS for maximum reliability with lookup/array fields
 */
async function findTemplateEmail(nameClass: string, date: string) {
  try {
    // Standardize input date to YYYY-MM-DD
    const inputDate = date.includes('T') ? date.split('T')[0] : date.replace(/\//g, '-');
    
    console.log(`[Template Email] Searching for Class: "${nameClass}", Date: "${inputDate}"`);

    // Fetch all active templates and filter in JS to avoid formula issues with lookup/array fields
    const records = await base(TEMPLATE_EMAIL_TABLE_NAME).select({
      filterByFormula: '{Is Active} = 1'
    }).all();

    const matchingRecord = records.find(record => {
      const fieldData = record.fields;
      
      // 1. Match Class Name (handle string or array)
      const cn = fieldData.class_name;
      const classMatches = Array.isArray(cn) 
        ? cn.some(c => String(c).trim() === nameClass.trim())
        : String(cn || '').trim() === nameClass.trim();

      if (!classMatches) return false;

      // 2. Match Date (handle string, array, or Date object)
      const d = fieldData.Date;
      const dateMatches = (val: any) => {
        if (!val) return false;
        const recordDateStr = String(val).includes('T') ? String(val).split('T')[0] : String(val).replace(/\//g, '-');
        return recordDateStr === inputDate;
      };

      const hasDateMatch = Array.isArray(d) ? d.some(dateMatches) : dateMatches(d);

      return hasDateMatch;
    });

    if (matchingRecord) {
      console.log(`[Template Email] Found matching template: ${matchingRecord.id}`);
      return {
        template: matchingRecord.fields.Template as string,
        youtubeLink: matchingRecord.fields['Link Youtube'] as string,
      };
    }
    
    console.log(`[Template Email] No matching template found in ${records.length} active records`);
    return null;
  } catch (error) {
    console.error('Error finding template email:', error);
    return null;
  }
}

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
  const name_class = formData.get('name_class') as string;
  const date = formData.get('date') as string;
  const uuid = formData.get('uuid') as string;

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

    // --- SEND TEMPLATE EMAIL LOGIC ---
    if (name_class && date) {
      const templateData = await findTemplateEmail(name_class, date);
      
      if (templateData && user_email) {
        // Format variables for replacement
        const dateObj = new Date(date);
        // Format date to Thai format full Ex. 17 ธันวาคม 2568
        const fullThDate = dateObj.toLocaleDateString('th-TH', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }); 
        const thDate = dateObj.toLocaleDateString('th-TH', {
          day: 'numeric',
          month: 'short',
          year: '2-digit'
        });
        const shortUuid = uuid ? uuid.split('-')[0].toUpperCase() : '-';

        // Dynamic replacement logic for variables
        let emailContent = templateData.template || '';
        emailContent = emailContent.replace(/\{\{full_name\}\}/g, full_name || '');
        emailContent = emailContent.replace(/\{\{full_th_date\}\}/g, fullThDate);
        emailContent = emailContent.replace(/\{\{date\}\}/g, thDate);
        emailContent = emailContent.replace(/\{\{uuid\}\}/g, shortUuid);

        console.log(`[Template Email] Found template for ${name_class} on ${date}. Sending to ${user_email}`);
        console.log(`[Template Email] Variables substituted - Name: ${full_name}, Date: ${thDate}, UUID: ${shortUuid}`);
        
        try {
          await transporter.sendMail({
            from: `"Limitless Club" <${process.env.GMAIL_USER}>`,
            to: user_email,
            subject: `ยืนยันข้อมูลและเริ่มเรียนคลาส ${name_class}`,
            html: `
              <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0e0e0e; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px;">
                
                <div style="margin-bottom: 1px; padding-bottom: 15px; border-bottom: 1px dashed #e2e8f0;">
                  <p style="margin: 0 0 8px 0; font-size: 16px;">สวัสดีค่ะ คุณ <strong>${full_name || ''}</strong></p>
                  <p style="margin: 0 0 8px 0; font-size: 16px;">ขอบคุณที่สมัครเรียน คลาส <strong>${name_class}</strong> รอบวันที่ <strong>${thDate}</strong></p>
                  <p style="margin: 0; color: #0e0e0e; font-weight: bold; font-size: 16px;">PAYMENT CODE ของกลุ่มคุณคือ : ${shortUuid}</p>
                </div>

                <div style="white-space: pre-wrap; margin-bottom: 5px;">
                <p style="margin: 0; color: #0e0e0e; font-weight: bold; font-size: 16px;">ยืนยัน คลาส ${name_class} วันที่ ${fullThDate}</p>
                  <p style="margin: 0; color: #0e0e0e; font-weight: normal; font-size: 14px;">${emailContent}
                </div>
                ${templateData.youtubeLink ? `
                  <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <p style="margin-top: 0; font-weight: bold; color: #1e293b;">ช่องทางการรับชม YouTube:</p>
                    <a href="${templateData.youtubeLink}" style="color: #2563eb; text-decoration: underline;">${templateData.youtubeLink}</a>
                  </div>
                ` : ''}
              </div>
            `
          });
          console.log('[Template Email] Email sent successfully');
        } catch (mailError) {
          console.error('[Template Email] Failed to send email:', mailError);
          // Don't fail the whole action if email fails
        }
      } else {
        console.log(`[Template Email] No matching active template found for ${name_class} on ${date}`);
      }
    }

    revalidatePath(`/create/id`);
    return { success: true, message: 'บันทึกข้อมูลสำเร็จ' };
  } catch (error) {
    console.error('Update error:', error);
    return { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' };
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
