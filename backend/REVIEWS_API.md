# 📊 Reviews API - Đánh giá kỹ thuật viên

## API đơn giản cho chức năng đánh giá

---

## 📦 1. Setup Database

Chạy file migration:

```sql
-- File: migrations/add_reviews_table.sql
```

Tạo bảng `reviews` với các trường:

- `schedule_id` - ID lịch (UNIQUE)
- `user_id` - Khách hàng đánh giá
- `technician_id` - KTV được đánh giá
- `rating` - Điểm 1-5
- `comment` - Nhận xét

---

## 🔌 2. API Endpoints

### **POST /api/reviews.php** - Khách hàng tạo đánh giá

**Request:**

```json
{
  "schedule_id": 1,
  "user_id": 2,
  "rating": 5,
  "comment": "Rất tốt!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Đánh giá thành công"
}
```

**Business Rules:**

- Chỉ đánh giá khi status = 'completed'
- Mỗi lịch chỉ đánh giá 1 lần
- Rating từ 1-5

---

### **GET /api/reviews.php?technician_id=7** - Xem đánh giá của KTV

**Response:**

```json
[
  {
    "id": 1,
    "rating": 5,
    "comment": "Tốt",
    "user_name": "Nguyễn Văn A",
    "scheduled_date": "2025-10-13",
    "device_name": "Bếp điện",
    "created_at": "2025-10-14 10:00:00"
  }
]
```

**Dùng cho:**

- Technician xem đánh giá của mình
- Admin xem đánh giá của từng KTV

---

### **GET /api/technician_stats.php** - Thống kê tất cả KTV (Admin)

**Response:**

```json
[
  {
    "id": 7,
    "name": "Khaoo",
    "total_schedules": 15,
    "completed_schedules": 12,
    "total_reviews": 10,
    "average_rating": 4.8
  }
]
```

---

## 🎯 3. Use Cases

### UC1: Khách hàng đánh giá

```
1. Lịch completed
2. Hiện form đánh giá
3. POST /api/reviews.php
```

### UC2: Technician xem đánh giá của mình

```
1. Vào trang "Đánh giá của tôi"
2. GET /api/reviews.php?technician_id=currentUser.id
```

### UC3: Admin xem đánh giá của KTV

```
1. Vào trang danh sách KTV
2. GET /api/technician_stats.php (overview)
3. Click vào KTV
4. GET /api/reviews.php?technician_id=X (chi tiết)
```

---

## 📝 4. Frontend Integration

```javascript
// Tạo đánh giá
const createReview = async (scheduleId, rating, comment) => {
  await axios.post('/api/reviews.php', {
    schedule_id: scheduleId,
    user_id: currentUser.id,
    rating,
    comment,
  });
};

// Xem đánh giá của KTV
const getReviews = async (technicianId) => {
  const { data } = await axios.get('/api/reviews.php', {
    params: { technician_id: technicianId },
  });
  return data;
};

// Thống kê KTV (admin)
const getTechnicianStats = async () => {
  const { data } = await axios.get('/api/technician_stats.php');
  return data;
};
```

---

**🎉 Đơn giản, đủ dùng!**

## Hệ thống đánh giá kỹ thuật viên

### 🎯 Tổng quan

Chức năng cho phép khách hàng đánh giá kỹ thuật viên sau khi hoàn thành bảo trì.

---

## 📦 Database Setup

### 1. Chạy migration để tạo bảng reviews:

```sql
-- File: migrations/add_reviews_table.sql
-- Chạy trong phpMyAdmin hoặc MySQL client
```

**Cấu trúc bảng `reviews`:**

- `id` - Primary key
- `schedule_id` - ID lịch bảo trì (UNIQUE - mỗi lịch chỉ đánh giá 1 lần)
- `user_id` - ID khách hàng đánh giá
- `technician_id` - ID kỹ thuật viên được đánh giá
- `rating` - Điểm từ 1-5 sao
- `comment` - Nhận xét (optional)
- `created_at` - Thời gian tạo

**View `technician_ratings`:**

- Tự động tính toán thống kê đánh giá cho từng kỹ thuật viên

---

## 🔌 API Endpoints

### 1️⃣ **POST /api/reviews.php** - Tạo đánh giá mới

**Request Body:**

```json
{
  "schedule_id": 1,
  "user_id": 2,
  "rating": 5,
  "comment": "Kỹ thuật viên rất tận tâm và chuyên nghiệp"
}
```

**Response Success (201):**

```json
{
  "success": true,
  "message": "Đánh giá thành công",
  "review": {
    "id": 1,
    "schedule_id": 1,
    "user_id": 2,
    "technician_id": 7,
    "rating": 5,
    "comment": "Kỹ thuật viên rất tận tâm và chuyên nghiệp",
    "user_name": "Nguyễn Văn A",
    "technician_name": "Khaoo",
    "created_at": "2025-10-14 10:30:00"
  }
}
```

**Validation Rules:**

- ✅ `schedule_id`, `user_id`, `rating` bắt buộc
- ✅ `rating` phải từ 1-5
- ✅ Chỉ khách hàng của lịch mới được đánh giá
- ✅ Lịch phải có status = 'completed'
- ✅ Mỗi lịch chỉ đánh giá được 1 lần

**Error Responses:**

```json
// 400 - Thiếu thông tin
{
  "error": "Thiếu thông tin bắt buộc: schedule_id, user_id, rating"
}

// 400 - Rating không hợp lệ
{
  "error": "Rating phải từ 1-5"
}

// 403 - Không có quyền
{
  "error": "Bạn không có quyền đánh giá lịch này"
}

// 400 - Lịch chưa hoàn thành
{
  "error": "Chỉ có thể đánh giá sau khi lịch bảo trì hoàn thành",
  "current_status": "in_progress"
}

// 400 - Đã đánh giá rồi
{
  "error": "Lịch này đã được đánh giá rồi"
}
```

---

### 2️⃣ **GET /api/reviews.php** - Lấy danh sách đánh giá

**Query Parameters:**

- `id` - Lấy chi tiết 1 đánh giá
- `user_id` - Filter theo khách hàng
- `technician_id` - Filter theo kỹ thuật viên
- `schedule_id` - Filter theo lịch
- `rating` - Filter theo điểm đánh giá

**Examples:**

```bash
# Lấy tất cả đánh giá
GET /api/reviews.php

# Lấy đánh giá của 1 kỹ thuật viên
GET /api/reviews.php?technician_id=7

# Lấy đánh giá 5 sao
GET /api/reviews.php?rating=5

# Lấy đánh giá của khách hàng
GET /api/reviews.php?user_id=2

# Lấy chi tiết 1 đánh giá
GET /api/reviews.php?id=1
```

**Response:**

```json
[
  {
    "id": 1,
    "schedule_id": 1,
    "user_id": 2,
    "technician_id": 7,
    "rating": 5,
    "comment": "Tuyệt vời",
    "created_at": "2025-10-14 10:30:00",
    "user_name": "Nguyễn Văn A",
    "user_email": "user1@example.com",
    "technician_name": "Khaoo",
    "technician_email": "111@gmail.com",
    "scheduled_date": "2025-10-13",
    "device_name": "Bếp điện",
    "serial_number": "1111111110"
  }
]
```

---

### 3️⃣ **PUT /api/reviews.php** - Cập nhật đánh giá

**⚠️ Lưu ý:** Chỉ cho phép sửa trong vòng 24 giờ sau khi tạo

**Request Body:**

```json
{
  "id": 1,
  "user_id": 2,
  "rating": 4,
  "comment": "Nhìn chung tốt, nhưng đến hơi muộn"
}
```

**Response Success:**

```json
{
  "success": true,
  "message": "Cập nhật đánh giá thành công",
  "review": {
    "id": 1,
    "rating": 4,
    "comment": "Nhìn chung tốt, nhưng đến hơi muộn",
    "user_name": "Nguyễn Văn A",
    "technician_name": "Khaoo"
  }
}
```

**Error - Quá thời gian sửa:**

```json
{
  "error": "Chỉ có thể sửa đánh giá trong vòng 24 giờ",
  "hours_since_created": 30
}
```

---

### 4️⃣ **DELETE /api/reviews.php** - Xóa đánh giá

**⚠️ Admin only**

**Query Parameters:**

- `id` - ID đánh giá cần xóa
- `admin_id` - ID của admin

```bash
DELETE /api/reviews.php?id=1&admin_id=1
```

**Response:**

```json
{
  "success": true,
  "message": "Xóa đánh giá thành công"
}
```

---

### 5️⃣ **GET /api/technician_stats.php** - Thống kê kỹ thuật viên

**Query Parameters:**

- `technician_id` (optional) - Thống kê chi tiết 1 kỹ thuật viên

**Examples:**

```bash
# Thống kê tất cả kỹ thuật viên
GET /api/technician_stats.php

# Thống kê 1 kỹ thuật viên
GET /api/technician_stats.php?technician_id=7
```

**Response - Tất cả kỹ thuật viên:**

```json
[
  {
    "id": 7,
    "name": "Khaoo",
    "email": "111@gmail.com",
    "phone": null,
    "active": 1,
    "total_schedules": 15,
    "completed_schedules": 12,
    "total_reviews": 10,
    "average_rating": 4.8,
    "five_star_count": 8,
    "positive_reviews": 10
  }
]
```

**Response - Chi tiết 1 kỹ thuật viên:**

```json
{
  "id": 7,
  "name": "Khaoo",
  "email": "111@gmail.com",
  "phone": null,
  "total_schedules": 15,
  "completed_schedules": 12,
  "in_progress_schedules": 2,
  "total_reviews": 10,
  "average_rating": 4.8,
  "five_star_count": 8,
  "four_star_count": 2,
  "three_star_count": 0,
  "two_star_count": 0,
  "one_star_count": 0,
  "recent_reviews": [
    {
      "id": 3,
      "rating": 5,
      "comment": "Rất hài lòng với dịch vụ",
      "user_name": "Nguyễn A",
      "device_name": "Bếp điện",
      "scheduled_date": "2025-09-14",
      "created_at": "2025-09-15 10:00:00"
    }
  ]
}
```

---

## 🔒 Security Features

### ✅ Implemented:

1. **Validation**: Kiểm tra rating 1-5, required fields
2. **Authorization**: Chỉ khách hàng của lịch mới được đánh giá
3. **Status Check**: Chỉ đánh giá lịch đã completed
4. **Unique Constraint**: Mỗi lịch chỉ đánh giá 1 lần
5. **Time Limit**: Chỉ sửa trong 24h
6. **Admin Only**: Chỉ admin mới xóa được

### 🔐 Foreign Key Constraints:

- `fk_reviews_schedule` - Xóa lịch → xóa đánh giá
- `fk_reviews_user` - Xóa user → xóa đánh giá của user đó
- `fk_reviews_technician` - Xóa technician → xóa đánh giá về technician

---

## 📊 Use Cases

### Use Case 1: Khách hàng đánh giá sau khi hoàn thành

```javascript
// Frontend flow
1. Lịch bảo trì completed
2. Hiện button "Đánh giá"
3. User chọn rating và nhập comment
4. POST /api/reviews.php
5. Hiển thị thông báo thành công
```

### Use Case 2: Xem đánh giá kỹ thuật viên

```javascript
// Frontend flow
1. Vào trang profile kỹ thuật viên
2. GET /api/technician_stats.php?technician_id=7
3. Hiển thị:
   - Average rating (4.8 ⭐)
   - Total reviews (10 đánh giá)
   - Star distribution
   - Recent reviews
```

### Use Case 3: Admin quản lý đánh giá

```javascript
// Frontend flow
1. GET /api/reviews.php (lấy tất cả)
2. Filter theo rating thấp
3. Xem chi tiết đánh giá xấu
4. DELETE nếu vi phạm (spam, offensive)
```

---

## 🧪 Testing

### Test Case 1: Tạo đánh giá thành công

```bash
curl -X POST http://localhost:8000/api/reviews.php \
  -H "Content-Type: application/json" \
  -d '{
    "schedule_id": 1,
    "user_id": 2,
    "rating": 5,
    "comment": "Rất tốt!"
  }'
```

### Test Case 2: Lỗi - Lịch chưa hoàn thành

```bash
curl -X POST http://localhost:8000/api/reviews.php \
  -H "Content-Type: application/json" \
  -d '{
    "schedule_id": 2,
    "user_id": 2,
    "rating": 5
  }'
# Expected: Error "Chỉ có thể đánh giá sau khi lịch bảo trì hoàn thành"
```

### Test Case 3: Thống kê kỹ thuật viên

```bash
curl http://localhost:8000/api/technician_stats.php?technician_id=7
```

---

## 📝 Frontend Integration Example

```javascript
// services/reviews.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const createReview = async (reviewData) => {
  const response = await axios.post(`${API_URL}/reviews.php`, reviewData);
  return response.data;
};

export const getReviews = async (filters = {}) => {
  const response = await axios.get(`${API_URL}/reviews.php`, {
    params: filters,
  });
  return response.data;
};

export const getTechnicianStats = async (technicianId) => {
  const response = await axios.get(`${API_URL}/technician_stats.php`, {
    params: { technician_id: technicianId },
  });
  return response.data;
};

// Usage in component
const handleSubmitReview = async () => {
  try {
    const result = await createReview({
      schedule_id: scheduleId,
      user_id: currentUser.id,
      rating: selectedRating,
      comment: reviewComment,
    });

    alert('Đánh giá thành công!');
    // Refresh or navigate
  } catch (error) {
    alert(error.response?.data?.error || 'Có lỗi xảy ra');
  }
};
```

---

## 🎨 UI Suggestions

### Rating Component:

```jsx
<Box>
  <Rating
    value={rating}
    onChange={(e, newValue) => setRating(newValue)}
    size='large'
  />
  <TextField
    multiline
    rows={4}
    placeholder='Chia sẻ trải nghiệm của bạn...'
    value={comment}
    onChange={(e) => setComment(e.target.value)}
  />
  <Button onClick={handleSubmit}>Gửi đánh giá</Button>
</Box>
```

---

## 📈 Business Metrics

Các metrics có thể track:

- ✅ Average rating per technician
- ✅ Total reviews count
- ✅ Star distribution (5⭐, 4⭐, ...)
- ✅ Completion rate (schedules completed / total)
- ✅ Customer satisfaction rate (4-5 star reviews / total)
- ✅ Trending (rating tăng/giảm theo thời gian)

---

## 🚀 Future Enhancements

1. **Photos**: Cho phép khách hàng đính kèm ảnh
2. **Reply**: Kỹ thuật viên trả lời đánh giá
3. **Report**: Báo cáo đánh giá không phù hợp
4. **Helpful votes**: User khác vote đánh giá hữu ích
5. **Verified badge**: Đánh giá từ khách hàng đã xác thực

---

**🎉 API đã sẵn sàng sử dụng!**

Bạn chỉ cần:

1. ✅ Chạy migration SQL
2. ✅ Tích hợp vào Frontend
3. ✅ Test các endpoints
