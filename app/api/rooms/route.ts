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
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    // If roomId is provided, get specific room
    if (roomId) {
      let records;
      let retries = 3;
      let lastError;
      
      while (retries > 0) {
        try {
          records = await base('Rooms')
            .select({
              filterByFormula: `{Room ID} = "${roomId}"`,
              maxRecords: 1,
            })
            .all();
          break;
        } catch (error: any) {
          lastError = error;
          retries--;
          
          if ((error?.code === 'ETIMEDOUT' || error?.errno === 'ETIMEDOUT') && retries > 0) {
            console.log(`Retry attempt ${3 - retries + 1}/3 after timeout...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          throw error;
        }
      }
      
      if (!records || records.length === 0) {
        return NextResponse.json(
          { 
            error: 'ไม่พบข้อมูลห้อง',
            details: `ไม่พบห้องที่มี Room ID: ${roomId}`
          },
          { status: 404 }
        );
      }

      const room = records[0];
      const roomData = {
        id: room.get('Room ID') as string,
        name: room.get('Room Name') as string,
        pricePerHour: room.get('Price Per Hour') as number || 0,
      };

      return NextResponse.json({ room: roomData }, { status: 200 });
    }

    // If no roomId, get all rooms
    let records;
    let retries = 3;
    let lastError;
    
    while (retries > 0) {
      try {
        records = await base('Rooms')
          .select({
            sort: [{ field: 'Room ID', direction: 'asc' }],
          })
          .all();
        break;
      } catch (error: any) {
        lastError = error;
        retries--;
        
        if ((error?.code === 'ETIMEDOUT' || error?.errno === 'ETIMEDOUT') && retries > 0) {
          console.log(`Retry attempt ${3 - retries + 1}/3 after timeout...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        throw error;
      }
    }
    
    if (!records) {
      throw lastError;
    }

    const rooms = records.map(record => ({
      id: record.get('Room ID') as string,
      name: record.get('Room Name') as string,
      pricePerHour: record.get('Price Per Hour') as number || 0,
    })).filter(room => room.id && room.name);

    return NextResponse.json({ rooms }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching rooms:', error);
    
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
          error: 'ไม่พบ Table "Rooms"',
          details: 'กรุณาตรวจสอบว่า Table "Rooms" มีอยู่ใน Airtable Base นี้'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'ไม่สามารถดึงข้อมูลห้องได้',
        details: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
      },
      { status: 500 }
    );
  }
}

