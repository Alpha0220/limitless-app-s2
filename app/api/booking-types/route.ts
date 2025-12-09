import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Initialize Airtable with timeout configuration
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
  requestTimeout: 30000, // 30 seconds timeout
}).base(process.env.AIRTABLE_BASE_ID || '');

export async function GET(request: NextRequest) {
  try {
    // Query Booking Types from Airtable
    let records;
    let retries = 3;
    let lastError;
    
    while (retries > 0) {
      try {
        records = await base('Booking Types')
          .select({
            sort: [{ field: 'Type Name', direction: 'asc' }],
          })
          .all();
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

    // Extract booking types
    const bookingTypes = records.map(record => ({
      id: record.get('Type ID') as string,
      name: record.get('Type Name') as string,
      additionalPricePerHour: record.get('Additional Price Per Hour') as number || 0,
    })).filter(type => type.id && type.name);

    console.log(`Found ${bookingTypes.length} booking types`);

    return NextResponse.json(
      { 
        bookingTypes,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching booking types:', error);
    
    // Handle specific Airtable errors
    if (error?.error === 'NOT_AUTHORIZED' || error?.statusCode === 403) {
      return NextResponse.json(
        { 
          error: 'ไม่ได้รับอนุญาตให้เข้าถึง Airtable',
          details: 'กรุณาตรวจสอบว่า Personal Access Token มีสิทธิ์เข้าถึง Base นี้'
        },
        { status: 403 }
      );
    }
    
    if (error?.error === 'NOT_FOUND' || error?.message?.includes('does not exist')) {
      return NextResponse.json(
        { 
          error: 'ไม่พบ Table "Booking Types"',
          details: 'กรุณาตรวจสอบว่า Table "Booking Types" มีอยู่ใน Airtable Base นี้'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'ไม่สามารถดึงข้อมูลประเภทการจองได้',
        details: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
      },
      { status: 500 }
    );
  }
}

