# 🔥 Firebase Setup Guide - Chat Realtime

## 📋 Bước 1: Cài đặt Firebase packages

```bash
cd frontend
npm install firebase
```

## 🌐 Bước 2: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** hoặc **"Thêm dự án"**
3. Nhập tên project: `maintenance-app-chat`
4. Disable Google Analytics (không cần thiết cho đồ án)
5. Click **"Create project"**

## ⚙️ Bước 3: Thêm Web App vào Firebase Project

1. Trong Firebase Console, click icon **Web** (`</>`)
2. Nhập app nickname: `Maintenance App`
3. **KHÔNG** chọn Firebase Hosting
4. Click **"Register app"**
5. Copy **Firebase configuration** (giống như dưới đây):

```javascript
const firebaseConfig = {
  apiKey: 'AIza...',
  authDomain: 'maintenance-app-chat.firebaseapp.com',
  projectId: 'maintenance-app-chat',
  storageBucket: 'maintenance-app-chat.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abc123',
};
```

## 🔐 Bước 4: Cấu hình Environment Variables

1. Tạo file `.env` trong thư mục `frontend/`:

```bash
# Copy từ .env.example
cp .env.example .env
```

2. Paste Firebase config vào `.env`:

```env
REACT_APP_FIREBASE_API_KEY=AIza...
REACT_APP_FIREBASE_AUTH_DOMAIN=maintenance-app-chat.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=maintenance-app-chat
REACT_APP_FIREBASE_STORAGE_BUCKET=maintenance-app-chat.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
```

## 📊 Bước 5: Tạo Firestore Database

1. Trong Firebase Console, vào **Build** → **Firestore Database**
2. Click **"Create database"**
3. Chọn **Production mode** (sẽ setup rules sau)
4. Chọn location: `asia-southeast1` (Singapore - gần VN nhất)
5. Click **"Enable"**

## 🔒 Bước 6: Setup Firestore Security Rules

Vào **Firestore Database** → **Rules** tab, paste rules sau:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Conversations collection
    match /conversations/{conversationId} {
      // Cho phép user và technician đọc conversation của họ
      allow read: if request.auth != null &&
        (resource.data.customerId == request.auth.uid ||
         resource.data.technicianId == request.auth.uid);

      // Chỉ admin có thể tạo conversation (khi confirmed)
      allow create: if request.auth != null;

      // Cho phép update lastMessage
      allow update: if request.auth != null;

      // Messages subcollection
      match /messages/{messageId} {
        // Cho phép đọc messages nếu thuộc conversation
        allow read: if request.auth != null;

        // Cho phép tạo message nếu là member của conversation
        allow create: if request.auth != null;
      }
    }
  }
}
```

**LƯU Ý:** Vì chúng ta không dùng Firebase Authentication (đã có backend PHP), nên rules trên chỉ mang tính tham khảo. Trong môi trường dev, có thể dùng:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // DEVELOPMENT ONLY!
    }
  }
}
```

⚠️ **Nhớ đổi lại rules khi deploy production!**

## 🏗️ Firestore Data Structure

### Collection: `conversations`

```json
{
  "conversationId": {
    "scheduleId": 123,
    "customerId": 5,
    "technicianId": 7,
    "customerName": "Nguyễn A",
    "technicianName": "Kỹ thuật viên B",
    "deviceName": "Máy lạnh Daikin",
    "scheduledDate": "2025-10-20",
    "status": "active", // active | closed
    "createdAt": Timestamp,
    "lastMessage": "Tôi sẽ đến lúc 2PM",
    "lastMessageAt": Timestamp
  }
}
```

### Subcollection: `conversations/{id}/messages`

```json
{
  "messageId": {
    "senderId": 5,
    "senderName": "Nguyễn A",
    "senderRole": "user", // user | technician
    "message": "Xin chào, bạn đến lúc mấy giờ?",
    "createdAt": Timestamp,
    "read": false
  }
}
```

## 🔗 Tích hợp vào Code

### 1. Tạo conversation khi admin confirm schedule

Trong file xử lý confirm schedule (backend hoặc frontend), gọi:

```javascript
import { createConversation } from '../services/chatService';

// Khi admin confirm và assign technician
const handleConfirmSchedule = async (schedule) => {
  // ... existing code to update schedule status to 'confirmed'

  // Tạo conversation
  try {
    await createConversation(
      schedule.id,
      schedule.user_id,
      schedule.technician_id,
      {
        customerName: schedule.user_name,
        technicianName: schedule.technician_name,
        deviceName: schedule.device_name,
        scheduledDate: schedule.scheduled_date,
      }
    );
  } catch (error) {
    console.error('Error creating conversation:', error);
  }
};
```

### 2. Hiển thị Chat Button trong Schedule List

```jsx
import ChatButton from '../components/chat/ChatButton';

// Trong table row của schedule
<TableCell>
  {schedule.status === 'confirmed' && (
    <ChatButton
      scheduleId={schedule.id}
      scheduleDetails={{
        customerName: schedule.user_name,
        technicianName: schedule.technician_name,
        deviceName: schedule.device_name,
      }}
      currentUserId={user.id}
      currentUserName={user.name}
      currentUserRole={user.role} // 'user' or 'technician'
    />
  )}
</TableCell>;
```

## ✅ Testing

1. **Start frontend:**

   ```bash
   npm start
   ```

2. **Kiểm tra Firebase connection:**

   - Mở Console của browser (F12)
   - Nếu thấy Firebase initialized successfully → OK
   - Nếu có lỗi → Check lại `.env` file

3. **Test chat flow:**
   - Admin confirm một schedule → Tạo conversation
   - Customer mở chat button → Gửi tin nhắn
   - Technician mở chat button → Thấy tin nhắn realtime
   - Gửi tin nhắn reply → Customer thấy ngay lập tức

## 🎯 Next Steps

- [ ] Cài đặt `npm install firebase`
- [ ] Tạo Firebase project
- [ ] Cấu hình `.env` file
- [ ] Enable Firestore Database
- [ ] Setup Security Rules
- [ ] Tích hợp `ChatButton` vào schedules pages
- [ ] Test chat realtime

## 📚 Docs

- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [React Firebase Hooks](https://github.com/CSFrequency/react-firebase-hooks)

## 🐛 Troubleshooting

### Lỗi: "Firebase: No Firebase App '[DEFAULT]' has been created"

→ Kiểm tra `firebase.js` đã import và initialize đúng chưa

### Lỗi: "Missing or insufficient permissions"

→ Check Firestore Rules, có thể tạm dùng `allow read, write: if true;` cho dev

### Messages không realtime

→ Kiểm tra network tab, có websocket connection đến Firestore không

---

**Tạo bởi:** Maintenance App Team  
**Ngày:** October 18, 2025
