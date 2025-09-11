-- Cập nhật database để fix lỗi scheduling
-- 1. Update technicians status
UPDATE technicians SET status = 'active' WHERE status = '' OR status IS NULL;

-- 2. Đảm bảo maintenanceschedules có technician_id có thể NULL (cho pending requests)
ALTER TABLE maintenanceschedules MODIFY COLUMN technician_id int(11) NULL;

-- 3. Add some sample pending schedules for testing
INSERT INTO maintenanceschedules (order_id, device_id, scheduled_date, status, note) VALUES
(1, 1, '2025-09-20 10:00:00', 'pending', 'Khách hàng yêu cầu bảo trì máy lạnh'),
(2, 3, '2025-09-22 14:00:00', 'pending', 'Tủ lạnh cần kiểm tra');
