<?php

/**
 * Technician Stats API  
 * Lấy thống kê đánh giá kỹ thuật viên
 * 
 * GET /api/technician_stats.php - Thống kê tất cả kỹ thuật viên (cho admin)
 */

include __DIR__ . '/../config/cors.php';
setCorsHeaders();
include __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        // Thống kê tất cả kỹ thuật viên với rating trung bình
        $stmt = $pdo->prepare("
            SELECT 
                u.id,
                u.name,
                u.email,
                u.phone,
                COUNT(DISTINCT ms.id) AS total_schedules,
                COUNT(DISTINCT CASE WHEN ms.status = 'completed' THEN ms.id END) AS completed_schedules,
                COUNT(DISTINCT r.id) AS total_reviews,
                COALESCE(AVG(r.rating), 0) AS average_rating
            FROM users u
            LEFT JOIN maintenanceschedules ms ON u.id = ms.user_id
            LEFT JOIN reviews r ON u.id = r.technician_id
            WHERE u.role = 'technician' AND u.active = 1
            GROUP BY u.id, u.name, u.email, u.phone
            ORDER BY average_rating DESC, total_reviews DESC
        ");
        $stmt->execute();
        echo json_encode($stmt->fetchAll());
        exit();
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Lỗi server"]);
        exit();
    }
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
