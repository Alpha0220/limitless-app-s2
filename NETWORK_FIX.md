# 🌐 แก้ไขปัญหา Network Timeout - WSL2

## ⚠️ ปัญหา: ไม่สามารถเชื่อมต่อ Airtable API ได้

### สาเหตุ
- WSL2 network configuration มีปัญหา
- DNS resolution ไม่ทำงาน
- SSL connection timeout

---

## ✅ วิธีแก้ไข (เรียงตามความง่าย)

### วิธีที่ 1: แก้ไข DNS (ต้องใช้ password)

```bash
sudo bash -c 'cat > /etc/resolv.conf << EOF
nameserver 8.8.8.8
nameserver 8.8.4.4
EOF'
```

**หมายเหตุ:** 
- ต้องใส่ password ของ user `tiger`
- ถ้าไม่รู้ password ลองวิธีอื่น

### วิธีที่ 2: Restart WSL2 (ไม่ต้องใช้ password)

1. **เปิด PowerShell (Admin)** ใน Windows:
   - กด `Win + X`
   - เลือก "Windows PowerShell (Admin)" หรือ "Terminal (Admin)"

2. **รันคำสั่ง:**
   ```powershell
   wsl --shutdown
   ```

3. **เปิด WSL2 ใหม่** และลองอีกครั้ง

### วิธีที่ 3: ใช้ Windows Host IP เป็น DNS

1. **หา Windows Host IP:**
   ```bash
   ip route show | grep -i default | awk '{ print $3}'
   ```
   
   หรือ
   ```bash
   cat /etc/resolv.conf | grep nameserver
   ```

2. **แก้ไข DNS:**
   ```bash
   # ใช้ IP ที่ได้จากขั้นตอนที่ 1
   sudo bash -c 'echo "nameserver [IP_ADDRESS]" > /etc/resolv.conf'
   ```

### วิธีที่ 4: ตั้งค่า WSL2 Network (ถาวร)

สร้างไฟล์ `/etc/wsl.conf`:

```bash
sudo bash -c 'cat > /etc/wsl.conf << EOF
[network]
generateResolvConf = false
EOF'
```

แล้วแก้ไข `/etc/resolv.conf`:

```bash
sudo bash -c 'cat > /etc/resolv.conf << EOF
nameserver 8.8.8.8
nameserver 8.8.4.4
EOF'
```

### วิธีที่ 5: ใช้ VPN หรือ Proxy

ถ้า Airtable API ถูก block ลองใช้ VPN

---

## 🔍 ทดสอบการเชื่อมต่อ

หลังจากแก้ไขแล้ว ทดสอบ:

```bash
# ทดสอบ DNS
nslookup api.airtable.com

# ทดสอบ HTTPS connection
curl -I --connect-timeout 10 https://api.airtable.com

# ทดสอบ ping
ping -c 4 api.airtable.com
```

---

## 💡 วิธีแก้ไขชั่วคราว (ถ้ายังแก้ไม่ได้)

### ใช้ Mock Data

ถ้ายังแก้ปัญหา network ไม่ได้ สามารถใช้ mock data ชั่วคราว:

1. แก้ไข `app/api/bookings/route.ts` ให้ return mock data
2. หรือใช้ local storage แทน Airtable

### Deploy ไปยัง Production

Deploy ไปยัง VPS หรือ Cloud service ที่มี network ที่ดีกว่า:
- Vercel
- Railway
- Render
- DigitalOcean

---

## 📝 หมายเหตุ

- การแก้ไข DNS ใน WSL2 อาจถูกรีเซ็ตเมื่อ restart
- ใช้วิธีที่ 4 เพื่อแก้ไขถาวร
- ถ้ายังแก้ไม่ได้ ลอง deploy ไปยัง production server

---

## 🆘 ถ้ายังแก้ไม่ได้

1. **ตรวจสอบ Internet Connection:**
   ```bash
   ping -c 4 8.8.8.8
   ```

2. **ตรวจสอบ Firewall:**
   - ตรวจสอบ Windows Firewall
   - ตรวจสอบ Antivirus

3. **ติดต่อ Network Admin:**
   - ถ้าอยู่ใน corporate network อาจต้องขอ permission

