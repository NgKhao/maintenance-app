<?php

/**
 * Reviews API
 * API đánh giá kỹ thuật viên sau khi hoàn thành bảo trì
 * 
 * POST /api/reviews.php - Khách hàng tạo đánh giá
 * GET  /api/reviews.php?technician_id=X - Xem đánh giá của kỹ thuật viên
 */

include __DIR__ . '/../config/cors.php';
setCorsHeaders();
include __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

/**
 * GET - Lấy danh sách đánh giá của kỹ thuật viên
 */
if ($method === 'GET') {
    $technician_id = $_GET['technician_id'] ?? null;

    if (!$technician_id) {
        http_response_code(400);
        echo json_encode(["error" => "Thiếu technician_id"]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("
            SELECT r.*, 
                   u.name AS user_name,
                   ms.scheduled_date,
                   d.name AS device_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN maintenanceschedules ms ON r.schedule_id = ms.id
            JOIN devices d ON ms.device_id = d.id
            WHERE r.technician_id = ?
            ORDER BY r.created_at DESC
        ");
        $stmt->execute([$technician_id]);
        echo json_encode($stmt->fetchAll());
        exit();
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Lỗi server"]);
        exit();
    }
}

/**
 * POST - Khách hàng tạo đánh giá
 */
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $schedule_id = $data['schedule_id'] ?? null;
    $user_id = $data['user_id'] ?? null;
    $rating = $data['rating'] ?? null;
    $comment = trim($data['comment'] ?? '');

    // Validation
    if (!$schedule_id || !$user_id || !$rating) {
        http_response_code(400);
        echo json_encode(["error" => "Thiếu thông tin bắt buộc"]);
        exit();
    }

    if ($rating < 1 || $rating > 5) {
        http_response_code(400);
        echo json_encode(["error" => "Rating phải từ 1-5"]);
        exit();
    }

    try {
        // Kiểm tra lịch
        $stmtSchedule = $pdo->prepare("
            SELECT ms.user_id AS technician_id, o.user_id AS customer_id, ms.status
            FROM maintenanceschedules ms
            JOIN orders o ON ms.order_id = o.id
            WHERE ms.id = ?
        ");
        $stmtSchedule->execute([$schedule_id]);
        $schedule = $stmtSchedule->fetch();

        if (!$schedule) {
            http_response_code(404);
            echo json_encode(["error" => "Không tìm thấy lịch bảo trì"]);
            exit();
        }

        // Kiểm tra quyền
        if ($schedule['customer_id'] != $user_id) {
            http_response_code(403);
            echo json_encode(["error" => "Bạn không có quyền đánh giá lịch này"]);
            exit();
        }

        // Kiểm tra status
        if ($schedule['status'] !== 'completed') {
            http_response_code(400);
            echo json_encode(["error" => "Chỉ đánh giá sau khi hoàn thành"]);
            exit();
        }

        // Kiểm tra đã đánh giá chưa
        $stmtCheck = $pdo->prepare("SELECT id FROM reviews WHERE schedule_id = ?");
        $stmtCheck->execute([$schedule_id]);
        if ($stmtCheck->fetch()) {
            http_response_code(400);
            echo json_encode(["error" => "Lịch này đã được đánh giá"]);
            exit();
        }

        // Tạo đánh giá
        $stmt = $pdo->prepare("
            INSERT INTO reviews (schedule_id, user_id, technician_id, rating, comment)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$schedule_id, $user_id, $schedule['technician_id'], $rating, $comment]);

        echo json_encode([
            "success" => true,
            "message" => "Đánh giá thành công"
        ]);
        exit();
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Lỗi server"]);
        exit();
    }
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
