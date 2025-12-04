/**
 * Script ทดสอบการเชื่อมต่อ Airtable แบบง่าย
 */
require('dotenv').config({ path: '.env.local' });
const Airtable = require('airtable');

console.log('🔍 กำลังทดสอบการเชื่อมต่อ...\n');

// ตรวจสอบ environment variables
if (!process.env.AIRTABLE_API_KEY) {
  console.error('❌ ไม่พบ AIRTABLE_API_KEY');
  process.exit(1);
}

if (!process.env.AIRTABLE_BASE_ID) {
  console.error('❌ ไม่พบ AIRTABLE_BASE_ID');
  process.exit(1);
}

console.log('✅ Environment variables พบแล้ว');
console.log(`📋 API Key: ${process.env.AIRTABLE_API_KEY.substring(0, 10)}...`);
console.log(`📋 Base ID: ${process.env.AIRTABLE_BASE_ID}\n`);

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID);

const tableName = process.env.AIRTABLE_TABLE_NAME || 'Bookings';

// ทดสอบการอ่านข้อมูล
base(tableName).select({
  maxRecords: 1,
}).firstPage((err, records) => {
  if (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err.message);
    console.error('📋 Error details:', JSON.stringify(err, null, 2));
    
    if (err.statusCode === 401) {
      console.error('\n💡 คำแนะนำ:');
      console.error('   - ตรวจสอบว่า API Key ถูกต้อง');
      console.error('   - ถ้าใช้ Personal Access Token ตรวจสอบว่า Token มีสิทธิ์เข้าถึง Base นี้');
      console.error('   - ตรวจสอบ Scopes: data.records:read, data.records:write, schema.bases:read');
    } else if (err.statusCode === 403) {
      console.error('\n💡 คำแนะนำ:');
      console.error('   - Personal Access Token อาจไม่มีสิทธิ์เข้าถึง Base นี้');
      console.error('   - ตรวจสอบว่า Token มี Access เป็น "ALL RESOURCES" หรือมี Base นี้ในรายการ');
    } else if (err.statusCode === 404) {
      console.error('\n💡 คำแนะนำ:');
      console.error('   - ตรวจสอบว่า Base ID ถูกต้อง');
      console.error(`   - ตรวจสอบว่า Table "${tableName}" มีอยู่ใน Base`);
    }
    process.exit(1);
  }
  
  console.log('✅ การเชื่อมต่อสำเร็จ!');
  console.log(`📊 พบ ${records.length} records ใน Table "${tableName}"`);
  process.exit(0);
});

