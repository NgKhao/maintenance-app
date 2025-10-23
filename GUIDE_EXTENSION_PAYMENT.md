# 📘 HƯỚNG DẪN TRIỂN KHAI THANH TOÁN GIA HẠN HỢP ĐỒNG QUA ZALOPAY

## 🎯 MỤC TIÊU

Thêm chức năng thanh toán qua ZaloPay khi khách hàng gia hạn hợp đồng, tương tự như khi đăng ký mới.

---

## 📊 PHÂN TÍCH FLOW HIỆN TẠI

### ✅ Flow ĐĂNG KÝ MỚI (Đã có):

```
User → Chọn gói → registerService()
→ orders.php (POST)
→ Tạo order (payment_status: pending)
→ ZaloPay Create API
→ Trả về payment_url
→ User thanh toán
→ ZaloPay Callback
→ Update payment_status = 'paid'
```

### ❌ Flow GIA HẠN (Hiện tại - THIẾU thanh toán):

```
User → Yêu cầu gia hạn (12 tháng)
→ createContractRequest()
→ contract_requests.php (status: pending)
→ Admin duyệt
→ processContractRequest()
→ ❌ CẬP NHẬT end_date TRỰC TIẾP (KHÔNG CÓ THANH TOÁN!)
```

### ✅ Flow GIA HẠN MỚI (Có ZaloPay):

```
User → Yêu cầu gia hạn (12 tháng)
→ createContractRequest()
→ contract_requests.php (status: pending)
→ Admin duyệt (approved)
→ ✨ TẠO ORDER GIA HẠN MỚI (payment_status: pending, is_extension: true)
→ ✨ GỌI ZaloPay Create API
→ ✨ TRẢ VỀ payment_url CHO USER
→ User vào trang "Hợp đồng" → Thấy order gia hạn chờ thanh toán
→ Click thanh toán → Mở ZaloPay
→ Thanh toán thành công
→ ZaloPay Callback
→ Update order gia hạn: payment_status = 'paid'
→ ✨ TRIGGER: Cập nhật end_date của hợp đồng gốc
```

---

## 🗄️ BƯỚC 1: CẬP NHẬT DATABASE

### File: `backend/migrations/add_extension_fields.sql`

```sql
-- 1. Thêm cột vào bảng orders
ALTER TABLE orders
ADD COLUMN is_extension TINYINT(1) DEFAULT 0 COMMENT '1 = Đơn gia hạn, 0 = Đơn mới',
ADD COLUMN parent_order_id INT NULL COMMENT 'ID của hợp đồng gốc',
ADD COLUMN extension_months INT NULL COMMENT 'Số tháng gia hạn',
ADD INDEX idx_parent_order (parent_order_id),
ADD FOREIGN KEY (parent_order_id) REFERENCES orders(id) ON DELETE CASCADE;

-- 2. Thêm cột vào contract_requests
ALTER TABLE contract_requests
ADD COLUMN extension_order_id INT NULL COMMENT 'ID của order gia hạn',
ADD INDEX idx_extension_order (extension_order_id),
ADD FOREIGN KEY (extension_order_id) REFERENCES orders(id) ON DELETE SET NULL;
```

**Chạy migration:**

```bash
mysql -u root -p maintenance_app < backend/migrations/add_extension_fields.sql
```

---

## 🔧 BƯỚC 2: CẬP NHẬT BACKEND API

### 2.1. File: `backend/api/contract_requests.php`

**Sửa phần xử lý EXTEND khi Admin duyệt:**

```php
if ($status === 'approved') {
    if ($request['request_type'] === 'extend') {
        // ===== GIA HẠN HỢP ĐỒNG =====
        $extend_months = $request['extend_months'] ?: 12;

        // ✨ THAY ĐỔI: Tạo order gia hạn thay vì cập nhật trực tiếp

        // 1. Lấy thông tin gói gốc
        $stmt = $pdo->prepare("
            SELECT o.*, p.price, p.name as package_name
            FROM orders o
            JOIN maintenancepackages p ON o.package_id = p.id
            WHERE o.id = ?
        ");
        $stmt->execute([$request['order_id']]);
        $parent_order = $stmt->fetch();

        // 2. Tính tiền gia hạn (giá gốc * số tháng / 12)
        $extension_price = ($parent_order['price'] / 12) * $extend_months;

        // 3. Tạo app_trans_id mới
        $app_trans_id = 'EXT_' . date('ymd') . '_' . $parent_order['user_id'] . '_' . time();

        // 4. Tạo order gia hạn
        $stmt = $pdo->prepare("
            INSERT INTO orders (
                user_id, package_id, payment_status,
                start_date, end_date, app_trans_id, amount,
                is_extension, parent_order_id, extension_months
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
        ");

        $extension_start = $parent_order['end_date']; // Bắt đầu từ ngày kết thúc hợp đồng cũ
        $extension_end = date('Y-m-d', strtotime($extension_start . ' + ' . $extend_months . ' months'));

        $stmt->execute([
            $parent_order['user_id'],
            $parent_order['package_id'],
            'pending', // Chờ thanh toán
            $extension_start,
            $extension_end,
            $app_trans_id,
            $extension_price,
            $request['order_id'], // parent_order_id
            $extend_months
        ]);

        $extension_order_id = $pdo->lastInsertId();

        // 5. Lưu extension_order_id vào contract_request
        $stmt = $pdo->prepare("
            UPDATE contract_requests
            SET extension_order_id = ?, old_end_date = ?
            WHERE id = ?
        ");
        $stmt->execute([$extension_order_id, $parent_order['end_date'], $request_id]);

        // 6. ✨ Gọi ZaloPay API tạo payment URL
        include_once __DIR__ . '/zalopay_create.php';
        $GLOBALS['zalopay_included'] = true;

        $zalopay_result = createZaloPayOrder(
            $extension_order_id,
            $extension_price,
            "Gia hạn hợp đồng #{$request['order_id']} - {$parent_order['package_name']} ({$extend_months} tháng)",
            $app_trans_id
        );

        // 7. Lưu payment_url để trả về cho frontend
        $payment_url = $zalopay_result['order_url'] ?? null;

    } elseif ($request['request_type'] === 'terminate') {
        // Kết thúc hợp đồng (giữ nguyên)
        $end_date = $request['requested_end_date'] ?: date('Y-m-d');
        $stmt = $pdo->prepare("UPDATE orders SET end_date = ? WHERE id = ?");
        $stmt->execute([$end_date, $request['order_id']]);

        $stmt = $pdo->prepare("
            UPDATE contract_requests
            SET old_end_date = ?, new_end_date = ?
            WHERE id = ?
        ");
        $stmt->execute([$request['current_end_date'], $end_date, $request_id]);
    }
}

$pdo->commit();

// ✨ Trả về response có payment_url
echo json_encode([
    "success" => true,
    "message" => $status === 'approved' ? "Yêu cầu đã được duyệt" : "Yêu cầu đã bị từ chối",
    "payment_url" => $payment_url ?? null, // Chỉ có khi extend
    "extension_order_id" => $extension_order_id ?? null
]);
```

---

### 2.2. File: `backend/api/zalopay_callback.php`

**Thêm logic cập nhật end_date khi thanh toán gia hạn thành công:**

```php
// Sau khi cập nhật payment_status = 'paid'
if ($stmt->execute([$zp_trans_id, $app_trans_id])) {

    // ✨ THÊM: Kiểm tra nếu là order gia hạn → Cập nhật hợp đồng gốc
    if ($order['is_extension'] == 1 && $order['parent_order_id']) {
        $stmt = $pdo->prepare("
            UPDATE orders
            SET end_date = (
                SELECT end_date
                FROM orders
                WHERE id = ? AND is_extension = 1
            )
            WHERE id = ?
        ");
        $stmt->execute([$order['id'], $order['parent_order_id']]);

        // Cập nhật new_end_date trong contract_requests
        $stmt = $pdo->prepare("
            UPDATE contract_requests
            SET new_end_date = (
                SELECT end_date
                FROM orders
                WHERE id = ?
            )
            WHERE extension_order_id = ?
        ");
        $stmt->execute([$order['parent_order_id'], $order['id']]);

        error_log("Extended parent order #{$order['parent_order_id']} with extension order #{$order['id']}");
    }

    // Log thành công...
}
```

---

## 🎨 BƯỚC 3: CẬP NHẬT FRONTEND

### 3.1. File: `frontend/src/api/contract-requests.js`

**Cập nhật response type:**

```javascript
// Admin xử lý yêu cầu (approve/reject)
export const processContractRequest = async (processData) => {
  const res = await axios.post(
    API_URL,
    {
      action: 'process',
      ...processData,
    },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  // ✨ Response sẽ có thêm payment_url nếu là extend
  return res.data; // { success, message, payment_url?, extension_order_id? }
};
```

---

### 3.2. File: `frontend/src/features/user/pages/ContractsPage.jsx`

**Thêm logic hiển thị order gia hạn chờ thanh toán:**

```jsx
// Trong fetchContracts(), thêm fetch extension orders
const fetchContracts = async () => {
  try {
    setLoading(true);
    const data = await getUserContracts(user.id);

    // ✨ Phân loại: Hợp đồng chính + Đơn gia hạn
    const mainContracts = data.filter((c) => c.is_extension == 0);
    const extensionOrders = data.filter((c) => c.is_extension == 1);

    setContracts(mainContracts);
    setExtensionOrders(extensionOrders); // State mới
  } catch (err) {
    setError('Không thể tải danh sách hợp đồng');
  } finally {
    setLoading(false);
  }
};

// ✨ Render extension orders pending
{
  extensionOrders
    .filter((ext) => ext.payment_status === 'pending')
    .map((ext) => (
      <Alert severity='warning' key={ext.id} sx={{ mb: 2 }}>
        <AlertTitle>Đơn gia hạn chờ thanh toán</AlertTitle>
        <Typography variant='body2' mb={1}>
          Hợp đồng #{ext.parent_order_id} - Gia hạn {ext.extension_months} tháng
        </Typography>
        <Typography variant='body2' mb={2}>
          Số tiền: <strong>{formatPrice(ext.amount)}</strong>
        </Typography>
        <Button
          variant='contained'
          size='small'
          onClick={() => window.open(ext.payment_url, '_blank')}
        >
          Thanh toán ngay
        </Button>
      </Alert>
    ));
}
```

---

### 3.3. File: `frontend/src/features/admin/pages/ContractRequestsPage.jsx`

**Hiển thị payment_url sau khi duyệt extend:**

```jsx
const handleProcess = async (requestId, status) => {
  try {
    const result = await processContractRequest({
      request_id: requestId,
      status,
      admin_id: admin.id,
      admin_note: processNote,
    });

    // ✨ Nếu có payment_url → Hiển thị cho admin
    if (result.payment_url) {
      Swal.fire({
        title: 'Yêu cầu đã được duyệt!',
        html: `
          <p>Đơn gia hạn đã được tạo.</p>
          <p>Link thanh toán đã được gửi cho khách hàng.</p>
          <a href="${result.payment_url}" target="_blank" class="btn btn-primary">
            Xem link thanh toán
          </a>
        `,
        icon: 'success',
      });
    }

    fetchRequests();
  } catch (error) {
    // ...
  }
};
```

---

## 🧪 BƯỚC 4: TESTING

### Test Case 1: Gia hạn hợp đồng

```
1. User login → Vào "Hợp đồng"
2. Click "Yêu cầu gia hạn" → Chọn 12 tháng
3. Admin login → Duyệt yêu cầu
4. ✅ Check: Order gia hạn được tạo (payment_status: pending)
5. ✅ Check: ZaloPay API được gọi
6. User thấy Alert "Đơn gia hạn chờ thanh toán"
7. Click "Thanh toán ngay" → Mở ZaloPay
8. Thanh toán thành công
9. ✅ Check: Order gia hạn → payment_status = 'paid'
10. ✅ Check: Hợp đồng gốc → end_date được cập nhật
```

### Test Case 2: Hủy thanh toán

```
1. User yêu cầu gia hạn
2. Admin duyệt
3. User thấy link thanh toán
4. User KHÔNG thanh toán (close ZaloPay)
5. ✅ Check: Order gia hạn vẫn pending
6. ✅ Check: Hợp đồng gốc KHÔNG thay đổi end_date
7. User có thể thanh toán lại sau
```

---

## 📋 CHECKLIST TRIỂN KHAI

- [ ] **Database**

  - [ ] Chạy migration `add_extension_fields.sql`
  - [ ] Verify: orders có cột `is_extension`, `parent_order_id`, `extension_months`
  - [ ] Verify: contract_requests có cột `extension_order_id`

- [ ] **Backend API**

  - [ ] Sửa `contract_requests.php` - phần `process` action
  - [ ] Sửa `zalopay_callback.php` - thêm logic extend
  - [ ] Test API: POST /api/contract_requests (action=process, status=approved)
  - [ ] Verify response có `payment_url`

- [ ] **Frontend**

  - [ ] Cập nhật `contract-requests.js`
  - [ ] Cập nhật `ContractsPage.jsx` - hiển thị extension orders
  - [ ] Cập nhật `ContractRequestsPage.jsx` - admin UI
  - [ ] Test UI flow đầy đủ

- [ ] **Testing**
  - [ ] Test gia hạn 6 tháng
  - [ ] Test gia hạn 12 tháng
  - [ ] Test thanh toán thành công
  - [ ] Test hủy thanh toán
  - [ ] Test callback ZaloPay
  - [ ] Verify end_date được cập nhật đúng

---

## 🔍 DEBUG TIPS

### Kiểm tra order gia hạn được tạo:

```sql
SELECT * FROM orders
WHERE is_extension = 1
ORDER BY created_at DESC;
```

### Kiểm tra flow thanh toán:

```sql
SELECT
    o.id,
    o.app_trans_id,
    o.payment_status,
    o.is_extension,
    o.parent_order_id,
    o.amount,
    cr.request_type,
    cr.extend_months
FROM orders o
LEFT JOIN contract_requests cr ON cr.extension_order_id = o.id
WHERE o.is_extension = 1;
```

### Log ZaloPay:

- Check `backend/logs/zalopay.log` (nếu có logging)
- Check PHP error log
- Check browser console khi redirect ZaloPay

---

## 💡 LƯU Ý QUAN TRỌNG

1. **Tính tiền gia hạn:**

   - Giá gia hạn = (Giá gói / 12) \* Số tháng gia hạn
   - VD: Gói 1.200.000đ/năm → Gia hạn 6 tháng = 600.000đ

2. **Xử lý pending orders:**

   - User có thể có nhiều đơn gia hạn pending
   - Cần sort theo thời gian để hiển thị đúng
   - Có thể thêm auto-cancel sau X ngày

3. **Security:**

   - Verify MAC từ ZaloPay callback
   - Check amount trước khi cập nhật
   - Transaction để đảm bảo data consistency

4. **UX:**
   - Thông báo rõ ràng cho user về pending payment
   - Email reminder khi có đơn chờ thanh toán
   - History tracking đầy đủ

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:

1. Check PHP error log
2. Check MySQL query log
3. Check ZaloPay API response
4. Verify database constraints
5. Test với ZaloPay Sandbox trước khi production

---

**Tác giả:** GitHub Copilot  
**Ngày:** 2025-10-24  
**Version:** 1.0
