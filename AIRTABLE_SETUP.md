# คู่มือการตั้งค่า Airtable สำหรับ Queue Master

## ขั้นตอนที่ 1: สร้าง Airtable Base

1. ไปที่ [https://airtable.com](https://airtable.com) และล็อกอินด้วยอีเมล: nattapong05032535@gmail.com
2. คลิก "Add a base" หรือ "Create a base"
3. เลือก "Start from scratch"
4. ตั้งชื่อ Base: **Queue Master** (หรือชื่ออื่นที่ต้องการ)

## ขั้นตอนที่ 2: สร้าง Table และ Fields

### 2.1 สร้าง Table ชื่อ "Bookings"

1. ใน Base ที่สร้างไว้ จะมี Table เริ่มต้นชื่อ "Table 1"
2. คลิกที่ชื่อ "Table 1" แล้วเปลี่ยนชื่อเป็น **"Bookings"**

### 2.2 เพิ่ม Fields ตามนี้:

คลิกที่ "+ Add a field" เพื่อเพิ่ม field ใหม่ตามลำดับนี้:

| Field Name | Field Type | Options |
|------------|------------|---------|
| **First Name** | Single line text | - |
| **Last Name** | Single line text | - |
| **Time Slot** | Single line text | - |
| **Room ID** | Single line text | - |
| **Room Name** | Single line text | - |
| **Receipt** | Attachment | - |
| **Status** | Single select | Options: Pending, Confirmed, Cancelled |
| **Created At** | Date | Include time: Yes |

**หมายเหตุ:** ชื่อ Field ต้องตรงกับที่ระบุไว้ (Case-sensitive)

## ขั้นตอนที่ 3: หา API Key

1. ไปที่ [https://airtable.com/api](https://airtable.com/api)
2. เลือก Base ที่สร้างไว้ (Queue Master)
3. คลิก "Generate API key" ถ้ายังไม่มี
4. คัดลอก API Key ที่แสดง

## ขั้นตอนที่ 4: หา Base ID

1. ยังอยู่ในหน้า API documentation ของ Base
2. Base ID จะแสดงอยู่ด้านบนของหน้า (รูปแบบ: `appXXXXXXXXXXXXXX`)
3. หรือไปที่ [https://airtable.com/api](https://airtable.com/api) แล้วเลือก Base
4. Base ID จะอยู่ใน URL หรือแสดงในหน้า API docs

## ขั้นตอนที่ 5: ตั้งค่า Environment Variables

1. สร้างไฟล์ `.env.local` ในโฟลเดอร์โปรเจกต์ (ถ้ายังไม่มี)
2. เพิ่มข้อมูลต่อไปนี้:

```env
AIRTABLE_API_KEY=paste_your_api_key_here
AIRTABLE_BASE_ID=paste_your_base_id_here
AIRTABLE_TABLE_NAME=Bookings
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. แทนที่ `paste_your_api_key_here` และ `paste_your_base_id_here` ด้วยค่าจริงที่ได้จากขั้นตอนที่ 3 และ 4

## ขั้นตอนที่ 6: ทดสอบการเชื่อมต่อ

1. รันแอป: `npm run dev`
2. เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`
3. ลองจองห้องและกรอกข้อมูล
4. ตรวจสอบใน Airtable ว่ามีข้อมูลถูกบันทึกหรือไม่

## ตัวอย่างข้อมูลใน Airtable

หลังจากบันทึกข้อมูลแล้ว คุณจะเห็นข้อมูลในรูปแบบนี้:

| First Name | Last Name | Time Slot | Room ID | Room Name | Receipt | Status | Created At |
|------------|-----------|-----------|---------|-----------|---------|--------|------------|
| สมชาย | ใจดี | 10:00 - 12:00 | room1 | ห้องที่ 1 | [ไฟล์] | Pending | 2024-01-15 10:30:00 |

## ข้อควรระวัง

1. **API Key**: เก็บเป็นความลับ อย่า commit ลง Git
2. **Base ID**: ไม่จำเป็นต้องเป็นความลับ แต่ควรเก็บใน .env.local
3. **Field Names**: ชื่อ field ต้องตรงกับที่ระบุไว้ทุกตัวอักษร
4. **Receipt Upload**: Airtable อาจไม่รองรับ data URL โดยตรง ถ้ามีปัญหา อาจต้องใช้ file storage service เช่น Cloudinary หรือ S3

## วิธีแก้ปัญหา

### ถ้าไม่สามารถบันทึกข้อมูลได้:

1. ตรวจสอบว่า API Key ถูกต้อง
2. ตรวจสอบว่า Base ID ถูกต้อง
3. ตรวจสอบว่า Table name เป็น "Bookings" (Case-sensitive)
4. ตรวจสอบว่า Field names ตรงกับที่ระบุไว้
5. ดู Console log ใน terminal หรือ browser console เพื่อดู error message

### ถ้า Receipt ไม่แสดง:

- Airtable อาจไม่รองรับ data URL โดยตรง
- ต้องอัปโหลดไฟล์ไปยัง file storage service ก่อน แล้วส่ง URL ไปยัง Airtable

