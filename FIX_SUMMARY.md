# 🔧 FIX 2 VẤN ĐỀ

## ✅ Vấn đề 1: Alert không đẹp

**Đã sửa:** Bỏ alert, chuyển thẳng đến ZaloPay

**File:** `frontend/src/features/user/pages/ContractsPage.jsx`

**Trước:**

```jsx
alert(`Yêu cầu gia hạn đã tạo!...`);
window.location.href = response.payment_url;
```

**Sau:**

```jsx
window.location.href = response.payment_url; // Chuyển thẳng, không alert
```

---

## ✅ Vấn đề 2: Database thiếu dữ liệu

### Nguyên nhân gốc rễ:

1. **ENUM status** không hỗ trợ `'pending_payment'` → Gây ra `status = ''` (rỗng)
2. **Callback** ban đầu tạo request mới thay vì cập nhật request cũ

### Đã fix:

#### 1. Migration - Cập nhật ENUM

**File:** `backend/migrations/add_extension_fields.sql`

```sql
ALTER TABLE contract_requests
MODIFY COLUMN status ENUM('pending', 'pending_payment', 'approved', 'rejected') DEFAULT 'pending';
```

#### 2. Callback - Chỉ UPDATE status

**File:** `backend/api/zalopay_callback.php`

**Trước:** Tạo request mới (thiếu data)
**Sau:** UPDATE request có sẵn (giữ nguyên data)

```php
UPDATE contract_requests
SET status = 'pending', request_date = NOW()
WHERE extension_order_id = ? AND status = 'pending_payment'
```

---

## 🚀 CHẠY MIGRATION

```bash
mysql -u root -p maintenance_app < backend/migrations/add_extension_fields.sql
```

---

## 📊 KẾT QUẢ SAU KHI FIX

### Luồng đầy đủ với dữ liệu:

**1. User tạo yêu cầu:**

```
status: 'pending_payment' ✅
note: [User's note] ✅
extend_months: 6 ✅
old_end_date: 2026-10-23 ✅
extension_order_id: 34 ✅
```

**2. User thanh toán:**

```
status: 'pending' (đã đổi từ pending_payment) ✅
note: [User's note] (GIỮ NGUYÊN) ✅
extend_months: 6 (GIỮ NGUYÊN) ✅
old_end_date: 2026-10-23 (GIỮ NGUYÊN) ✅
extension_order_id: 34 (GIỮ NGUYÊN) ✅
```

**3. Admin duyệt:**

```
status: 'approved' ✅
admin_id: 1 ✅
admin_note: "Đồng ý" ✅
processed_date: NOW() ✅
new_end_date: 2027-04-23 ✅
```

---

## ✅ CHECKLIST

- [x] Bỏ alert, chuyển thẳng ZaloPay
- [x] Fix callback: UPDATE thay vì INSERT
- [x] Cập nhật ENUM status với 'pending_payment'
- [x] Tạo file DEBUG để trace flow
- [ ] **CHẠY MIGRATION** (bạn cần thực hiện)
- [ ] Test flow đầy đủ

---

## 🎯 TẠI SAO BẠN THẤY DATA THIẾU?

Database dump bạn gửi:

```sql
(9, 33, '2025-10-23 17:31:50', '', '', 'extend', NULL, 6, NULL, NULL, NULL, NULL, '2026-10-23', NULL, 34)
```

- `status = ''` → Do ENUM không hỗ trợ 'pending_payment'
- `note = ''` → User không nhập note (hợp lệ)
- `admin_id, admin_note, processed_date, new_end_date = NULL` → **CHƯA DUYỆT** (hợp lệ)

**Sau khi fix và admin duyệt, sẽ đầy đủ!** ✅
