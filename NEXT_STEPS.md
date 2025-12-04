# 📋 ขั้นตอนต่อไป: ตั้งค่า Cloudinary

## ✅ สิ่งที่ทำเสร็จแล้ว

1. ✅ สร้าง API route สำหรับ Cloudinary (`/api/upload-cloudinary`)
2. ✅ แก้ไข booking page ให้ลองใช้ Cloudinary ก่อน แล้ว fallback ไป Imgur
3. ✅ Push code ไปยัง GitHub แล้ว
4. ✅ Vercel จะ auto-deploy (ถ้ามี Git integration)

---

## 🎯 ขั้นตอนที่ต้องทำตอนนี้

### 1. ไปที่ Cloudinary Dashboard

1. ไปที่ **https://cloudinary.com/console**
2. Login เข้าสู่ระบบ (ถ้ายังไม่ได้ login)

---

### 2. หา Credentials ใน Dashboard

ในหน้า Dashboard จะเห็น:

```
┌─────────────────────────────────┐
│  Cloud Name: dabc123xyz         │
│  API Key: 123456789012345       │
│  API Secret: [Reveal] ← คลิก   │
└─────────────────────────────────┘
```

**คัดลอกข้อมูลทั้ง 3 อย่าง:**
- **Cloud Name**: `dabc123xyz` (ตัวอย่าง)
- **API Key**: `123456789012345` (ตัวอย่าง)
- **API Secret**: คลิก "Reveal" แล้วคัดลอก (ตัวอย่าง: `abcdefghijklmnopqrstuvwxyz123456`)

---

### 3. ตั้งค่าใน Vercel

1. ไปที่ **Vercel Dashboard**: https://vercel.com/dashboard
2. เลือกโปรเจกต์ **"queue-master"**
3. ไปที่ **Settings → Environment Variables**
4. เพิ่ม Variables 3 ตัว:

   ```
   CLOUDINARY_CLOUD_NAME=dabc123xyz
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
   ```

   **หมายเหตุ:** แทนที่ด้วยค่าจริงที่ได้จาก Cloudinary Dashboard

5. **Save**

---

### 4. Redeploy ใน Vercel

1. ไปที่ **Deployments** tab
2. คลิก **"..."** ด้านบนขวา
3. เลือก **"Redeploy"**
4. รอให้ build เสร็จ (ประมาณ 2-3 นาที)

---

### 5. ทดสอบ

1. เปิดเว็บไซต์ที่ Vercel URL (เช่น `https://queue-master-sigma.vercel.app`)
2. ลองจองห้องและอัปโหลดรูปใบเสร็จ
3. ตรวจสอบใน Airtable ว่ามี Receipt attachment หรือไม่

---

## 🔍 วิธีหา Dashboard

ถ้าไม่เห็น Dashboard:

1. ไปที่ **https://cloudinary.com/console**
2. หรือคลิกที่ **"Console"** ในเมนูด้านบน
3. หรือคลิกที่ **"Dashboard"** ในเมนูด้านซ้าย

---

## ⚠️ หมายเหตุ

- **API Secret** ถูกซ่อนไว้ ต้องคลิก "Reveal" เพื่อแสดง
- **เก็บ API Secret เป็นความลับ** อย่าแชร์
- Credentials เหล่านี้ใช้ได้ถาวร (ไม่หมดอายุ)

---

## 🆘 ถ้ามีปัญหา

### ปัญหา: ไม่เห็น Dashboard

**วิธีแก้:**
- ตรวจสอบว่า login แล้วหรือยัง
- ไปที่ https://cloudinary.com/console

### ปัญหา: ไม่เห็น API Secret

**วิธีแก้:**
- คลิกที่ปุ่ม "Reveal" เพื่อแสดง API Secret
- ถ้ายังไม่เห็น ให้ลอง refresh หน้า

### ปัญหา: Upload ล้มเหลว

**วิธีแก้:**
- ตรวจสอบว่า Environment Variables ถูกต้อง
- ตรวจสอบว่า Redeploy แล้ว
- ดู logs ใน Vercel Dashboard → Functions

---

## ✅ Checklist

- [ ] Login เข้า Cloudinary แล้ว
- [ ] หา Cloud Name, API Key, API Secret แล้ว
- [ ] ตั้งค่า Environment Variables ใน Vercel แล้ว
- [ ] Redeploy ใน Vercel แล้ว
- [ ] ทดสอบอัปโหลดรูปใบเสร็จแล้ว

---

## 🎉 พร้อมใช้งาน!

หลังจากตั้งค่า Cloudinary แล้ว ระบบจะสามารถอัปโหลดรูปใบเสร็จได้โดยไม่มีปัญหา!

