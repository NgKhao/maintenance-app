# 📋 TÓM TẮT THAY ĐỔI - LUỒNG GIA HẠN HỢP ĐỒNG

## 🎯 YÊU CẦU CỦA BẠN

> "Khách hàng gia hạn → Thanh toán ZaloPay ngay → Admin duyệt/từ chối → Cập nhật end_date"

---

## ✅ GIẢI PHÁP ĐÃ TRIỂN KHAI

### Luồng hoạt động:

```
[1] User click "Yêu cầu gia hạn" → Chọn 12 tháng → Submit
        ↓
[2] Backend tạo extension_order mới (payment_status: pending)
        ↓
[3] Gọi ZaloPay API → Nhận payment_url
        ↓
[4] Frontend redirect user → Thanh toán ZaloPay
        ↓
[5] User thanh toán thành công
        ↓
[6] ZaloPay callback → Cập nhật extension_order.payment_status = 'paid'
        ↓
[7] Callback tự động tạo contract_request (status: 'pending')
        ↓
[8] Admin vào trang quản lý → Thấy yêu cầu gia hạn
        ↓
[9] Admin kiểm tra → Duyệt (approved) hoặc Từ chối (rejected)
        ↓
[10] Backend kiểm tra extension_order đã paid → Cập nhật end_date HỢP ĐỒNG GỐC
```

---

## 📂 CÁC FILE ĐÃ THAY ĐỔI

### 1️⃣ Database Schema

**File:** `backend/migrations/add_extension_fields.sql`

**Thêm vào bảng `orders`:**

- `is_extension` - Đánh dấu đơn gia hạn (1) hay đơn mới (0)
- `parent_order_id` - ID hợp đồng gốc
- `extension_months` - Số tháng gia hạn

**Thêm vào bảng `contract_requests`:**

- `extension_order_id` - ID của extension order (sau khi thanh toán)

**Chạy migration:**

```bash
mysql -u root -p maintenance_app < backend/migrations/add_extension_fields.sql
```

---

### 2️⃣ Backend - Tạo yêu cầu gia hạn

**File:** `backend/api/contract_requests.php`

**Thay đổi trong `action=create`, `request_type=extend`:**

**TRƯỚC ĐÂY (SAI):**

```php
// Chỉ tạo contract_request
INSERT INTO contract_requests (order_id, request_type, extend_months, ...)
```

**BÂY GIỜ (ĐÚNG):**

```php
// 1. Tạo extension order
INSERT INTO orders (
    user_id, package_id, payment_status = 'pending',
    is_extension = 1, parent_order_id, extension_months, ...
)

// 2. Gọi ZaloPay Create Order
$zalopay_result = createZaloPayOrder(...);

// 3. Tạo contract_request với status = 'pending_payment'
INSERT INTO contract_requests (
    order_id, request_type = 'extend',
    extension_order_id, status = 'pending_payment', ...
)

// 4. Trả về payment_url
return { payment_url, extension_order_id, amount }
```

**Key Point:** Tạo ORDER GIA HẠN trước, sau đó mới tạo contract request!

---

### 3️⃣ Backend - Admin duyệt yêu cầu

**File:** `backend/api/contract_requests.php`

**Thay đổi trong `action=process`, `status=approved`:**

**TRƯỚC ĐÂY (SAI):**

```php
// Cập nhật end_date ngay lập tức
UPDATE orders SET end_date = ... WHERE id = order_id
```

**BÂY GIỜ (ĐÚNG):**

```php
// 1. Kiểm tra extension_order_id
if (!$request['extension_order_id']) {
    throw new Exception("Không tìm thấy đơn gia hạn");
}

// 2. Kiểm tra extension order đã thanh toán chưa
SELECT * FROM orders WHERE id = extension_order_id;
if ($extension_order['payment_status'] !== 'paid') {
    throw new Exception("Đơn gia hạn chưa được thanh toán");
}

// 3. Chỉ cập nhật end_date của HỢP ĐỒNG GỐC nếu đã thanh toán
UPDATE orders SET end_date = ... WHERE id = parent_order_id
```

**Key Point:** PHẢI kiểm tra thanh toán trước khi duyệt!

---

### 4️⃣ Backend - ZaloPay Callback

**File:** `backend/api/zalopay_callback.php`

**Thêm logic sau khi cập nhật payment_status:**

```php
// Sau khi: UPDATE orders SET payment_status = 'paid' ...

// Kiểm tra nếu là extension order
if ($order['is_extension'] == 1) {
    // Kiểm tra đã có contract_request chưa
    $exists = /* Query */;

    if (!$exists) {
        // Tạo contract_request mới với status = 'pending'
        INSERT INTO contract_requests (
            order_id = parent_order_id,
            request_type = 'extend',
            extension_order_id,
            status = 'pending', ...
        )
    } else {
        // Cập nhật status từ 'pending_payment' → 'pending'
        UPDATE contract_requests
        SET status = 'pending'
        WHERE extension_order_id = ? AND status = 'pending_payment'
    }
}
```

**Key Point:** Sau thanh toán → Tự động tạo/cập nhật request cho admin!

---

### 5️⃣ Frontend - Redirect đến ZaloPay

**File:** `frontend/src/features/user/pages/ContractsPage.jsx`

**Thay đổi trong `handleRequestSubmit()`:**

**TRƯỚC ĐÂY:**

```jsx
await createContractRequest(requestData);
// Chỉ hiển thị thông báo thành công
```

**BÂY GIỜ:**

```jsx
const response = await createContractRequest(requestData);

// Nếu là gia hạn → Redirect đến ZaloPay
if (requestForm.type === 'extend' && response.payment_url) {
  alert(`Số tiền: ${response.amount.toLocaleString('vi-VN')} VNĐ`);
  window.location.href = response.payment_url; // 👈 CHUYỂN ĐẾN ZALOPAY
  return;
}
```

**Cập nhật `hasPendingRequest()`:**

```jsx
// Kiểm tra cả 'pending' và 'pending_payment'
return userRequests.some(
  (req) =>
    req.order_id === contractId &&
    (req.status === 'pending' || req.status === 'pending_payment')
);
```

**Key Point:** User không thấy form request nữa, mà đi thẳng đến ZaloPay!

---

## 🔄 SO SÁNH 2 LUỒNG

### ❌ Luồng CŨ (SAI theo yêu cầu):

```
User yêu cầu → Tạo request → Admin duyệt → Cập nhật end_date
(KHÔNG CÓ THANH TOÁN!)
```

### ✅ Luồng MỚI (ĐÚNG theo yêu cầu):

```
User yêu cầu → Tạo extension order → Thanh toán ZaloPay →
Tạo request tự động → Admin duyệt (kiểm tra đã paid) → Cập nhật end_date
```

---

## 🎯 ĐIỂM KHÁC BIỆT QUAN TRỌNG

| Khía cạnh           | Luồng cũ        | Luồng mới                                |
| ------------------- | --------------- | ---------------------------------------- |
| **Thanh toán**      | Không có        | ✅ ZaloPay trước khi admin duyệt         |
| **Extension order** | Không có        | ✅ Tạo order riêng (is_extension=1)      |
| **Giá gia hạn**     | Không tính      | ✅ Tính theo tháng: (price/12) \* months |
| **User experience** | Chờ admin duyệt | ✅ Trả tiền → Chờ admin xác nhận         |
| **Admin kiểm tra**  | Không có        | ✅ PHẢI kiểm tra payment_status          |

---

## 🧪 TEST NGAY SAU KHI TRIỂN KHAI

1. **Chạy migration:**

   ```bash
   mysql -u root -p maintenance_app < backend/migrations/add_extension_fields.sql
   ```

2. **Kiểm tra database:**

   ```sql
   DESCRIBE orders; -- Kiểm tra có cột is_extension, parent_order_id
   DESCRIBE contract_requests; -- Kiểm tra có cột extension_order_id
   ```

3. **Test flow:**
   - User login → Hợp đồng → Yêu cầu gia hạn 12 tháng
   - ✅ Có chuyển đến ZaloPay?
   - ✅ Sau thanh toán, có tạo contract_request?
   - Admin login → Duyệt yêu cầu
   - ✅ end_date của hợp đồng gốc có tăng thêm 12 tháng?

---

## 📞 TROUBLESHOOTING

**Lỗi:** "Không tìm thấy đơn gia hạn"
→ Kiểm tra: `contract_requests.extension_order_id` có giá trị?

**Lỗi:** "Đơn gia hạn chưa được thanh toán"
→ Kiểm tra: `orders.payment_status` của extension order = 'paid'?

**Không redirect đến ZaloPay:**
→ Kiểm tra: Response có `payment_url`? Console có lỗi?

**Admin duyệt nhưng end_date không đổi:**
→ Kiểm tra: Backend có update đúng `parent_order_id`?

---

## ✅ CHECKLIST

- [x] Migration database
- [x] Backend: Tạo extension order khi user yêu cầu
- [x] Backend: Gọi ZaloPay API
- [x] Backend: Kiểm tra thanh toán khi admin duyệt
- [x] Backend: Callback tự động tạo contract_request
- [x] Frontend: Redirect user đến ZaloPay
- [x] Frontend: Hiển thị trạng thái "Chờ thanh toán"
- [x] Tạo file hướng dẫn đơn giản

---

**🎉 HOÀN THÀNH!** Luồng đã đúng với yêu cầu của bạn:
**User trả tiền → Admin duyệt → Hợp đồng gia hạn**
