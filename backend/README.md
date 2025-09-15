# Backend Environment Configuration

## Overview

Backend này sử dụng file `.env` để quản lý cấu hình môi trường một cách tập trung và bảo mật.

## Setup

### 1. Tạo file cấu hình môi trường

```bash
cp .env.example .env
```

### 2. Cấu hình các biến môi trường

Chỉnh sửa file `.env` với các giá trị phù hợp với môi trường của bạn:

```env
# Database Configuration
DB_HOST=localhost:3308
DB_NAME=maintenance_app
DB_USER=root
DB_PASS=your_password
DB_CHARSET=utf8mb4

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
CORS_DEFAULT_ORIGIN=http://localhost:3001

# Application Configuration
APP_ENV=development
APP_DEBUG=true
APP_NAME=Maintenance App
```

## Cấu trúc file

### Environment Files

- `.env` - File cấu hình chính (không commit vào Git)
- `.env.example` - Template file cho developers
- `config/env.php` - Class xử lý environment variables

### Configuration Files

- `config/db.php` - Cấu hình database với environment variables
- `config/cors.php` - Cấu hình CORS với environment variables

### API Files

Tất cả file trong `api/` đều đã được cập nhật để sử dụng:

- `cors.php` cho CORS headers
- `db.php` cho database connection

## Sử dụng Environment Variables

### Trong PHP code

```php
// Load environment variables
require_once __DIR__ . '/config/env.php';

// Sử dụng function env() để lấy giá trị
$dbHost = env('DB_HOST', 'localhost');
$appName = env('APP_NAME', 'Default App');
$debug = env('APP_DEBUG', false);
```

### Supported types

Function `env()` tự động chuyển đổi:

- `'true'` → `true` (boolean)
- `'false'` → `false` (boolean)
- `'null'` → `null`

## Testing

Chạy script test để kiểm tra cấu hình:

```bash
php test_config.php
```

## Security

- File `.env` được loại trừ khỏi Git qua `.gitignore`
- Không bao giờ commit file `.env` vào repository
- Sử dụng `.env.example` làm template

## API Endpoints

Tất cả API endpoints đã được cập nhật để sử dụng cấu hình môi trường:

- `/api/auth.php`
- `/api/users.php`
- `/api/devices.php`
- `/api/orders.php`
- `/api/schedules.php`
- `/api/packages.php`
- `/api/reminders.php`
- `/api/contract_requests.php`
- `/api/technicians.php`
- `/api/technician_approve.php`
- `/api/book_schedule.php`
- `/api/admin_schedules.php`

## Development vs Production

### Development

```env
APP_ENV=development
APP_DEBUG=true
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Production

```env
APP_ENV=production
APP_DEBUG=false
CORS_ALLOWED_ORIGINS=https://yourdomain.com
DB_PASS=strong_password_here
```
