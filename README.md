# AIS Stream Custom Cast Receiver

Custom Chromecast Receiver Application ที่รองรับ custom HTTP headers สำหรับ AIS Stream authentication

## 🚀 การ Deploy

### ขั้นตอนที่ 1: Host ไฟล์บน Web Server

คุณต้อง host ไฟล์ `receiver.html` และ `receiver.js` บน web server ที่รองรับ HTTPS เท่านั้น

**ตัวเลือกการ Host:**

#### A. GitHub Pages (แนะนำ - ฟรี)
1. สร้าง GitHub repository ใหม่ (เช่น `ais-cast-receiver`)
2. Upload `receiver.html` และ `receiver.js` 
3. เปิดใช้งาน GitHub Pages ใน Settings
4. จดบันทึก URL: `https://YOUR-USERNAME.github.io/ais-cast-receiver/receiver.html`

#### B. Firebase Hosting (ฟรี)
```bash
# ติดตั้ง Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# สร้างโปรเจค
firebase init hosting

# Deploy
firebase deploy --only hosting
```

#### C. Netlify / Vercel (ฟรี)
- Drag & drop โฟลเดอร์ `cast_receiver` ไปที่ website
- จดบันทึก URL ที่ได้

#### D. Self-hosted Server
- ต้องมี valid SSL certificate (HTTPS)
- Configure CORS headers:
  ```
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, OPTIONS
  Access-Control-Allow-Headers: Content-Type
  ```

### ขั้นตอนที่ 2: ลงทะเบียน Custom Receiver App

1. ไปที่ [Google Cast SDK Developer Console](https://cast.google.com/publish/)
2. เข้าสู่ระบบด้วย Google Account
3. คลิก **"Add New Application"**
4. เลือก **"Custom Receiver"**
5. กรอกข้อมูล:
   - **Name**: `AIS Stream Player` (หรือชื่ออื่นตามต้องการ)
   - **Receiver Application URL**: URL ที่ host ไฟล์ `receiver.html` (เช่น `https://your-domain.com/receiver.html`)
   - **Category**: Media
6. คลิก **"Save"**
7. จดบันทึก **Application ID** (เช่น `12345678`)
8. คลิก **"Publish"** เพื่อทำให้ application พร้อมใช้งาน

**หมายเหตุ:** 
- ใช้เวลา 5-15 นาทีหลัง Publish ถึงจะใช้งานได้
- สามารถทดสอบทันทีโดยเพิ่มอุปกรณ์ Chromecast ของคุณเป็น "Test Device"

### ขั้นตอนที่ 3: อัพเดท Flutter App

แก้ไขไฟล์ `clear_stream_player_screen.dart` ให้ใช้ Application ID ของคุณ:

```dart
// เปลี่ยนจาก default app ID
const appId = 'YOUR_CUSTOM_APP_ID'; // ใส่ App ID ที่ได้จากขั้นตอนที่ 2

// ใน _castVideo() method
await GoogleCastRemoteMediaClient.instance.loadMedia(
  GoogleCastMediaInformationIOS(
    contentId: 'clear_stream_video',
    streamType: CastMediaStreamType.buffered,
    contentUrl: Uri.parse(castUrl),
    contentType: 'application/x-mpegURL',
    metadata: GoogleCastMovieMediaMetadata(
      title: 'V0014 (DN4)',
      subtitle: 'Clear Stream - AIS',
    ),
    customData: {
      'userid': _userId,
      'authinfo': _authInfo,
      'usersessionid': _userSessionId,
    },
  ),
  autoPlay: true,
  playPosition: const Duration(seconds: 0),
);
```

## 🔧 การทำงาน

Custom Receiver นี้:
1. ✅ รับ custom data (userid, authinfo, usersessionid) จาก Flutter app
2. ✅ เพิ่ม custom HTTP headers ในทุก manifest request (`.m3u8`)
3. ✅ เพิ่ม custom HTTP headers ในทุก segment request (`.ts`, `.mp4`)
4. ✅ แสดง splash screen ขณะโหลด
5. ✅ แสดงสถานะการเล่นแบบ real-time

## 🧪 การทดสอบ

### ทดสอบแบบ Local (ก่อน deploy)
```bash
# ใช้ Python simple server
cd cast_receiver
python3 -m http.server 8000

# หรือใช้ Node.js http-server
npx http-server -p 8000

# เปิดในเบราว์เซอร์: http://localhost:8000/receiver.html
```

### ทดสอบบน Chromecast
1. Deploy ไฟล์บน HTTPS server
2. ลงทะเบียน Application ID
3. เพิ่ม Chromecast เป็น Test Device (ใช้ Serial Number)
4. รอ 5-15 นาที
5. ทดสอบผ่าน Flutter app

## 📝 Troubleshooting

### ปัญหา: Receiver ไม่โหลด
- ตรวจสอบว่า URL เป็น HTTPS
- ตรวจสอบ CORS headers
- ดู Console logs ใน Chrome Remote Debugger

### ปัญหา: Video ไม่เล่น
- เปิด Chrome Remote Debugger: `chrome://inspect/#devices`
- เลือก "Cast..." device
- ดู Console errors
- ตรวจสอบว่า headers ถูกส่งถูกต้อง

### ปัญหา: Application ID ใช้ไม่ได้
- รอ 15 นาที หลัง Publish
- หรือเพิ่มอุปกรณ์เป็น Test Device

## 🔗 ทางเลือกอื่น (ถ้า Custom Receiver ใช้ไม่ได้)

1. **ใช้ DLNA/AirPlay** แทน Chromecast
2. **Proxy Server** - สร้าง proxy ที่เพิ่ม headers แล้วส่งต่อไปยัง AIS server
3. **Token in URL** - ถ้า AIS รองรับ token-based auth ใน query params

## 📚 Resources

- [Google Cast SDK](https://developers.google.com/cast/docs/web_receiver)
- [CAF Receiver API Reference](https://developers.google.com/cast/docs/reference/web_receiver/cast.framework)
- [Chrome Remote Debugger](https://developers.google.com/cast/docs/debugging)
