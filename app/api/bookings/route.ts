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
    const { firstName, lastName, date, timeSlot, startTime, endTime, roomId, roomName, receiptUrl, receiptFileName } = body;

    // Validate required fields
    if (!firstName || !lastName || !timeSlot || !roomId || !date) {
      return NextResponse.json(
        { 
          error: 'กรุณากรอกข้อมูลให้ครบถ้วน',
          details: 'กรุณากรอกชื่อ นามสกุล เลือกวันที่ และเลือกช่วงเวลาและห้อง'
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
      'Created At': new Date().toISOString(), // วันที่ทำรายการ (วันที่สร้าง record)
    };

    // Add booking date (วันที่จองที่ผู้ใช้เลือก) - Airtable Date field expects YYYY-MM-DD format
    if (date) {
      // Ensure date is in YYYY-MM-DD format
      const dateValue = date.includes('T') ? date.split('T')[0] : date;
      fields['Date'] = dateValue; // วันที่จอง (วันที่ที่ผู้ใช้เลือกจาก calendar)
    }

    // Add start and end times if provided
    // Note: These fields are optional - only add if they exist in Airtable
    // If you get UNKNOWN_FIELD_NAME error, remove these fields from Airtable or add them to your table
    // For now, we'll skip these fields to avoid errors
    // if (startTime) {
    //   fields['Start Time'] = startTime;
    // }
    // if (endTime) {
    //   fields['End Time'] = endTime;
    // }

    // Add Status - make sure "Pending" option exists in Airtable Status field
    // If you get INVALID_MULTIPLE_CHOICE_OPTIONS error, add "Pending" option in Airtable
    // Go to Airtable → Bookings table → Status field → Add option "Pending"
    fields['Status'] = 'Pending';

    // Add receipt attachment if URL is provided (from Imgur or other storage service)
    if (receiptUrl && receiptFileName) {
      try {
        // Ensure URL is absolute (starts with http:// or https://)
        const absoluteUrl = receiptUrl.startsWith('http://') || receiptUrl.startsWith('https://') 
          ? receiptUrl 
          : `https://${receiptUrl}`;
        
        fields['Receipt'] = [
          {
            url: absoluteUrl,
            filename: receiptFileName,
          },
        ];
        console.log('Adding receipt attachment to Airtable:', absoluteUrl);
      } catch (receiptError) {
        console.error('Error adding receipt attachment:', receiptError);
        // Continue without receipt if attachment fails
      }
    } else {
      console.log('No receipt URL provided - skipping receipt attachment');
    }

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
    
    if (error?.error === 'INVALID_ATTACHMENT_OBJECT') {
      return NextResponse.json(
        { 
          error: 'ไม่สามารถอัปโหลดไฟล์ได้',
          details: 'Airtable ไม่รองรับ data URL สำหรับ attachment กรุณาอัปโหลดไฟล์ไปยัง storage service ก่อน'
        },
        { status: 422 }
      );
    }
    
    if (error?.error === 'INVALID_MULTIPLE_CHOICE_OPTIONS' || error?.message?.includes('select option')) {
      return NextResponse.json(
        { 
          error: 'Field Status ไม่มี option "Pending"',
          details: 'กรุณาไปที่ Airtable → Table "Bookings" → Field "Status" → เพิ่ม option "Pending" (ดู STATUS_FIELD_FIX.md)'
        },
        { status: 422 }
      );
    }
    
    if (error?.error === 'INVALID_VALUE_FOR_COLUMN' && (error?.message?.includes('Receipt') || error?.message?.includes('attachment'))) {
      return NextResponse.json(
        { 
          error: 'ไม่สามารถบันทึกรูปใบเสร็จได้',
          details: 'Airtable ไม่สามารถรับ URL จาก Imgur ได้ กรุณาตรวจสอบว่า Field "Receipt" เป็น Type "Attachment" และ URL ถูกต้อง (ดู RECEIPT_TROUBLESHOOTING.md)'
        },
        { status: 422 }
      );
    }
    
    if (error?.error === 'INVALID_VALUE_FOR_COLUMN' && (error?.message?.includes('Date') || error?.message?.toLowerCase().includes('date'))) {
      return NextResponse.json(
        { 
          error: 'ไม่สามารถบันทึกวันที่ได้',
          details: 'กรุณาตรวจสอบว่า Field "Date" มีอยู่ใน Airtable และเป็น Type "Date" หรือ "Single line text" (ถ้าเป็น Date field ต้องเป็น format YYYY-MM-DD)'
        },
        { status: 422 }
      );
    }
    
    if (error?.error === 'UNKNOWN_FIELD_NAME') {
      const fieldName = error?.message?.match(/Unknown field name: "([^"]+)"/)?.[1] || 'unknown';
      return NextResponse.json(
        { 
          error: `Field "${fieldName}" ไม่มีใน Airtable`,
          details: `กรุณาตรวจสอบว่า Field "${fieldName}" มีอยู่ใน Airtable Table "Bookings" หรือลบ field นี้จากการส่งข้อมูล`
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

