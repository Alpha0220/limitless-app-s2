import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

// Initialize Airtable with timeout configuration
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
  requestTimeout: 30000, // 30 seconds timeout
}).base(process.env.AIRTABLE_BASE_ID || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, timeSlot, roomId, roomName, receiptFile, receiptFileName, receiptFileType } = body;

    // Validate required fields
    if (!firstName || !lastName || !timeSlot || !roomId) {
      return NextResponse.json(
        { 
          error: 'กรุณากรอกข้อมูลให้ครบถ้วน',
          details: 'กรุณากรอกชื่อ นามสกุล และเลือกช่วงเวลาและห้อง'
        },
        { status: 400 }
      );
    }

    // Create record in Airtable
    // Note: Airtable doesn't support data URLs for attachments
    // For now, we'll save the record without the receipt attachment
    // In production, upload the file to a storage service (S3, Cloudinary, etc.) first
    // and then use that URL for the attachment
    
    const fields: Record<string, any> = {
      'First Name': firstName,
      'Last Name': lastName,
      'Time Slot': timeSlot,
      'Room ID': roomId,
      'Room Name': roomName,
      'Status': 'Pending',
      'Created At': new Date().toISOString(),
    };

    // Skip receipt attachment for now since Airtable doesn't support data URLs
    // TODO: Implement file upload to storage service (S3, Cloudinary, etc.)
    // Then use the public URL for the attachment
    // if (receiptFile && receiptFileName) {
    //   fields['Receipt'] = [
    //     {
    //       url: publicFileUrl,
    //       filename: receiptFileName,
    //     },
    //   ];
    // }

    // Retry logic for network issues
    let records;
    let retries = 3;
    let lastError;
    
    while (retries > 0) {
      try {
        records = await base(process.env.AIRTABLE_TABLE_NAME || 'Bookings').create([
          { fields },
        ]);
        break; // Success, exit retry loop
      } catch (error: any) {
        lastError = error;
        retries--;
        
        // If it's a timeout error and we have retries left, wait and retry
        if ((error?.code === 'ETIMEDOUT' || error?.errno === 'ETIMEDOUT') && retries > 0) {
          console.log(`Retry attempt ${3 - retries + 1}/3 after timeout...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
          continue;
        }
        
        // If it's not a timeout or no retries left, throw the error
        throw error;
      }
    }
    
    if (!records) {
      throw lastError;
    }

    return NextResponse.json(
      { success: true, recordId: records[0].id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error saving to Airtable:', error);
    
    // Handle specific Airtable errors
    if (error?.error === 'NOT_AUTHORIZED' || error?.statusCode === 403) {
      return NextResponse.json(
        { 
          error: 'ไม่ได้รับอนุญาตให้เข้าถึง Airtable',
          details: 'กรุณาตรวจสอบว่า Personal Access Token มีสิทธิ์เข้าถึง Base นี้ และมี Scopes: data.records:read, data.records:write'
        },
        { status: 403 }
      );
    }
    
    if (error?.error === 'INVALID_ATTACHMENT_OBJECT' || error?.statusCode === 422) {
      return NextResponse.json(
        { 
          error: 'ไม่สามารถอัปโหลดไฟล์ได้',
          details: 'Airtable ไม่รองรับ data URL สำหรับ attachment กรุณาอัปโหลดไฟล์ไปยัง storage service ก่อน'
        },
        { status: 422 }
      );
    }
    
    // Handle network timeout errors
    if (error?.code === 'ETIMEDOUT' || error?.errno === 'ETIMEDOUT') {
      return NextResponse.json(
        { 
          error: 'การเชื่อมต่อ timeout',
          details: 'ไม่สามารถเชื่อมต่อกับ Airtable ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองอีกครั้ง',
          troubleshooting: 'ดูไฟล์ NETWORK_FIX.md สำหรับวิธีแก้ไขปัญหา network timeout'
        },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'ไม่สามารถบันทึกข้อมูลได้',
        details: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
      },
      { status: 500 }
    );
  }
}

