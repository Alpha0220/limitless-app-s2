# ✅ Checklist - Queue Master Setup

## 📋 ตรวจสอบก่อนใช้งาน

### 1. Environment Variables
- [ ] ไฟล์ `.env.local` มีอยู่
- [ ] `AIRTABLE_API_KEY` ถูกต้อง (เริ่มต้นด้วย `pat...`)
- [ ] `AIRTABLE_BASE_ID` ถูกต้อง (เริ่มต้นด้วย `app...`)
- [ ] `AIRTABLE_TABLE_NAME=Bookings`
- [ ] `NEXT_PUBLIC_APP_URL=http://localhost:3000`

### 2. Airtable Setup
- [ ] สร้าง Base ชื่อ "Queue Master" (หรือชื่ออื่น)
- [ ] สร้าง Table ชื่อ "Bookings"
- [ ] มี Fields ครบ 8 ตัว:
  - [ ] First Name (Single line text)
  - [ ] Last Name (Single line text)
  - [ ] Time Slot (Single line text)
  - [ ] Room ID (Single line text)
  - [ ] Room Name (Single line text)
  - [ ] Receipt (Attachment)
  - [ ] Status (Single select: Pending, Confirmed, Cancelled)
  - [ ] Created At (Date with time)

### 3. Personal Access Token
- [ ] สร้าง Personal Access Token ใน Builder Hub
- [ ] Token มี Scopes:
  - [ ] `data.records:read`
  - [ ] `data.records:write`
  - [ ] `schema.bases:read`
- [ ] Token มี Access เป็น "ALL RESOURCES" หรือมี Base ในรายการ

### 4. Dependencies
- [ ] รัน `pnpm install` หรือ `npm install` แล้ว
- [ ] ไม่มี error ในการติดตั้ง

### 5. Testing
- [ ] รัน `pnpm run dev` สำเร็จ
- [ ] เปิดเบราว์เซอร์ไปที่ http://localhost:3000 ได้
- [ ] เลือกช่วงเวลาและห้องได้
- [ ] กรอกข้อมูลและบันทึกได้
- [ ] ตรวจสอบใน Airtable ว่ามีข้อมูลถูกบันทึก

---

## 🎉 พร้อมใช้งาน!

ถ้าทุกอย่างถูกติ๊กครบ แอปพลิเคชันพร้อมใช้งานแล้ว!

---

## 📚 เอกสารเพิ่มเติม

- `README.md` - ข้อมูลทั่วไป
- `QUICK_START.md` - คู่มือเริ่มต้นใช้งาน
- `USAGE.md` - คู่มือการใช้งาน
- `AIRTABLE_SETUP.md` - คู่มือตั้งค่า Airtable

