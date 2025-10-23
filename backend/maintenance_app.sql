-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1:3307
-- Thời gian đã tạo: Th10 23, 2025 lúc 08:14 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `maintenance_app`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `contract_requests`
--

CREATE TABLE `contract_requests` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `request_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','pending_payment','approved','rejected') DEFAULT 'pending',
  `note` text DEFAULT NULL,
  `request_type` enum('extend','terminate') NOT NULL,
  `extend_package_id` int(11) DEFAULT NULL,
  `extend_months` int(11) DEFAULT NULL COMMENT 'Số tháng muốn gia hạn (dùng cho tính tiền)',
  `requested_end_date` date DEFAULT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `admin_note` text DEFAULT NULL,
  `processed_date` timestamp NULL DEFAULT NULL,
  `old_end_date` date DEFAULT NULL,
  `new_end_date` date DEFAULT NULL,
  `extension_order_id` int(11) DEFAULT NULL COMMENT 'ID của order gia hạn được tạo khi duyệt'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `contract_requests`
--

INSERT INTO `contract_requests` (`id`, `order_id`, `request_date`, `status`, `note`, `request_type`, `extend_package_id`, `extend_months`, `requested_end_date`, `admin_id`, `admin_note`, `processed_date`, `old_end_date`, `new_end_date`, `extension_order_id`) VALUES
(1, 1, '2025-09-10 12:01:13', 'pending', 'Khách hàng chuyển địa chỉ mới, yêu cầu kết thúc hợp đồng', 'extend', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 2, '2025-09-10 12:01:13', 'approved', 'Hợp đồng kết thúc sớm do chuyển nhà', 'extend', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 3, '2025-09-12 09:59:24', 'pending', 'Yêu cầu kết thúc do không hài lòng với dịch vụ', 'extend', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 25, '2025-09-29 05:39:27', 'approved', 'Test extend request', 'extend', NULL, 6, NULL, 1, 'Duyet gia han', '2025-09-29 05:39:36', '2026-09-28', '2027-03-28', NULL),
(5, 27, '2025-09-29 06:10:09', 'approved', '', 'extend', NULL, 12, NULL, 1, '', '2025-09-29 06:10:35', '2026-09-29', '2027-09-29', NULL),
(6, 28, '2025-09-30 16:08:16', 'approved', 'hợp llý....', 'extend', NULL, 12, NULL, 1, '......', '2025-09-30 16:10:17', '2026-09-29', '2027-09-29', NULL),
(7, 28, '2025-10-23 15:40:02', 'approved', '', 'extend', NULL, 12, NULL, 1, '', '2025-10-23 15:46:35', '2027-09-29', '2028-09-29', NULL),
(8, 27, '2025-10-23 15:42:19', 'approved', '', 'terminate', NULL, NULL, '2025-11-22', 1, '', '2025-10-23 15:42:39', '2027-09-29', '2025-11-22', NULL),
(10, 33, '2025-10-23 18:07:37', 'pending', '', 'extend', NULL, 6, NULL, NULL, NULL, NULL, '2026-10-23', NULL, 35);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `devices`
--

CREATE TABLE `devices` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `status` enum('normal','issue','maintenance') DEFAULT 'normal',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `technician_note` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `devices`
--

INSERT INTO `devices` (`id`, `user_id`, `name`, `serial_number`, `status`, `created_at`, `technician_note`) VALUES
(1, 2, 'Máy lạnh Phòng khách', 'AC10001', 'normal', '2025-09-10 12:01:13', NULL),
(2, 2, 'Máy giặt', 'WM20001', 'normal', '2025-09-10 12:01:13', NULL),
(3, 3, 'Tủ lạnh', 'FR30001', 'issue', '2025-09-10 12:01:13', NULL),
(4, 4, 'Điều hòa phòng ngủ', 'AC10002', 'normal', '2025-09-10 12:01:13', ''),
(6, 2, 'bayy', '1111111', 'maintenance', '2025-09-11 04:18:47', NULL),
(7, 6, 'Bếp điện', '1111111110', 'maintenance', '2025-09-11 07:04:16', 'qsu tốt'),
(8, 3, 'Máy lạnh phòng ngủ', 'AC10003', 'normal', '2025-09-12 09:59:24', NULL),
(9, 4, 'Máy rửa chén', 'DW40001', 'normal', '2025-09-12 09:59:24', NULL),
(10, 2, 'Lò vi sóng', 'MW50001', 'normal', '2025-09-12 09:59:24', 'đã ổn định'),
(11, 3, 'Quạt trần phòng khách', 'CF60001', 'maintenance', '2025-09-12 09:59:24', 'Đã thay bộ điều khiển');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `maintenancepackages`
--

CREATE TABLE `maintenancepackages` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `duration_months` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `maintenancepackages`
--

INSERT INTO `maintenancepackages` (`id`, `name`, `description`, `price`, `duration_months`, `created_at`) VALUES
(1, 'Gói cơ bản', 'Bảo trì thiết bị cơ bản 1 lần/tháng', 500000.00, 12, '2025-09-10 12:01:13'),
(2, 'Gói nâng cao', 'Bảo trì thiết bị nâng cao 2 lần/tháng', 900000.00, 12, '2025-09-10 12:01:13'),
(3, 'Gói VIP', 'Bảo trì thiết bị VIP 4 lần/tháng, ưu tiên kỹ thuật viên', 1500000.00, 12, '2025-09-10 12:01:13'),
(5, 'Gói phụu', 'aaaaa', 180000.00, 6, '2025-10-08 07:28:15');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `maintenancereminders`
--

CREATE TABLE `maintenancereminders` (
  `id` int(11) NOT NULL,
  `schedule_id` int(11) NOT NULL,
  `reminder_date` datetime NOT NULL,
  `sent_status` enum('pending','sent') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `maintenancereminders`
--

INSERT INTO `maintenancereminders` (`id`, `schedule_id`, `reminder_date`, `sent_status`) VALUES
(1, 1, '2025-09-14 09:00:00', 'pending'),
(2, 2, '2025-09-15 14:00:00', 'pending'),
(3, 3, '2025-09-19 10:00:00', 'pending'),
(4, 4, '2025-09-24 15:00:00', 'pending');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `maintenanceschedules`
--

CREATE TABLE `maintenanceschedules` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `device_id` int(11) NOT NULL,
  `scheduled_date` datetime NOT NULL,
  `status` enum('pending','assigned','confirmed','rejected','in_progress','completed','cancelled') DEFAULT 'pending',
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `maintenanceschedules`
--

INSERT INTO `maintenanceschedules` (`id`, `order_id`, `user_id`, `device_id`, `scheduled_date`, `status`, `note`, `created_at`) VALUES
(1, 1, 8, 1, '2025-09-15 09:00:00', 'completed', '', '2025-09-10 12:01:13'),
(2, 1, 9, 2, '2025-09-16 14:00:00', 'in_progress', '', '2025-09-10 12:01:13'),
(3, 2, 10, 3, '2025-09-20 10:00:00', 'pending', 'Tủ lạnh bị hỏng', '2025-09-10 12:01:13'),
(4, 3, 9, 4, '2025-09-25 15:00:00', 'pending', 'Điều hòa phòng ngủ', '2025-09-10 12:01:13'),
(7, 5, 1, 7, '2025-09-13 00:00:00', 'assigned', 'vỡ kính trước xe', '2025-09-12 07:41:48'),
(8, 2, 7, 8, '2025-09-22 10:00:00', 'confirmed', 'Bảo trì máy lạnh phòng ngủ', '2025-09-12 09:59:24'),
(9, 1, 8, 9, '2025-09-28 14:30:00', 'assigned', 'Kiểm tra máy rửa chén', '2025-09-12 09:59:24'),
(10, 2, 9, 10, '2025-10-02 09:00:00', 'pending', 'Sửa chữa lò vi sóng', '2025-09-12 09:59:24'),
(11, 3, 7, 11, '2025-10-05 11:00:00', 'in_progress', 'Bảo trì quạt trần', '2025-09-12 09:59:24'),
(15, 5, 7, 7, '2025-09-14 00:00:00', 'completed', '', '2025-09-12 14:12:05'),
(16, 5, 7, 7, '2025-09-14 00:00:00', 'completed', '', '2025-09-12 14:27:10'),
(18, 5, 7, 7, '2025-09-15 00:00:00', 'completed', '', '2025-09-12 15:31:54'),
(19, 5, 7, 7, '2025-10-13 00:00:00', 'in_progress', '', '2025-09-12 16:17:35'),
(20, 29, 8, 11, '2025-10-10 14:20:00', 'pending', '', '2025-10-08 07:20:24'),
(21, 28, 8, 8, '2025-10-09 14:26:00', 'pending', '', '2025-10-08 07:26:09'),
(22, 26, 7, 10, '2025-10-10 00:00:00', 'completed', '', '2025-10-08 07:33:29'),
(23, 12, 9, 6, '2025-10-12 14:38:00', 'assigned', '', '2025-10-08 07:39:06'),
(24, 30, 7, 9, '2025-10-16 00:00:00', 'confirmed', '', '2025-10-14 06:09:14'),
(25, 29, 7, 8, '2025-10-19 00:00:00', 'confirmed', '', '2025-10-18 09:09:33'),
(26, 29, 7, 4, '2025-10-24 00:00:00', 'completed', '', '2025-10-23 15:32:20');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `package_id` int(11) NOT NULL,
  `payment_status` enum('pending','paid','failed') DEFAULT 'pending',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `app_trans_id` varchar(50) DEFAULT NULL COMMENT 'Mã giao dịch unique của app',
  `zalo_trans_id` varchar(50) DEFAULT NULL COMMENT 'Mã giao dịch từ ZaloPay',
  `amount` decimal(15,2) DEFAULT NULL COMMENT 'Số tiền thanh toán',
  `paid_at` timestamp NULL DEFAULT NULL COMMENT 'Thời điểm thanh toán thành công',
  `is_extension` tinyint(1) DEFAULT 0 COMMENT '1 = Đơn gia hạn, 0 = Đơn mới',
  `parent_order_id` int(11) DEFAULT NULL COMMENT 'ID của hợp đồng gốc (nếu là gia hạn)',
  `extension_months` int(11) DEFAULT NULL COMMENT 'Số tháng gia hạn'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `package_id`, `payment_status`, `start_date`, `end_date`, `created_at`, `app_trans_id`, `zalo_trans_id`, `amount`, `paid_at`, `is_extension`, `parent_order_id`, `extension_months`) VALUES
(1, 2, 1, 'paid', '2025-09-01', '2026-08-31', '2025-09-10 12:01:13', NULL, NULL, NULL, NULL, 0, NULL, NULL),
(2, 3, 2, 'paid', '2025-08-15', '2026-08-14', '2025-09-10 12:01:13', NULL, NULL, NULL, NULL, 0, NULL, NULL),
(3, 4, 3, 'pending', '2025-09-10', '2026-09-09', '2025-09-10 12:01:13', NULL, NULL, NULL, NULL, 0, NULL, NULL),
(4, 5, 1, 'paid', '2025-09-11', '2026-09-11', '2025-09-11 05:09:07', NULL, NULL, NULL, NULL, 0, NULL, NULL),
(5, 6, 2, 'paid', '2025-09-11', '2026-09-11', '2025-09-11 07:06:00', NULL, NULL, NULL, NULL, 0, NULL, NULL),
(6, 6, 2, 'pending', '2025-09-12', '2026-09-12', '2025-09-12 16:06:09', NULL, NULL, NULL, NULL, 0, NULL, NULL),
(7, 6, 3, 'pending', '2025-09-12', '2026-09-12', '2025-09-12 16:16:52', NULL, NULL, NULL, NULL, 0, NULL, NULL),
(8, 6, 3, 'pending', '2025-09-12', '2026-09-12', '2025-09-12 16:22:55', NULL, NULL, NULL, NULL, 0, NULL, NULL),
(9, 6, 2, 'pending', '2025-09-28', '2026-09-28', '2025-09-28 17:03:59', '250928_6_1759079039', NULL, 900000.00, NULL, 0, NULL, NULL),
(10, 6, 2, 'pending', '2025-09-28', '2026-09-28', '2025-09-28 17:04:11', '250928_6_1759079051', NULL, 900000.00, NULL, 0, NULL, NULL),
(11, 2, 1, 'pending', '2025-09-28', '2026-09-28', '2025-09-28 17:07:51', '250928_2_1759079271', NULL, 500000.00, NULL, 0, NULL, NULL),
(12, 6, 2, 'pending', '2025-09-28', '2026-09-28', '2025-09-28 17:08:00', '250928_6_1759079280', NULL, 900000.00, NULL, 0, NULL, NULL),
(13, 6, 2, 'pending', '2025-09-28', '2026-09-28', '2025-09-28 17:08:05', '250928_6_1759079285', NULL, 900000.00, NULL, 0, NULL, NULL),
(14, 6, 2, 'pending', '2025-09-28', '2026-09-28', '2025-09-28 17:08:30', '250928_6_1759079310', NULL, 900000.00, NULL, 0, NULL, NULL),
(15, 6, 2, 'pending', '2025-09-28', '2026-09-28', '2025-09-28 17:11:48', '250928_6_1759079508', NULL, 900000.00, NULL, 0, NULL, NULL),
(16, 6, 2, 'pending', '2025-09-28', '2026-09-28', '2025-09-28 17:12:46', '250928_6_1759079566', NULL, 900000.00, NULL, 0, NULL, NULL),
(17, 6, 2, 'paid', '2025-09-28', '2026-09-28', '2025-09-28 17:13:01', '250928_6_1759079581', NULL, 900000.00, NULL, 0, NULL, NULL),
(18, 6, 3, 'pending', '2025-09-28', '2026-09-28', '2025-09-28 17:14:57', '250928_6_1759079697', NULL, 1500000.00, NULL, 0, NULL, NULL),
(19, 6, 1, 'pending', '2025-09-28', '2026-09-28', '2025-09-28 17:29:26', '250928_6_1759080566', NULL, 500000.00, NULL, 0, NULL, NULL),
(20, 6, 3, 'pending', '2025-09-28', '2026-09-28', '2025-09-28 17:30:43', '250928_6_1759080643', NULL, 1500000.00, NULL, 0, NULL, NULL),
(21, 6, 3, 'pending', '2025-09-28', '2026-09-28', '2025-09-28 17:30:51', '250928_6_1759080651', NULL, 1500000.00, NULL, 0, NULL, NULL),
(22, 6, 3, 'pending', '2025-09-28', '2026-09-28', '2025-09-28 17:32:34', '250928_6_1759080754', NULL, 1500000.00, NULL, 0, NULL, NULL),
(23, 6, 3, 'pending', '2025-09-28', '2026-09-28', '2025-09-28 17:40:00', '250928_6_1759081200', NULL, 1500000.00, NULL, 0, NULL, NULL),
(24, 6, 1, 'pending', '2025-09-28', '2026-09-28', '2025-09-28 17:45:36', '250928_6_1759081536', NULL, 500000.00, NULL, 0, NULL, NULL),
(25, 6, 1, 'paid', '2025-09-28', '2027-03-28', '2025-09-28 17:56:50', '250928_6_1759082210', '240928123456', 500000.00, '2025-09-28 17:57:09', 0, NULL, NULL),
(26, 6, 1, 'paid', '2025-09-28', '2026-09-28', '2025-09-28 17:58:09', '250928_6_1759082289', '250929000000582', 500000.00, '2025-09-28 17:59:56', 0, NULL, NULL),
(27, 6, 1, 'paid', '2025-09-29', '2025-11-22', '2025-09-29 05:39:03', 'ADMIN_250929_6_1759124343', NULL, 500000.00, NULL, 0, NULL, NULL),
(28, 6, 2, 'paid', '2025-09-29', '2028-09-29', '2025-09-29 06:32:37', 'ADMIN_250929_6_1759127557', NULL, 900000.00, NULL, 0, NULL, NULL),
(29, 6, 2, 'pending', '2025-09-30', '2026-09-30', '2025-09-30 16:02:44', '250930_6_1759248164', NULL, 900000.00, NULL, 0, NULL, NULL),
(30, 6, 3, 'pending', '2025-09-30', '2026-09-30', '2025-09-30 16:04:20', '250930_6_1759248260', NULL, 1500000.00, NULL, 0, NULL, NULL),
(31, 2, 2, 'paid', '2025-09-30', '2026-09-30', '2025-09-30 16:11:23', 'ADMIN_250930_2_1759248683', NULL, 900000.00, NULL, 0, NULL, NULL),
(32, 1000, 2, 'pending', '2025-10-08', '2026-10-08', '2025-10-08 07:05:55', 'ADMIN_251008_1000_1759907155', NULL, 900000.00, NULL, 0, NULL, NULL),
(33, 6, 1, 'paid', '2025-10-23', '2026-10-23', '2025-10-23 16:56:52', '251023_6_1761238612', '251023000125115', 500000.00, '2025-10-23 16:58:14', 0, NULL, NULL),
(35, 6, 1, 'paid', '2025-10-24', '2025-10-24', '2025-10-23 18:06:35', '251023_1761242795_EXT33', '251024000000447', 250000.00, '2025-10-23 18:07:37', 1, 33, 6);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `schedule_id` int(11) NOT NULL COMMENT 'ID lịch bảo trì',
  `user_id` int(11) NOT NULL COMMENT 'ID khách hàng đánh giá',
  `technician_id` int(11) NOT NULL COMMENT 'ID kỹ thuật viên được đánh giá',
  `rating` tinyint(1) NOT NULL COMMENT 'Điểm đánh giá từ 1-5',
  `comment` text DEFAULT NULL COMMENT 'Nhận xét của khách hàng',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ;

--
-- Đang đổ dữ liệu cho bảng `reviews`
--

INSERT INTO `reviews` (`id`, `schedule_id`, `user_id`, `technician_id`, `rating`, `comment`, `created_at`) VALUES
(1, 22, 6, 7, 5, 'kỹ thuật viên tận tình, giỏi', '2025-10-15 03:23:54'),
(2, 26, 6, 7, 5, 'tuyệt vời', '2025-10-23 15:37:21');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','technician','admin') DEFAULT 'user',
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `active`, `created_at`, `phone`, `address`) VALUES
(1, 'Admin', 'admin@example.com', '$2y$10$5YgPkdqxEIBUr5XCNYPrsOAhojp4NwhfZIJ708UaGn.pBOYK2DrL2', 'admin', 1, '2025-09-10 12:01:13', NULL, NULL),
(2, 'Nguyen Van A Updated', 'user1@example.com', 'e10adc3949ba59abbe56e057f20f883e', 'user', 1, '2025-09-10 12:01:13', '0909111222', 'Updated address'),
(3, 'Tran Thi B', 'user2@example.com', 'e10adc3949ba59abbe56e057f20f883e', 'user', 1, '2025-09-10 12:01:13', '0909222222', '456 Đường XYZ, Quận 2, TP.HCM'),
(4, 'Le Van C', 'user3@example.com', 'e10adc3949ba59abbe56e057f20f883e', 'user', 1, '2025-09-10 12:01:13', '0909333333', '789 Đường DEF, Quận 3, TP.HCM'),
(5, 'aaaa', '222@gmail.com', '$2y$10$5YgPkdqxEIBUr5XCNYPrsOAhojp4NwhfZIJ708UaGn.pBOYK2DrL2', 'user', 1, '2025-09-10 12:05:59', NULL, NULL),
(6, 'Nguyễn A', 'bsbnk141@gmail.com', '$2y$10$QsQBOa/s12k0b9WlZvVMF.9bzT1KejonDK/SceUtMmdxmYNaYYlYq', 'user', 1, '2025-09-11 07:03:04', '0337910377', ''),
(7, 'Khaoo', '111@gmail.com', '$2y$10$5YgPkdqxEIBUr5XCNYPrsOAhojp4NwhfZIJ708UaGn.pBOYK2DrL2', 'technician', 1, '2025-09-11 07:25:50', NULL, NULL),
(8, 'Tech John Smith', 'john.tech@example.com', '$2y$10$AOcdKo8fYzcMqwAFlYfBkuXf59QxF3a4irwCUZkPm9fprkdXFUynK', 'technician', 1, '2025-09-12 09:55:17', '0909444444', '456 Tech Street, District 1, HCMC'),
(9, 'Tech Sarah Johnson', 'sarah.tech@example.com', '$2y$10$j5H9YKqX5PsmZwEsknBAe.0GTZDf9U8UWp87ChIxUILYbVr7ek552', 'technician', 1, '2025-09-12 09:55:17', '0909555555', '789 Service Ave, District 2, HCMC'),
(10, 'Tech Mike Wilson', 'mike.tech@example.com', '$2y$10$aL7wOelpNXZxQi.SUpTLf.Kz09foZMoMridkU5cdiqE6Us57Fy.Dy', 'technician', 1, '2025-09-12 09:55:17', '0909666666', '321 Repair Blvd, District 3, HCMC'),
(1000, 'Hung', 'hung@gmail.com', '$2y$10$ObRtaqLTvAnBJwVZPWWK8urREDoYP0J5LACZ0Pb6dGbFj1jLZ0Fw2', 'user', 0, '2025-09-12 16:00:38', NULL, NULL);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `contract_requests`
--
ALTER TABLE `contract_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `fk_contract_requests_extend_package` (`extend_package_id`),
  ADD KEY `idx_contract_requests_type_status` (`request_type`,`status`),
  ADD KEY `idx_contract_requests_order_id` (`order_id`),
  ADD KEY `idx_contract_requests_admin_id` (`admin_id`),
  ADD KEY `idx_extension_order` (`extension_order_id`);

--
-- Chỉ mục cho bảng `devices`
--
ALTER TABLE `devices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `serial_number` (`serial_number`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `maintenancepackages`
--
ALTER TABLE `maintenancepackages`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `maintenancereminders`
--
ALTER TABLE `maintenancereminders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `schedule_id` (`schedule_id`);

--
-- Chỉ mục cho bảng `maintenanceschedules`
--
ALTER TABLE `maintenanceschedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `device_id` (`device_id`),
  ADD KEY `maintenanceschedules_ibfk_2` (`user_id`);

--
-- Chỉ mục cho bảng `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `app_trans_id` (`app_trans_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `package_id` (`package_id`),
  ADD KEY `idx_parent_order` (`parent_order_id`);

--
-- Chỉ mục cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_schedule_review` (`schedule_id`),
  ADD KEY `idx_reviews_technician_id` (`technician_id`),
  ADD KEY `fk_reviews_user` (`user_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `contract_requests`
--
ALTER TABLE `contract_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `devices`
--
ALTER TABLE `devices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT cho bảng `maintenancepackages`
--
ALTER TABLE `maintenancepackages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `maintenancereminders`
--
ALTER TABLE `maintenancereminders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `maintenanceschedules`
--
ALTER TABLE `maintenanceschedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT cho bảng `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT cho bảng `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1001;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `contract_requests`
--
ALTER TABLE `contract_requests`
  ADD CONSTRAINT `contract_requests_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `contract_requests_ibfk_2` FOREIGN KEY (`extension_order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_contract_requests_admin` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_contract_requests_extend_package` FOREIGN KEY (`extend_package_id`) REFERENCES `maintenancepackages` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `devices`
--
ALTER TABLE `devices`
  ADD CONSTRAINT `devices_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `maintenancereminders`
--
ALTER TABLE `maintenancereminders`
  ADD CONSTRAINT `maintenancereminders_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `maintenanceschedules` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `maintenanceschedules`
--
ALTER TABLE `maintenanceschedules`
  ADD CONSTRAINT `maintenanceschedules_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `maintenanceschedules_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `maintenanceschedules_ibfk_3` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`package_id`) REFERENCES `maintenancepackages` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`parent_order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_reviews_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `maintenanceschedules` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reviews_technician` FOREIGN KEY (`technician_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
