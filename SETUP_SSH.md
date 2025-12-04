# 🔑 ตั้งค่า SSH Key สำหรับ GitHub

## ขั้นตอนที่ 1: สร้าง SSH Key

รันคำสั่งนี้ใน terminal:

```bash
ssh-keygen -t ed25519 -C "nattapong05032535@gmail.com"
```

**เมื่อถาม:**
- `Enter file in which to save the key`: กด Enter (ใช้ default)
- `Enter passphrase`: กด Enter (ไม่ใส่ password) หรือใส่ password ถ้าต้องการ

---

## ขั้นตอนที่ 2: เริ่ม ssh-agent

```bash
eval "$(ssh-agent -s)"
```

---

## ขั้นตอนที่ 3: เพิ่ม SSH Key

```bash
ssh-add ~/.ssh/id_ed25519
```

---

## ขั้นตอนที่ 4: แสดง Public Key

```bash
cat ~/.ssh/id_ed25519.pub
```

**คัดลอก output ทั้งหมด** (เริ่มต้นด้วย `ssh-ed25519`)

---

## ขั้นตอนที่ 5: เพิ่ม SSH Key ใน GitHub

1. ไปที่ https://github.com/settings/keys
2. คลิก "New SSH key"
3. ตั้งชื่อ: `WSL2 Queue Master` (หรือชื่ออื่น)
4. วาง public key ที่คัดลอกมา
5. คลิก "Add SSH key"

---

## ขั้นตอนที่ 6: ทดสอบ SSH Connection

```bash
ssh -T git@github.com
```

ควรเห็นข้อความ: `Hi Nattapong05032535! You've successfully authenticated...`

---

## ขั้นตอนที่ 7: Push Code

```bash
cd /home/tiger/projects/queue-master
git add .
git commit -m "Initial commit: Queue Master app"
git push origin main
```

---

## ✅ เสร็จสิ้น!

หลังจากตั้งค่า SSH แล้ว คุณจะสามารถ push/pull code ได้โดยไม่มีปัญหา network timeout

