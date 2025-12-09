import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Initialize Airtable with timeout configuration
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
  requestTimeout: 30000, // 30 seconds timeout
}).base(process.env.AIRTABLE_BASE_ID || '');

// All available rooms
const ALL_ROOMS = [
  { id: 'room1', name: 'ห้องที่ 1' },
  { id: 'room2', name: 'ห้องที่ 2' },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const timeSlot = searchParams.get('timeSlot');

    // Validate required parameters
    if (!date || !timeSlot) {
      return NextResponse.json(
        { 
          error: 'กรุณาระบุวันที่และช่วงเวลา',
          details: 'ต้องระบุ date และ timeSlot'
        },
        { status: 400 }
      );
    }

    // Query Airtable for existing bookings on the same date and time slot
    let bookedRoomIds: string[] = [];
    
    try {
      // Format date to match Airtable format (YYYY-MM-DD)
      const dateValue = date.includes('T') ? date.split('T')[0] : date;
      
      console.log(`Checking availability for date: ${dateValue}, timeSlot: ${timeSlot}`);
      
      // Retry logic for network issues
      let records;
      let retries = 3;
      let lastError;
      
      while (retries > 0) {
        try {
          // Query bookings that match the date and time slot
          // For Date field: If it's Date type, Airtable stores as YYYY-MM-DD internally
          // We'll try to match by converting Date field to string
          // Also try direct comparison for Text type fields
          const dateFormats = [
            `DATESTR({Date}) = "${dateValue}"`, // For Date type field - converts to YYYY-MM-DD string
            `STRING({Date}) = "${dateValue}"`, // Alternative for Date type
            `{Date} = "${dateValue}"`, // For Text type field (YYYY-MM-DD)
            `{Date} = "${dateValue.replace(/-/g, '/')}"`, // For Text type field (YYYY/MM/DD)
          ];
          
          // Try each format until one works
          let querySuccess = false;
          let lastFormatError: any = null;
          
          for (const dateFormat of dateFormats) {
            try {
              const formula = `AND(
                ${dateFormat},
                {Time Slot} = "${timeSlot}",
                OR({Status} = "Pending", {Status} = "Confirmed")
              )`;
              
              console.log(`Trying filter formula: ${formula}`);
              
              records = await base(process.env.AIRTABLE_TABLE_NAME || 'Bookings')
                .select({
                  filterByFormula: formula,
                })
                .all();
              
              querySuccess = true;
              console.log(`Query successful! Found ${records.length} records with format: ${dateFormat}`);
              break;
            } catch (formatError: any) {
              lastFormatError = formatError;
              console.log(`Format failed: ${dateFormat}, error: ${formatError.message}`);
              // Try next format
              continue;
            }
          }
          
          if (!querySuccess) {
            // If all formats fail, try querying all records and filter in code
            console.log('All date format attempts failed, trying to query all records and filter in code...');
            const allRecords = await base(process.env.AIRTABLE_TABLE_NAME || 'Bookings')
              .select({
                filterByFormula: `AND(
                  {Time Slot} = "${timeSlot}",
                  OR({Status} = "Pending", {Status} = "Confirmed")
                )`,
              })
              .all();
            
            // Filter by date in code
            records = allRecords.filter(record => {
              const recordDate = record.get('Date');
              if (!recordDate) return false;
              
              // Handle different date formats
              let recordDateStr: string;
              if (typeof recordDate === 'string') {
                recordDateStr = recordDate;
              } else if (recordDate instanceof Date) {
                recordDateStr = recordDate.toISOString().split('T')[0];
              } else {
                // Try to convert to string
                try {
                  recordDateStr = new Date(String(recordDate)).toISOString().split('T')[0];
                } catch {
                  return false;
                }
              }
              
              const normalizedRecordDate = recordDateStr.replace(/\//g, '-');
              const normalizedQueryDate = dateValue;
              
              return normalizedRecordDate === normalizedQueryDate;
            });
            
            console.log(`Filtered ${records.length} records by date in code`);
          }
          
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

      // Extract booked room IDs
      bookedRoomIds = records
        .map(record => {
          const roomId = record.get('Room ID') as string;
          const recordDate = record.get('Date');
          const recordTimeSlot = record.get('Time Slot');
          const recordStatus = record.get('Status');
          console.log(`Found booking: Room ID=${roomId}, Date=${recordDate}, Time Slot=${recordTimeSlot}, Status=${recordStatus}`);
          return roomId;
        })
        .filter((roomId): roomId is string => Boolean(roomId));
      
      console.log(`Found ${bookedRoomIds.length} booked rooms for ${dateValue} at ${timeSlot}:`, bookedRoomIds);
    } catch (error: any) {
      console.error('Error querying Airtable:', error);
      // If query fails, return empty array (no rooms available) for safety
      // This prevents double booking
      bookedRoomIds = [];
    }

    // Calculate available rooms (all rooms - booked rooms)
    const availableRooms = ALL_ROOMS
      .filter(room => !bookedRoomIds.includes(room.id))
      .map(room => room.id);

    return NextResponse.json(
      { 
        availableRooms,
        allRooms: ALL_ROOMS,
        bookedRooms: bookedRoomIds,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error checking availability:', error);
    
    return NextResponse.json(
      { 
        error: 'ไม่สามารถตรวจสอบความพร้อมของห้องได้',
        details: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
      },
      { status: 500 }
    );
  }
}

