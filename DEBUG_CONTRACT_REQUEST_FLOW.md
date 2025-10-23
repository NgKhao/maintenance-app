# 🔍 DEBUG: LUỒNG GIA HẠN VÀ CẤU TRÚC DATABASE

## 📊 CẤU TRÚC BẢNG `contract_requests`

### Các trường và nguồn dữ liệu:

| Trường               | Nguồn                                                 | Thời điểm                       |
| -------------------- | ----------------------------------------------------- | ------------------------------- |
| `id`                 | AUTO_INCREMENT                                        | Tự động                         |
| `order_id`           | User chọn hợp đồng                                    | Khi tạo request                 |
| `request_date`       | NOW()                                                 | Khi tạo request (hoặc callback) |
| `status`             | 'pending_payment' → 'pending' → 'approved'/'rejected' | Thay đổi qua flow               |
| `note`               | User nhập                                             | ✅ Khi tạo request              |
| `request_type`       | 'extend'                                              | ✅ Khi tạo request              |
| `extend_package_id`  | ❌ KHÔNG DÙNG (dùng package_id của order gốc)         | N/A                             |
| `extend_months`      | User chọn (3/6/12/24)                                 | ✅ Khi tạo request              |
| `requested_end_date` | NULL (chỉ dùng cho terminate)                         | N/A                             |
| `admin_id`           | Admin ID                                              | ⏳ Khi admin duyệt              |
| `admin_note`         | Admin nhập                                            | ⏳ Khi admin duyệt              |
| `processed_date`     | NOW()                                                 | ⏳ Khi admin duyệt              |
| `old_end_date`       | order.end_date                                        | ✅ Khi tạo request              |
| `new_end_date`       | old_end_date + extend_months                          | ⏳ Khi admin duyệt              |
| `extension_order_id` | ID của extension order                                | ✅ Khi tạo request              |

---

## 🔄 LUỒNG CHI TIẾT

### Bước 1: User tạo yêu cầu gia hạn

**File:** `contract_requests.php` → `action=create`, `request_type=extend`

```sql
-- Tạo extension order
INSERT INTO orders (
    user_id, package_id, payment_status='pending',
    is_extension=1, parent_order_id, extension_months, amount, app_trans_id
) VALUES (...)

-- Tạo contract_request
INSERT INTO contract_requests (
    order_id,              -- ✅ ID hợp đồng gốc
    request_type,          -- ✅ 'extend'
    note,                  -- ✅ Từ user
    extend_months,         -- ✅ 6 tháng
    old_end_date,          -- ✅ 2026-10-23
    extension_order_id,    -- ✅ 34
    status                 -- ✅ 'pending_payment'
) VALUES (...)
```

**Kết quả sau bước 1:**

```
id: 9
order_id: 33
request_type: extend
status: pending_payment
note: [User's note]
extend_months: 6
old_end_date: 2026-10-23
extension_order_id: 34
admin_id: NULL (chưa có)
admin_note: NULL (chưa có)
processed_date: NULL (chưa có)
new_end_date: NULL (chưa có)
```

---

### Bước 2: User thanh toán ZaloPay

**File:** `zalopay_callback.php`

```sql
-- Cập nhật extension order
UPDATE orders
SET payment_status = 'paid', zalo_trans_id = ?, paid_at = NOW()
WHERE app_trans_id = ?

-- Cập nhật contract_request
UPDATE contract_requests
SET status = 'pending', request_date = NOW()
WHERE extension_order_id = ? AND status = 'pending_payment'
```

**Kết quả sau bước 2:**

```
id: 9
order_id: 33
request_type: extend
status: pending (đã đổi từ pending_payment)
note: [User's note] (GIỮ NGUYÊN)
extend_months: 6 (GIỮ NGUYÊN)
old_end_date: 2026-10-23 (GIỮ NGUYÊN)
extension_order_id: 34 (GIỮ NGUYÊN)
admin_id: NULL (vẫn chưa có)
admin_note: NULL (vẫn chưa có)
processed_date: NULL (vẫn chưa có)
new_end_date: NULL (vẫn chưa có)
```

---

### Bước 3: Admin duyệt yêu cầu

**File:** `contract_requests.php` → `action=process`, `status=approved`

```sql
-- Kiểm tra extension order đã paid
SELECT * FROM orders WHERE id = extension_order_id AND payment_status = 'paid'

-- Tính new_end_date
new_end_date = DATE_ADD(old_end_date, INTERVAL extend_months MONTH)

-- Cập nhật hợp đồng GỐC
UPDATE orders
SET end_date = new_end_date
WHERE id = order_id (parent_order_id)

-- Cập nhật contract_request
UPDATE contract_requests
SET status = 'approved',
    admin_id = ?,
    admin_note = ?,
    processed_date = NOW(),
    new_end_date = ?
WHERE id = ?
```

**Kết quả sau bước 3:**

```
id: 9
order_id: 33
request_type: extend
status: approved (đã đổi từ pending)
note: [User's note] (GIỮ NGUYÊN)
extend_months: 6 (GIỮ NGUYÊN)
old_end_date: 2026-10-23 (GIỮ NGUYÊN)
extension_order_id: 34 (GIỮ NGUYÊN)
requested_end_date: NULL (không dùng cho extend)
admin_id: 1 (✅ ĐÃ CÓ)
admin_note: "Đồng ý gia hạn" (✅ ĐÃ CÓ)
processed_date: 2025-10-24 12:00:00 (✅ ĐÃ CÓ)
new_end_date: 2027-04-23 (✅ ĐÃ CÓ)
```

---

## 🐛 VẤN ĐỀ BẠN GẶP PHẢI

Từ database dump bạn cung cấp:

```sql
(9, 33, '2025-10-23 17:31:50', '', '', 'extend', NULL, 6, NULL, NULL, NULL, NULL, '2026-10-23', NULL, 34)
```

**Phân tích:**

- `status` = '' (RỖNG!) → Lỗi ở bước tạo hoặc callback
- `note` = '' (RỖNG!) → User không nhập note
- `extend_months` = 6 ✅
- `old_end_date` = '2026-10-23' ✅
- `extension_order_id` = 34 ✅
- `admin_id`, `admin_note`, `processed_date`, `new_end_date` = NULL (CHƯA DUYỆT) ✅

---

## ✅ NGUYÊN NHÂN GỐC RỄ

### 1. `status` = '' (rỗng)

**Nguyên nhân:** Có thể do:

- Database schema định nghĩa ENUM('pending', 'approved', 'rejected') không có 'pending_payment'
- INSERT statement dùng giá trị không hợp lệ

**Giải pháp:** Cập nhật ENUM trong database:

```sql
ALTER TABLE contract_requests
MODIFY COLUMN status ENUM('pending', 'pending_payment', 'approved', 'rejected') DEFAULT 'pending';
```

### 2. `note` = '' (rỗng)

**Nguyên nhân:** User không nhập ghi chú (optional field)
**Giải pháp:** Không cần fix, đây là hành vi hợp lệ

### 3. `extend_package_id` = NULL

**Nguyên nhân:** Không được lưu trong INSERT statement
**Giải pháp:** Không cần thiết vì ta dùng `package_id` từ order gốc

### 4. Admin fields NULL

**Nguyên nhân:** Admin chưa duyệt
**Giải pháp:** Chờ admin duyệt, các trường này sẽ được điền

---

## 🔧 FIX NGAY

### Fix 1: Cập nhật ENUM để hỗ trợ 'pending_payment'

```sql
ALTER TABLE contract_requests
MODIFY COLUMN status ENUM('pending', 'pending_payment', 'approved', 'rejected') DEFAULT 'pending';
```

### Fix 2: Đảm bảo INSERT luôn có status hợp lệ

File: `contract_requests.php` - Đã đúng:

```php
INSERT INTO contract_requests (
    ..., status
) VALUES (?, 'pending_payment')  -- ✅ Rõ ràng
```

### Fix 3: Callback chỉ UPDATE status

File: `zalopay_callback.php` - Đã sửa:

```php
UPDATE contract_requests
SET status = 'pending'  -- Chỉ đổi status, giữ nguyên các trường khác
WHERE extension_order_id = ?
```

---

## 🧪 TEST SAU KHI FIX

1. Chạy ALTER TABLE để cập nhật ENUM
2. User tạo yêu cầu gia hạn mới
3. Kiểm tra database:

```sql
SELECT id, order_id, status, note, extend_months, old_end_date, extension_order_id
FROM contract_requests
WHERE id = [NEW_ID];
```

**Expected result:**

- `status` = 'pending_payment' (sau tạo) hoặc 'pending' (sau thanh toán)
- `note` = User's note hoặc ''
- `extend_months` = 6/12/...
- `old_end_date` = Ngày hết hạn hiện tại
- `extension_order_id` = ID của extension order

4. Admin duyệt
5. Kiểm tra lại:

```sql
SELECT *
FROM contract_requests
WHERE id = [NEW_ID];
```

**Expected result:**

- `status` = 'approved'
- `admin_id` = Admin ID
- `admin_note` = Admin's note
- `processed_date` = NOW()
- `new_end_date` = old_end_date + extend_months

---

## 📝 KẾT LUẬN

**Vấn đề 1 (Alert):** ✅ Đã fix - Chuyển thẳng đến ZaloPay
**Vấn đề 2 (Database):**

- ✅ `extend_months`, `old_end_date`, `extension_order_id` - Đã đúng
- ⚠️ `status` = '' - Cần chạy ALTER TABLE để hỗ trợ 'pending_payment'
- ✅ `admin_id`, `admin_note`, `processed_date`, `new_end_date` - Sẽ được điền khi admin duyệt

**Action items:**

1. ✅ Đã sửa code (bỏ alert, fix callback)
2. ⏳ Chạy migration để cập nhật ENUM status
3. ⏳ Test flow đầy đủ từ đầu
