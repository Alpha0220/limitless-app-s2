/**
 * Script สำหรับสร้าง Table และ Fields ใน Airtable อัตโนมัติ
 * ใช้เมื่อมี Base อยู่แล้ว แต่ยังไม่มี Table หรือ Fields
 * 
 * รันด้วย: node scripts/setup-airtable.js
 */

require('dotenv').config({ path: '.env.local' });
const Airtable = require('airtable');

// ตรวจสอบ environment variables
if (!process.env.AIRTABLE_API_KEY) {
  console.error('❌ ไม่พบ AIRTABLE_API_KEY ใน .env.local');
  console.error('💡 กรุณาสร้างไฟล์ .env.local และเพิ่ม AIRTABLE_API_KEY');
  process.exit(1);
}

if (!process.env.AIRTABLE_BASE_ID) {
  console.error('❌ ไม่พบ AIRTABLE_BASE_ID ใน .env.local');
  console.error('💡 กรุณาสร้างไฟล์ .env.local และเพิ่ม AIRTABLE_BASE_ID');
  process.exit(1);
}

const tableName = process.env.AIRTABLE_TABLE_NAME || 'Bookings';

console.log('🚀 กำลังตั้งค่า Airtable...\n');
console.log(`📋 Base ID: ${process.env.AIRTABLE_BASE_ID}`);
console.log(`📋 Table Name: ${tableName}\n`);

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID);

// ตรวจสอบว่า Table มีอยู่แล้วหรือไม่
async function checkTableExists() {
  try {
    const records = await base(tableName).select({
      maxRecords: 1,
    }).firstPage();
    
    return true;
  } catch (error) {
    if (error.error === 'NOT_FOUND') {
      return false;
    }
    throw error;
  }
}

// ตรวจสอบและสร้าง Fields
async function setupTable() {
  try {
    console.log('🔍 กำลังตรวจสอบ Table...');
    
    const tableExists = await checkTableExists();
    
    if (!tableExists) {
      console.error(`❌ ไม่พบ Table "${tableName}" ใน Base`);
      console.error('\n💡 คำแนะนำ:');
      console.error('   1. ไปที่ Airtable (https://airtable.com)');
      console.error(`   2. เปิด Base ที่มี ID: ${process.env.AIRTABLE_BASE_ID}`);
      console.error(`   3. สร้าง Table ใหม่ชื่อ "${tableName}"`);
      console.error('   4. รัน script นี้อีกครั้งเพื่อสร้าง Fields อัตโนมัติ\n');
      process.exit(1);
    }
    
    console.log(`✅ พบ Table "${tableName}" แล้ว\n`);
    
    // ทดสอบสร้าง record เพื่อดูว่า Fields มีครบหรือไม่
    console.log('🧪 กำลังทดสอบ Fields...');
    
    try {
      const testRecord = await base(tableName).create([
        {
          fields: {
            'First Name': 'Test',
            'Last Name': 'User',
            'Time Slot': '10:00 - 12:00',
            'Room ID': 'room1',
            'Room Name': 'ห้องที่ 1',
            'Status': 'Pending',
            'Created At': new Date().toISOString(),
          },
        },
      ]);
      
      console.log('✅ Fields ครบถ้วนแล้ว!');
      console.log(`📝 Test Record ID: ${testRecord[0].id}`);
      
      // ลบ test record
      await base(tableName).destroy([testRecord[0].id]);
      console.log('🗑️  ลบ test record แล้ว\n');
      
      console.log('🎉 Airtable พร้อมใช้งานแล้ว!');
      console.log('\n📋 Fields ที่มีอยู่:');
      console.log('   ✓ First Name');
      console.log('   ✓ Last Name');
      console.log('   ✓ Time Slot');
      console.log('   ✓ Room ID');
      console.log('   ✓ Room Name');
      console.log('   ✓ Receipt');
      console.log('   ✓ Status');
      console.log('   ✓ Created At');
      
    } catch (error) {
      if (error.error === 'INVALID_VALUE_FOR_COLUMN') {
        console.error('❌ Fields ไม่ครบหรือชื่อไม่ตรงกัน\n');
        console.error('💡 กรุณาสร้าง Fields ต่อไปนี้ใน Table "' + tableName + '":\n');
        console.error('   Field Name: First Name');
        console.error('   Type: Single line text\n');
        console.error('   Field Name: Last Name');
        console.error('   Type: Single line text\n');
        console.error('   Field Name: Time Slot');
        console.error('   Type: Single line text\n');
        console.error('   Field Name: Room ID');
        console.error('   Type: Single line text\n');
        console.error('   Field Name: Room Name');
        console.error('   Type: Single line text\n');
        console.error('   Field Name: Receipt');
        console.error('   Type: Attachment\n');
        console.error('   Field Name: Status');
        console.error('   Type: Single select');
        console.error('   Options: Pending, Confirmed, Cancelled\n');
        console.error('   Field Name: Created At');
        console.error('   Type: Date');
        console.error('   Include time: Yes\n');
        console.error('⚠️  หมายเหตุ: ชื่อ Field ต้องตรงกับที่ระบุไว้ทุกตัวอักษร (Case-sensitive)');
        process.exit(1);
      } else {
        throw error;
      }
    }
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    
    if (error.error === 'AUTHENTICATION_REQUIRED') {
      console.error('\n💡 คำแนะนำ:');
      console.error('   - ตรวจสอบว่า API Key ถูกต้อง');
      console.error('   - ตรวจสอบว่า API Key มีสิทธิ์เข้าถึง Base นี้');
    } else if (error.error === 'NOT_FOUND') {
      console.error('\n💡 คำแนะนำ:');
      console.error('   - ตรวจสอบว่า Base ID ถูกต้อง');
      console.error(`   - ตรวจสอบว่า Table "${tableName}" มีอยู่ใน Base`);
    }
    
    process.exit(1);
  }
}

setupTable();

