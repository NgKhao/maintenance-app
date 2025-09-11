-- Thêm cột technician_note vào bảng devices
ALTER TABLE devices ADD COLUMN technician_note TEXT DEFAULT NULL;
