'use server';

import { revalidatePath } from 'next/cache';
import { updateRegistrationReceiptByUuid, updateRegistrationPayerByUuid } from '@/lib/airtable';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: 'dl9wvlkkk', 
  api_key: '112138484749645', 
  api_secret: 'xFnFZsCjNp3xh8x6o1r02zpr-so' 
});

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
