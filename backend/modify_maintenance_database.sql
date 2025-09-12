-- Script to modify maintenance_app database structure
-- Remove technicians table and modify related tables

-- First, drop foreign key constraints that reference technicians table
ALTER TABLE `maintenanceschedules` DROP FOREIGN KEY `maintenanceschedules_ibfk_2`;

-- Drop the technicians table
DROP TABLE IF EXISTS `technicians`;

-- Add active column to users table
ALTER TABLE `users` ADD COLUMN `active` TINYINT(1) DEFAULT 1 AFTER `role`;

-- Modify maintenanceschedules table to use user_id instead of technician_id
ALTER TABLE `maintenanceschedules` CHANGE `technician_id` `user_id` INT(11) NOT NULL;

-- Add foreign key constraint for the new user_id column
ALTER TABLE `maintenanceschedules` ADD CONSTRAINT `maintenanceschedules_ibfk_2` 
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

-- Update existing users to be active
UPDATE `users` SET `active` = 1;

-- Insert additional sample users (technicians)
INSERT INTO `users` (`name`, `email`, `password`, `role`, `active`, `phone`, `address`) VALUES
('Tech John Smith', 'john.tech@example.com', '$2y$10$aL7wOelpNXZxQi.SUpTLf.Kz09foZMoMridkU5cdiqE6Us57Fy.Dy', 'technician', 1, '0909444444', '456 Tech Street, District 1, HCMC'),
('Tech Sarah Johnson', 'sarah.tech@example.com', '$2y$10$aL7wOelpNXZxQi.SUpTLf.Kz09foZMoMridkU5cdiqE6Us57Fy.Dy', 'technician', 1, '0909555555', '789 Service Ave, District 2, HCMC'),
('Tech Mike Wilson', 'mike.tech@example.com', '$2y$10$aL7wOelpNXZxQi.SUpTLf.Kz09foZMoMridkU5cdiqE6Us57Fy.Dy', 'technician', 1, '0909666666', '321 Repair Blvd, District 3, HCMC');

-- Update maintenanceschedules to use valid user IDs (technicians)
UPDATE `maintenanceschedules` SET `user_id` = 7 WHERE `id` = 1;
UPDATE `maintenanceschedules` SET `user_id` = 8 WHERE `id` = 2;
UPDATE `maintenanceschedules` SET `user_id` = 9 WHERE `id` = 3;
UPDATE `maintenanceschedules` SET `user_id` = 8 WHERE `id` = 4;

-- Insert additional devices for better test data
INSERT INTO `devices` (`user_id`, `name`, `serial_number`, `status`, `technician_note`) VALUES
(3, 'Máy lạnh phòng ngủ', 'AC10003', 'normal', NULL),
(4, 'Máy rửa chén', 'DW40001', 'normal', NULL),
(2, 'Lò vi sóng', 'MW50001', 'issue', 'Cần kiểm tra chức năng hẹn giờ'),
(3, 'Quạt trần phòng khách', 'CF60001', 'maintenance', 'Đã thay bộ điều khiển');

-- Insert additional maintenance schedules
INSERT INTO `maintenanceschedules` (`order_id`, `user_id`, `device_id`, `scheduled_date`, `status`, `note`) VALUES
(2, 7, 8, '2025-09-22 10:00:00', 'confirmed', 'Bảo trì máy lạnh phòng ngủ'),
(1, 8, 9, '2025-09-28 14:30:00', 'assigned', 'Kiểm tra máy rửa chén'),
(2, 9, 10, '2025-10-02 09:00:00', 'pending', 'Sửa chữa lò vi sóng'),
(3, 7, 11, '2025-10-05 11:00:00', 'in_progress', 'Bảo trì quạt trần');

-- Update contract end requests with more realistic data
UPDATE `contractendrequests` SET `note` = 'Khách hàng chuyển địa chỉ mới, yêu cầu kết thúc hợp đồng' WHERE `id` = 1;
INSERT INTO `contractendrequests` (`order_id`, `status`, `note`) VALUES
(3, 'pending', 'Yêu cầu kết thúc do không hài lòng với dịch vụ');

-- Add more maintenance reminders
INSERT INTO `maintenancereminders` (`schedule_id`, `reminder_date`, `sent_status`) VALUES
(5, '2025-09-21 08:00:00', 'pending'),
(6, '2025-09-27 13:00:00', 'pending'),
(7, '2025-10-01 08:30:00', 'pending'),
(8, '2025-10-04 10:30:00', 'pending');