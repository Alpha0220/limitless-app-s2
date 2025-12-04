# 🚀 คู่มือ Deploy Queue Master ไปยัง Vercel

## 📋 ขั้นตอนการ Deploy

### 1. ติดตั้ง Vercel CLI (ถ้ายังไม่มี)

```bash
npm i -g vercel
# หรือ
pnpm add -g vercel
```

### 2. Login เข้า Vercel

```bash
vercel login
```

จะเปิดเบราว์เซอร์ให้ login ด้วย GitHub, GitLab, หรือ Bitbucket

---

### 3. Deploy โปรเจกต์

#### วิธีที่ 1: ใช้ Vercel CLI (แนะนำ)

```bash
# ในโฟลเดอร์โปรเจกต์
cd /home/tiger/projects/queue-master

# Deploy
vercel

# ตอบคำถาม:
# - Set up and deploy? Y
# - Which scope? เลือก account ของคุณ
# - Link to existing project? N (ถ้าเป็นครั้งแรก)
# - Project name? queue-master (หรือชื่ออื่น)
# - Directory? ./
# - Override settings? N
```

#### วิธีที่ 2: ใช้ Vercel Dashboard (ง่ายกว่า)

1. ไปที่ https://vercel.com
2. Login เข้าสู่ระบบ
3. คลิก "Add New Project"
4. Import Git Repository (ถ้ามี) หรือ Upload โปรเจกต์

---

### 4. ตั้งค่า Environment Variables

**สำคัญ:** ต้องตั้งค่า Environment Variables ใน Vercel

1. ไปที่ Vercel Dashboard
2. เลือกโปรเจกต์ "queue-master"
3. ไปที่ Settings → Environment Variables
4. เพิ่ม Variables ต่อไปนี้:

```
AIRTABLE_API_KEY=your_airtable_api_key_here
AIRTABLE_BASE_ID=appfHouIztFByiTpa
AIRTABLE_TABLE_NAME=Bookings
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

**หมายเหตุ:** 
- แทนที่ `NEXT_PUBLIC_APP_URL` ด้วย URL จริงของ Vercel deployment
- เลือก Environment: Production, Preview, Development (หรือเลือกทั้งหมด)

---

### 5. Redeploy

หลังจากตั้งค่า Environment Variables แล้ว:

1. ไปที่ Deployments tab
2. คลิก "..." ด้านบนขวา
3. เลือก "Redeploy"

หรือใช้ CLI:

```bash
vercel --prod
```

---

## 🔍 ตรวจสอบการ Deploy

### ตรวจสอบ Logs

```bash
# ดู logs
vercel logs

# หรือดูใน Vercel Dashboard → Deployments → เลือก deployment → Logs
```

### ทดสอบ API

หลังจาก deploy แล้ว ทดสอบ API:

```bash
curl https://your-project.vercel.app/api/bookings
```

---

## 📝 หมายเหตุสำคัญ

### 1. Environment Variables

- **อย่า commit `.env.local` ลง Git!**
- ตั้งค่า Environment Variables ใน Vercel Dashboard เท่านั้น
- Vercel จะ inject variables เข้าไปใน runtime

### 2. Build Settings

Vercel จะ detect Next.js อัตโนมัติ แต่ถ้ามีปัญหา:

- Build Command: `pnpm build` หรือ `npm run build`
- Output Directory: `.next`
- Install Command: `pnpm install` หรือ `npm install`

### 3. Custom Domain (Optional)

1. ไปที่ Settings → Domains
2. เพิ่ม domain ที่ต้องการ
3. ตั้งค่า DNS ตามที่ Vercel แนะนำ

---

## 🐛 แก้ไขปัญหา

### ปัญหา: Build Failed

**วิธีแก้:**
1. ตรวจสอบ logs ใน Vercel Dashboard
2. ตรวจสอบว่า dependencies ติดตั้งครบ
3. ตรวจสอบว่า environment variables ตั้งค่าครบ

### ปัญหา: API ไม่ทำงาน

**วิธีแก้:**
1. ตรวจสอบว่า environment variables ตั้งค่าถูกต้อง
2. ตรวจสอบ logs ใน Vercel Dashboard
3. ทดสอบ API endpoint โดยตรง

### ปัญหา: Network Timeout

**วิธีแก้:**
- Vercel ใช้ network ที่ดีกว่า WSL2 ควรจะไม่มีปัญหา
- ถ้ายังมีปัญหา ตรวจสอบ Airtable API rate limits

---

## 🔄 Continuous Deployment

### ตั้งค่า Git Integration

1. ไปที่ Settings → Git
2. Connect Git Repository
3. Vercel จะ auto-deploy เมื่อ push code ใหม่

---

## 📚 เอกสารเพิ่มเติม

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/environment-variables)

---

## ✅ Checklist

- [ ] ติดตั้ง Vercel CLI
- [ ] Login เข้า Vercel
- [ ] Deploy โปรเจกต์
- [ ] ตั้งค่า Environment Variables
- [ ] Redeploy
- [ ] ทดสอบ API
- [ ] ตรวจสอบ Logs

---

## 🎉 เสร็จสิ้น!

หลังจาก deploy สำเร็จ คุณจะได้ URL เช่น:
- `https://queue-master.vercel.app`
- `https://queue-master-[username].vercel.app`

แอปจะทำงานได้ปกติและไม่มีปัญหา network timeout แล้ว! 🚀

