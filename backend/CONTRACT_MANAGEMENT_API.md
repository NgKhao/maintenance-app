# Contract Management APIs

## Overview

Backend APIs for contract management đã được triển khai với routing qua `index.php`.

## API Endpoints

### 1. Admin Contract Management (orders.php)

#### Tạo hợp đồng bởi Admin

```
POST /index.php?api=orders
Content-Type: application/json

{
  "action": "admin_create",
  "user_id": 6,
  "package_id": 1,
  "payment_status": "paid",      // "pending" | "paid"
  "start_date": "2025-09-29",    // Optional, default: today
  "custom_price": 600000,        // Optional, override package price
  "admin_note": "Khách hàng VIP - giá ưu đãi"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Tạo hợp đồng thành công",
  "order_id": "27",
  "app_trans_id": "ADMIN_250929_6_1759124343"
}
```

#### Lấy danh sách hợp đồng

```
GET /index.php?api=orders&action=contracts&user_id=6
```

### 2. Customer Contract Requests (contract_requests.php)

#### Lấy danh sách yêu cầu

```
GET /index.php?api=contract_requests&action=list&user_id=6&status=pending&admin_view=false
```

**Parameters:**

- `user_id`: ID của user (optional nếu admin_view=true)
- `status`: "pending" | "approved" | "rejected" (optional)
- `admin_view`: true/false - Admin xem tất cả requests

#### Khách hàng tạo yêu cầu gia hạn

```
POST /index.php?api=contract_requests
Content-Type: application/json

{
  "action": "create",
  "order_id": 25,
  "request_type": "extend",
  "extend_months": 6,
  "note": "Muốn gia hạn thêm 6 tháng"
}
```

#### Khách hàng tạo yêu cầu kết thúc

```
POST /index.php?api=contract_requests
Content-Type: application/json

{
  "action": "create",
  "order_id": 25,
  "request_type": "terminate",
  "requested_end_date": "2025-12-31",
  "note": "Không có nhu cầu sử dụng nữa"
}
```

#### Admin xử lý yêu cầu

```
POST /index.php?api=contract_requests
Content-Type: application/json

{
  "action": "process",
  "request_id": 4,
  "status": "approved",          // "approved" | "rejected"
  "admin_id": 1,
  "admin_note": "Đã duyệt gia hạn"
}
```

#### Cập nhật yêu cầu (chỉ khi pending)

```
PUT /index.php?api=contract_requests
Content-Type: application/json

{
  "id": 4,
  "note": "Cập nhật ghi chú",
  "extend_months": 12,
  "requested_end_date": "2026-01-01"
}
```

#### Hủy yêu cầu (chỉ khi pending)

```
DELETE /index.php?api=contract_requests?id=4
```

## Database Schema Changes

### Bảng `orders` (không thay đổi)

- Không có field `payment_method`
- Sử dụng existing fields: `payment_status`, `amount`, `app_trans_id`

### Bảng `contract_requests`

```sql
CREATE TABLE `contract_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `request_date` timestamp DEFAULT current_timestamp(),
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `note` text,
  `request_type` enum('extend','terminate') NOT NULL,
  `extend_package_id` int(11) DEFAULT NULL,
  `extend_months` int(11) DEFAULT NULL,
  `requested_end_date` date DEFAULT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `admin_note` text,
  `processed_date` timestamp NULL DEFAULT NULL,
  `old_end_date` date DEFAULT NULL,
  `new_end_date` date DEFAULT NULL,
  PRIMARY KEY (`id`)
);
```

## Business Logic

### Admin Contract Creation

✅ **Validation**: User và package bắt buộc  
✅ **Price flexibility**: Custom price hoặc package price  
✅ **Auto calculation**: End date = start*date + package duration  
✅ **Tracking**: app_trans_id với prefix "ADMIN*"

### Customer Contract Requests

✅ **Validation**: Hợp đồng phải đã thanh toán (paid)  
✅ **No duplicates**: Không cho phép tạo request khi đã có pending  
✅ **Type support**: extend và terminate  
✅ **Admin processing**: Approve/reject với admin notes

### Contract Updates

✅ **Transaction safety**: Database transactions cho consistency  
✅ **Backup data**: Lưu old_end_date, new_end_date  
✅ **Auto calculation**: Extend = current_end + extend_months  
✅ **Terminate**: Set new end_date = requested_end_date

## Testing Examples

### PowerShell Test Commands

```powershell
# Admin tạo hợp đồng
Invoke-WebRequest -Uri "http://localhost:8000/index.php?api=orders" -Method POST -ContentType "application/json" -Body '{"action":"admin_create","user_id":6,"package_id":1,"payment_status":"paid","admin_note":"Test"}'

# Customer yêu cầu gia hạn
Invoke-WebRequest -Uri "http://localhost:8000/index.php?api=contract_requests" -Method POST -ContentType "application/json" -Body '{"action":"create","order_id":25,"request_type":"extend","extend_months":6,"note":"Test"}'

# Admin duyệt yêu cầu
Invoke-WebRequest -Uri "http://localhost:8000/index.php?api=contract_requests" -Method POST -ContentType "application/json" -Body '{"action":"process","request_id":4,"status":"approved","admin_id":1,"admin_note":"OK"}'

# Lấy danh sách requests
Invoke-WebRequest -Uri "http://localhost:8000/index.php?api=contract_requests&action=list&user_id=6" -Method GET
```

## Status

✅ **Backend hoàn thành**: Tất cả APIs đã implement và tested  
✅ **Database compatible**: Phù hợp với schema hiện tại  
✅ **Routing chuẩn**: Sử dụng index.php?api=xxx&action=yyy  
✅ **Business logic**: Validation, transactions, backup data

**Ready for frontend integration!** 🚀
