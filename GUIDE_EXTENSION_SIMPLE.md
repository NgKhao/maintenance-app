# 🎯 HƯỚNG DẪN THANH TOÁN GIA HẠN HỢP ĐỒNG QUA ZALOPAY

## 📊 LUỒNG XỬ LÝ MỚI

```
User yêu cầu gia hạn (chọn số tháng)
    ↓
Backend tạo extension order (payment_status: pending)
    ↓
Gọi ZaloPay API → Trả về payment_url
    ↓
User thanh toán qua ZaloPay
    ↓
ZaloPay Callback → Cập nhật extension order (payment_status: paid)
    ↓
Tự động tạo contract_request (status: pending)
    ↓
Admin xem yêu cầu → Duyệt/Từ chối
    ↓
Nếu duyệt → Cập nhật end_date của HỢP ĐỒNG GỐC
```

---

## ✅ ĐÃ HOÀN THÀNH

### 1. Database Migration

File: `backend/migrations/add_extension_fields.sql`

- Thêm cột vào `orders`: `is_extension`, `parent_order_id`, `extension_months`
- Thêm cột vào `contract_requests`: `extension_order_id`

**Chạy migration:**

```bash
mysql -u root -p maintenance_app < backend/migrations/add_extension_fields.sql
```

---

### 2. Backend API - `contract_requests.php`

#### ✨ Khi tạo yêu cầu gia hạn (`action=create`, `request_type=extend`):

1. Tạo extension order mới với:

   - `is_extension = 1`
   - `parent_order_id` = ID hợp đồng gốc
   - `extension_months` = Số tháng user chọn
   - `amount` = (package_price / 12) \* extend_months
   - `payment_status = 'pending'`

2. Gọi ZaloPay API để tạo link thanh toán

3. Tạo `contract_request` với:

   - `status = 'pending_payment'` (chờ thanh toán)
   - `extension_order_id` = ID của extension order vừa tạo

4. Trả về `payment_url` cho frontend

#### ✨ Khi admin duyệt (`action=process`, `status=approved`):

1. Kiểm tra `extension_order.payment_status = 'paid'`
2. Nếu chưa thanh toán → Báo lỗi
3. Nếu đã thanh toán → Cập nhật `end_date` của **HỢP ĐỒNG GỐC**

---

### 3. Backend API - `zalopay_callback.php`

#### ✨ Khi nhận callback từ ZaloPay:

1. Cập nhật `payment_status = 'paid'` cho extension order
2. **Kiểm tra nếu là extension order** (`is_extension = 1`):
   - Tìm hoặc tạo `contract_request` với `status = 'pending'`
   - Chuyển status từ `pending_payment` → `pending` (chờ admin duyệt)

---

### 4. Frontend - `ContractsPage.jsx`

#### ✨ Khi user click "Yêu cầu gia hạn":

1. Gọi API `createContractRequest()` với `request_type: 'extend'`
2. Nhận response có `payment_url`
3. **Chuyển hướng user đến ZaloPay:** `window.location.href = response.payment_url`

#### ✨ Hiển thị trạng thái:

- Nếu có request `status = 'pending_payment'` → Hiển thị "Đang chờ thanh toán"
- Nếu có request `status = 'pending'` → Hiển thị "Đang chờ admin duyệt"

---

## 🧪 TEST FLOW

### Test Case 1: Gia hạn thành công

```
1. User login → Trang "Hợp đồng"
2. Click "Yêu cầu gia hạn" → Chọn 12 tháng
3. ✅ Backend tạo extension order (payment_status: pending)
4. ✅ User được chuyển đến ZaloPay
5. User thanh toán thành công
6. ✅ ZaloPay callback → extension order payment_status = 'paid'
7. ✅ Tự động tạo contract_request (status: pending)
8. Admin login → Duyệt yêu cầu
9. ✅ Backend kiểm tra extension order đã paid
10. ✅ Cập nhật end_date của hợp đồng gốc
```

### Test Case 2: Admin duyệt khi chưa thanh toán

```
1. User tạo yêu cầu gia hạn
2. User KHÔNG thanh toán (đóng ZaloPay)
3. Admin cố duyệt yêu cầu
4. ✅ Backend báo lỗi: "Đơn gia hạn chưa được thanh toán"
```

---

## 📝 KIỂM TRA DATABASE

### Xem extension orders:

```sql
SELECT id, user_id, amount, payment_status, is_extension, parent_order_id, extension_months
FROM orders
WHERE is_extension = 1
ORDER BY created_at DESC;
```

### Xem contract requests:

```sql
SELECT cr.id, cr.order_id, cr.request_type, cr.status, cr.extension_order_id,
       o.payment_status as extension_payment_status
FROM contract_requests cr
LEFT JOIN orders o ON cr.extension_order_id = o.id
WHERE cr.request_type = 'extend'
ORDER BY cr.request_date DESC;
```

### Kiểm tra flow hoàn chỉnh:

```sql
-- Hợp đồng gốc
SELECT id, user_id, end_date, amount as 'Giá gốc'
FROM orders
WHERE id = [PARENT_ORDER_ID];

-- Extension order
SELECT id, payment_status, amount as 'Giá gia hạn', extension_months
FROM orders
WHERE parent_order_id = [PARENT_ORDER_ID];

-- Contract request
SELECT id, status, extension_order_id, new_end_date
FROM contract_requests
WHERE order_id = [PARENT_ORDER_ID] AND request_type = 'extend';
```

---

## 🚀 CÁC FILE ĐÃ THAY ĐỔI

### Backend:

- ✅ `backend/api/contract_requests.php` - Tạo extension order + ZaloPay
- ✅ `backend/api/zalopay_callback.php` - Tự động tạo request sau thanh toán
- ✅ `backend/migrations/add_extension_fields.sql` - Database schema

### Frontend:

- ✅ `frontend/src/features/user/pages/ContractsPage.jsx` - Redirect đến ZaloPay

---

## ⚠️ LƯU Ý

1. **Giá gia hạn** được tính theo công thức: `(package_price / 12) * extend_months`
2. **Extension order** là đơn hàng riêng biệt, KHÔNG phải hợp đồng chính
3. **Admin chỉ duyệt sau khi user đã thanh toán**
4. **end_date của hợp đồng gốc** chỉ được cập nhật khi admin approve

---

## 📞 HỖ TRỢ

Nếu có lỗi, kiểm tra:

- ZaloPay logs trong `error_log` của PHP
- Database: `extension_order_id` có khớp không?
- Frontend console: Response có `payment_url` không?

---

**Tóm tắt:** User trả tiền trước → Admin duyệt sau → Hợp đồng được gia hạn ✅
