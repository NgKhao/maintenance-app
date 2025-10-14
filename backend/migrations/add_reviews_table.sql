-- Migration: Add Reviews Table
-- Thêm bảng đánh giá kỹ thuật viên sau khi hoàn thành bảo trì

CREATE TABLE IF NOT EXISTS `reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `schedule_id` int(11) NOT NULL COMMENT 'ID lịch bảo trì',
  `user_id` int(11) NOT NULL COMMENT 'ID khách hàng đánh giá',
  `technician_id` int(11) NOT NULL COMMENT 'ID kỹ thuật viên được đánh giá',
  `rating` tinyint(1) NOT NULL COMMENT 'Điểm đánh giá từ 1-5',
  `comment` text DEFAULT NULL COMMENT 'Nhận xét của khách hàng',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_schedule_review` (`schedule_id`),
  KEY `idx_reviews_technician_id` (`technician_id`),
  CONSTRAINT `fk_reviews_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `maintenanceschedules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_technician` FOREIGN KEY (`technician_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_rating_range` CHECK (`rating` >= 1 AND `rating` <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
