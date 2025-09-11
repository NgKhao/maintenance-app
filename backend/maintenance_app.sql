-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: localhost:3308
-- Thời gian đã tạo: Th9 11, 2025 lúc 10:15 AM
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
-- Cấu trúc bảng cho bảng `contractendrequests`
--

CREATE TABLE `contractendrequests` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `request_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `note` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `contractendrequests`
--

INSERT INTO `contractendrequests` (`id`, `order_id`, `request_date`, `status`, `note`) VALUES
(1, 1, '2025-09-10 12:01:13', 'pending', 'Yêu cầu kết thúc trước hạn'),
(2, 2, '2025-09-10 12:01:13', 'approved', 'Hợp đồng kết thúc sớm do chuyển nhà');

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
(4, 4, 'Điều hòa phòng ngủ', 'AC10002', 'maintenance', '2025-09-10 12:01:13', NULL),
(6, 2, 'bayy', '1111111', 'maintenance', '2025-09-11 04:18:47', NULL),
(7, 6, 'xe hơi', '1111111111', 'normal', '2025-09-11 07:04:16', NULL);

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
(3, 'Gói VIP', 'Bảo trì thiết bị VIP 4 lần/tháng, ưu tiên kỹ thuật viên', 1500000.00, 12, '2025-09-10 12:01:13');

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
  `technician_id` int(11) NOT NULL,
  `device_id` int(11) NOT NULL,
  `scheduled_date` datetime NOT NULL,
  `status` enum('pending','assigned','confirmed','rejected','in_progress','completed','cancelled') DEFAULT 'pending',
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `maintenanceschedules`
--

INSERT INTO `maintenanceschedules` (`id`, `order_id`, `technician_id`, `device_id`, `scheduled_date`, `status`, `note`, `created_at`) VALUES
(1, 1, 1, 1, '2025-09-15 09:00:00', 'pending', 'Bảo trì định kỳ', '2025-09-10 12:01:13'),
(2, 1, 2, 2, '2025-09-16 14:00:00', 'pending', 'Kiểm tra máy giặt', '2025-09-10 12:01:13'),
(3, 2, 3, 3, '2025-09-20 10:00:00', 'pending', 'Tủ lạnh bị hỏng', '2025-09-10 12:01:13'),
(4, 3, 1, 4, '2025-09-25 15:00:00', 'pending', 'Điều hòa phòng ngủ', '2025-09-10 12:01:13');

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `package_id`, `payment_status`, `start_date`, `end_date`, `created_at`) VALUES
(1, 2, 1, 'paid', '2025-09-01', '2026-08-31', '2025-09-10 12:01:13'),
(2, 3, 2, 'paid', '2025-08-15', '2026-08-14', '2025-09-10 12:01:13'),
(3, 4, 3, 'pending', '2025-09-10', '2026-09-09', '2025-09-10 12:01:13'),
(4, 5, 1, 'paid', '2025-09-11', '2026-09-11', '2025-09-11 05:09:07'),
(5, 6, 2, 'paid', '2025-09-11', '2026-09-11', '2025-09-11 07:06:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `technicians`
--

CREATE TABLE `technicians` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `technicians`
--

INSERT INTO `technicians` (`id`, `name`, `phone`, `email`, `status`, `created_at`, `user_id`) VALUES
(1, 'Nguyen Van D', '0909123456', 'tech1@example.com', '', '2025-09-10 12:01:13', 6),
(2, 'Tran Thi E', '0909765432', 'tech2@example.com', '', '2025-09-10 12:01:13', NULL),
(3, 'Pham Van F', '0909345678', 'tech3@example.com', '', '2025-09-10 12:01:13', NULL);

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`, `phone`, `address`) VALUES
(1, 'Admin', 'admin@example.com', '0192023a7bbd73250516f069df18b500', 'admin', '2025-09-10 12:01:13', NULL, NULL),
(2, 'Nguyen Van A', 'user1@example.com', 'e10adc3949ba59abbe56e057f20f883e', 'user', '2025-09-10 12:01:13', '0909111111', '123 Đường ABC, Quận 1, TP.HCM'),
(3, 'Tran Thi B', 'user2@example.com', 'e10adc3949ba59abbe56e057f20f883e', 'user', '2025-09-10 12:01:13', '0909222222', '456 Đường XYZ, Quận 2, TP.HCM'),
(4, 'Le Van C', 'user3@example.com', 'e10adc3949ba59abbe56e057f20f883e', 'user', '2025-09-10 12:01:13', '0909333333', '789 Đường DEF, Quận 3, TP.HCM'),
(5, 'aaaa', '222@gmail.com', '$2y$10$irt5dCRaPi/Z2nsJ5B/wi.LxIfT0VYp57Vws1STf8LVie/htlNati', 'user', '2025-09-10 12:05:59', NULL, NULL),
(6, 'tttttt', 'bsbnk141@gmail.com', '$2y$10$Hg0OXx6Qu40fQw1ncA7EHeHSlNEFc1KZF1hccWW4nXkcmkwmvHt5i', 'user', '2025-09-11 07:03:04', NULL, NULL),
(7, 'jon', '111@gmail.com', '$2y$10$aL7wOelpNXZxQi.SUpTLf.Kz09foZMoMridkU5cdiqE6Us57Fy.Dy', 'technician', '2025-09-11 07:25:50', NULL, NULL);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `contractendrequests`
--
ALTER TABLE `contractendrequests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

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
  ADD KEY `technician_id` (`technician_id`),
  ADD KEY `device_id` (`device_id`);

--
-- Chỉ mục cho bảng `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `package_id` (`package_id`);

--
-- Chỉ mục cho bảng `technicians`
--
ALTER TABLE `technicians`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_technician_user` (`user_id`);

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
-- AUTO_INCREMENT cho bảng `contractendrequests`
--
ALTER TABLE `contractendrequests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `devices`
--
ALTER TABLE `devices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `maintenancepackages`
--
ALTER TABLE `maintenancepackages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `maintenancereminders`
--
ALTER TABLE `maintenancereminders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `maintenanceschedules`
--
ALTER TABLE `maintenanceschedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `technicians`
--
ALTER TABLE `technicians`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `contractendrequests`
--
ALTER TABLE `contractendrequests`
  ADD CONSTRAINT `contractendrequests_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `maintenanceschedules_ibfk_2` FOREIGN KEY (`technician_id`) REFERENCES `technicians` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `maintenanceschedules_ibfk_3` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`package_id`) REFERENCES `maintenancepackages` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `technicians`
--
ALTER TABLE `technicians`
  ADD CONSTRAINT `fk_technician_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
