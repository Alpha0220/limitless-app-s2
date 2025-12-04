/**
 * Script สำหรับทดสอบการเชื่อมต่อ Airtable
 * รันด้วย: node scripts/test-airtable.js
 */

require('dotenv').config({ path: '.env.local' });
const Airtable = require('airtable');

// ตรวจสอบ environment variables
if (!process.env.AIRTABLE_API_KEY) {
  console.error('❌ ไม่พบ AIRTABLE_API_KEY ใน .env.local');
  process.exit(1);
}

if (!process.env.AIRTABLE_BASE_ID) {
  console.error('❌ ไม่พบ AIRTABLE_BASE_ID ใน .env.local');
  process.exit(1);
}

if (!process.env.AIRTABLE_TABLE_NAME) {
  console.error('❌ ไม่พบ AIRTABLE_TABLE_NAME ใน .env.local');
  process.exit(1);
}

console.log('🔍 กำลังทดสอบการเชื่อมต่อ Airtable...\n');

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID);

const tableName = process.env.AIRTABLE_TABLE_NAME;

// ทดสอบการอ่านข้อมูล
async function testConnection() {
  try {
    console.log('📋 กำลังทดสอบการอ่านข้อมูลจาก Table:', tableName);
    
    const records = await base(tableName).select({
      maxRecords: 1,
    }).firstPage();

    console.log('✅ เชื่อมต่อ Airtable สำเร็จ!');
    console.log(`📊 พบ ${records.length} records ใน Table "${tableName}"\n`);

    // ทดสอบการสร้าง record ใหม่
    console.log('🧪 กำลังทดสอบการสร้าง record ใหม่...');
    
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

    console.log('✅ สร้าง record สำเร็จ!');
    console.log(`📝 Record ID: ${testRecord[0].id}\n`);

    // ลบ test record
    console.log('🗑️  กำลังลบ test record...');
    await base(tableName).destroy([testRecord[0].id]);
    console.log('✅ ลบ test record สำเร็จ!\n');

    console.log('🎉 ทุกอย่างทำงานได้ปกติ! Airtable พร้อมใช้งานแล้ว');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    
    if (error.error === 'NOT_FOUND') {
      console.error('\n💡 คำแนะนำ:');
      console.error('   - ตรวจสอบว่า Base ID ถูกต้อง');
      console.error('   - ตรวจสอบว่า Table name เป็น "' + tableName + '"');
    } else if (error.error === 'AUTHENTICATION_REQUIRED') {
      console.error('\n💡 คำแนะนำ:');
      console.error('   - ตรวจสอบว่า API Key ถูกต้อง');
      console.error('   - ตรวจสอบว่า API Key มีสิทธิ์เข้าถึง Base นี้');
    } else if (error.error === 'INVALID_VALUE_FOR_COLUMN') {
      console.error('\n💡 คำแนะนำ:');
      console.error('   - ตรวจสอบว่า Field names ตรงกับที่สร้างไว้ใน Airtable');
      console.error('   - ตรวจสอบว่า Field types ถูกต้อง');
    }
    
    process.exit(1);
  }
}

testConnection();

