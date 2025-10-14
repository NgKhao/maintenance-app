# 📧 Email Configuration Guide

## Hướng dẫn cấu hình gửi email tự động

### 📋 Yêu cầu

- PHP >= 7.4
- Composer
- Tài khoản Gmail (hoặc SMTP server khác)

---

## 🚀 Cài đặt

### Bước 1: Cài đặt PHPMailer qua Composer

Mở terminal tại thư mục `backend` và chạy:

```bash
composer install
```

Lần đầu chạy sẽ tạo thư mục `vendor/` và tải PHPMailer.

---

### Bước 2: Cấu hình Gmail SMTP

#### 2.1. Bật xác thực 2 bước cho Gmail

1. Truy cập: https://myaccount.google.com/security
2. Tìm **"2-Step Verification"** và bật nó
3. Làm theo hướng dẫn để hoàn tất

#### 2.2. Tạo App Password

1. Sau khi bật 2-Step Verification
2. Vào: https://myaccount.google.com/apppasswords
3. Chọn **"Mail"** và **"Other (Custom name)"**
4. Đặt tên: `Maintenance App`
5. Click **"Generate"**
6. Sao chép mật khẩu 16 ký tự (dạng: `xxxx xxxx xxxx xxxx`)

---

### Bước 3: Cập nhật file .env

Mở file `.env` trong thư mục `backend` và cập nhật:

```env
# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-gmail@gmail.com
MAIL_PASSWORD=your-16-digit-app-password
MAIL_FROM_EMAIL=your-gmail@gmail.com
MAIL_FROM_NAME=Maintenance App
MAIL_ENCRYPTION=tls
```

**⚠️ Quan trọng:**

- `MAIL_USERNAME`: Email Gmail của bạn
- `MAIL_PASSWORD`: Mật khẩu ứng dụng 16 ký tự (KHÔNG phải mật khẩu Gmail thường)
- `MAIL_FROM_EMAIL`: Email Gmail của bạn
- Bỏ dấu cách trong App Password: `xxxx xxxx xxxx xxxx` → `xxxxxxxxxxxxxxxx`

---

## 🧪 Kiểm tra cấu hình

### Test email từ command line:

```bash
cd backend
php test_email.php your-test-email@example.com
```

Nếu thành công, bạn sẽ nhận được 2 email:

1. Email test đơn giản
2. Email xác nhận lịch bảo trì (demo)

---

## 📝 Cách hoạt động

### Flow gửi email tự động:

1. **Kỹ thuật viên** xác nhận lịch bảo trì (click "Xác nhận")
2. **Frontend** gọi API `technician_approve.php` với `status: 'confirmed'`
3. **Backend** cập nhật database
4. **EmailService** tự động gửi email cho khách hàng
5. **Khách hàng** nhận email thông báo lịch đã được xác nhận

### Code flow:

```
TechnicianSchedulesPage.jsx
    ↓ (API call)
technician_approve.php
    ↓ (Update DB)
    ↓ (if status === 'confirmed')
EmailService.php
    ↓ (PHPMailer)
    ↓ (Gmail SMTP)
📧 Customer Email Inbox
```

---

## 🎨 Template Email

Email gửi đi bao gồm:

- ✅ Thông tin lịch bảo trì đầy đủ
- 📅 Ngày giờ thực hiện
- 🔧 Thiết bị cần bảo trì
- 👨‍🔧 Kỹ thuật viên phụ trách
- 📦 Gói dịch vụ
- 📌 Lưu ý quan trọng

---

## 🔧 Sử dụng SMTP khác (không phải Gmail)

Nếu bạn muốn dùng SMTP khác, cập nhật `.env`:

### Ví dụ với Outlook/Hotmail:

```env
MAIL_HOST=smtp-mail.outlook.com
MAIL_PORT=587
MAIL_USERNAME=your-email@outlook.com
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
```

### Ví dụ với Yahoo:

```env
MAIL_HOST=smtp.mail.yahoo.com
MAIL_PORT=587
MAIL_USERNAME=your-email@yahoo.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
```

---

## 🐛 Xử lý lỗi thường gặp

### Lỗi 1: "SMTP connect() failed"

- ✅ Kiểm tra MAIL_HOST và MAIL_PORT
- ✅ Kiểm tra firewall/antivirus
- ✅ Thử đổi MAIL_PORT từ 587 sang 465 (và MAIL_ENCRYPTION từ tls sang ssl)

### Lỗi 2: "Invalid credentials"

- ✅ Kiểm tra MAIL_USERNAME (phải là email đầy đủ)
- ✅ Kiểm tra MAIL_PASSWORD (phải là App Password, không phải mật khẩu thường)
- ✅ Đảm bảo đã bật 2-Step Verification

### Lỗi 3: "Could not instantiate mail function"

- ✅ Kiểm tra composer đã cài PHPMailer chưa
- ✅ Chạy: `composer install`
- ✅ Kiểm tra file `vendor/autoload.php` có tồn tại không

### Lỗi 4: Email không gửi được nhưng không báo lỗi

- ✅ Kiểm tra PHP error log
- ✅ Bật debug mode trong .env: `APP_DEBUG=true`
- ✅ Kiểm tra email có rơi vào Spam không

---

## 📊 Monitoring

### Xem log email:

Tất cả email đều được ghi log vào PHP error log. Kiểm tra:

**Windows XAMPP:**

```
xampp/apache/logs/error.log
```

**Linux:**

```
/var/log/apache2/error.log
```

**Hoặc xem trong VSCode terminal khi chạy PHP server**

---

## 🔐 Bảo mật

**⚠️ QUAN TRỌNG:**

1. **KHÔNG commit file .env** vào Git
2. **KHÔNG chia sẻ App Password** với ai
3. **SỬ DỤNG App Password**, không dùng mật khẩu Gmail thật
4. Nếu cần đổi password, tạo lại App Password mới
5. File `.env` đã được thêm vào `.gitignore`

---

## 📚 Tài liệu tham khảo

- [PHPMailer GitHub](https://github.com/PHPMailer/PHPMailer)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [Google App Passwords](https://support.google.com/accounts/answer/185833)

---

## 💡 Tips

1. **Test trước khi deploy**: Luôn test với `test_email.php` trước
2. **Sử dụng email riêng**: Nên tạo email riêng cho app, không dùng email cá nhân
3. **Backup App Password**: Lưu lại App Password ở nơi an toàn
4. **Monitor email**: Theo dõi email log để đảm bảo gửi thành công

---

## 🤝 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:

1. ✅ Composer đã cài PHPMailer chưa
2. ✅ File .env có đúng thông tin chưa
3. ✅ App Password có đúng không (16 ký tự, không có dấu cách)
4. ✅ Gmail có bật 2-Step Verification chưa
5. ✅ PHP error log có lỗi gì không

---

**🎉 Chúc bạn cấu hình thành công!**
