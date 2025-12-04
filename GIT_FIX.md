# 🔧 แก้ไขปัญหา Git Push - Network Timeout

## ❌ ปัญหา: `gnutls_handshake() failed: Error in the pull function`

### สาเหตุ
- Network timeout จาก WSL2
- SSL/TLS handshake ไม่สำเร็จ
- เหมือนกับปัญหา Airtable API

---

## ✅ วิธีแก้ไข

### วิธีที่ 1: ใช้ SSH แทน HTTPS (แนะนำ)

#### 1. เปลี่ยน remote URL เป็น SSH

```bash
# ดู remote URL ปัจจุบัน
git remote -v

# เปลี่ยนเป็น SSH
git remote set-url origin git@github.com:Nattapong05032535/queue-master.git
```

#### 2. สร้าง SSH Key (ถ้ายังไม่มี)

```bash
# สร้าง SSH key
ssh-keygen -t ed25519 -C "nattapong05032535@gmail.com"

# เริ่ม ssh-agent
eval "$(ssh-agent -s)"

# เพิ่ม SSH key
ssh-add ~/.ssh/id_ed25519

# แสดง public key
cat ~/.ssh/id_ed25519.pub
```

#### 3. เพิ่ม SSH Key ใน GitHub

1. คัดลอก public key ที่แสดงจากคำสั่ง `cat ~/.ssh/id_ed25519.pub`
2. ไปที่ GitHub → Settings → SSH and GPG keys
3. คลิก "New SSH key"
4. วาง public key และ save

#### 4. ทดสอบ SSH Connection

```bash
ssh -T git@github.com
```

#### 5. Push Code

```bash
git push origin main
# หรือ
git push origin master
```

---

### วิธีที่ 2: เพิ่ม Git Timeout

```bash
# เพิ่ม timeout
git config --global http.postBuffer 524288000
git config --global http.lowSpeedLimit 0
git config --global http.lowSpeedTime 999999

# ลอง push อีกครั้ง
git push origin main
```

---

### วิธีที่ 3: ใช้ Git Credential Helper

```bash
# ตั้งค่า credential helper
git config --global credential.helper store

# Push (จะถาม username/password ครั้งเดียว)
git push origin main
```

---

### วิธีที่ 4: Restart WSL2 แล้วลองใหม่

```powershell
# ใน PowerShell (Windows)
wsl --shutdown
```

แล้วเปิด WSL2 ใหม่และลอง push อีกครั้ง

---

## 🔍 ตรวจสอบการตั้งค่า

```bash
# ดู remote URL
git remote -v

# ดู Git config
git config --list | grep http
```

---

## 💡 วิธีที่แนะนำที่สุด

**ใช้ SSH (วิธีที่ 1)** เพราะ:
- ✅ ไม่มีปัญหา SSL/TLS handshake
- ✅ เร็วกว่า HTTPS
- ✅ ปลอดภัยกว่า
- ✅ ไม่ต้องใส่ password ทุกครั้ง

---

## 📝 ขั้นตอนสรุป (SSH)

1. สร้าง SSH key: `ssh-keygen -t ed25519 -C "your-email@example.com"`
2. เพิ่ม SSH key ใน GitHub
3. เปลี่ยน remote URL: `git remote set-url origin git@github.com:USERNAME/REPO.git`
4. ทดสอบ: `ssh -T git@github.com`
5. Push: `git push origin main`

---

## 🆘 ถ้ายังไม่ได้

ลองวิธีอื่น:
- Restart WSL2
- ใช้ Git GUI (GitHub Desktop, SourceTree)
- Push จาก Windows (ไม่ใช่ WSL2)
- ใช้ VPN

