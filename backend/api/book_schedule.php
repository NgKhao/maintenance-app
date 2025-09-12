<?php
// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include '../config/db.php';
$method = $_SERVER['REQUEST_METHOD'];

// Khách hàng đặt lịch bảo trì
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $user_id = $data['user_id'] ?? 0;
    $device_id = $data['device_id'] ?? 0;
    $preferred_date = $data['preferred_date'] ?? '';
    $note = trim($data['note'] ?? '');

    if (!$user_id || !$device_id || !$preferred_date) {
        http_response_code(400);
        echo json_encode(["error" => "User, thiết bị và ngày mong muốn bắt buộc"]);
        exit();
    }

    // Kiểm tra user có order đang active không
    $stmt = $pdo->prepare("
        SELECT o.id 
        FROM orders o 
        WHERE o.user_id = ? 
        AND o.payment_status = 'paid' 
        AND o.end_date >= CURDATE()
        LIMIT 1
    ");
    $stmt->execute([$user_id]);
    $order = $stmt->fetch();

    if (!$order) {
        http_response_code(400);
        echo json_encode(["error" => "Bạn chưa có gói bảo trì hoặc gói đã hết hạn"]);
        exit();
    }

    // Kiểm tra thiết bị thuộc về user
    $stmt = $pdo->prepare("SELECT id FROM devices WHERE id = ? AND user_id = ?");
    $stmt->execute([$device_id, $user_id]);
    if ($stmt->rowCount() === 0) {
        http_response_code(400);
        echo json_encode(["error" => "Thiết bị không thuộc về bạn"]);
        exit();
    }

    // Tạo yêu cầu đặt lịch (user_id = 999 placeholder, chờ admin phân công kỹ thuật viên)
    $stmt = $pdo->prepare("
        INSERT INTO maintenanceschedules (order_id, user_id, device_id, scheduled_date, note, status) 
        VALUES (?, 999, ?, ?, ?, 'pending')
    ");

    if ($stmt->execute([$order['id'], $device_id, $preferred_date, $note])) {
        echo json_encode([
            "success" => true,
            "message" => "Đặt lịch thành công! Chúng tôi sẽ phân công kỹ thuật viên và xác nhận với bạn sớm nhất."
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Lỗi server, không thể đặt lịch"]);
    }
    exit();
}

// Lấy danh sách thiết bị của user để đặt lịch
if ($method === 'GET') {
    $user_id = $_GET['user_id'] ?? 0;

    if (!$user_id) {
        http_response_code(400);
        echo json_encode(["error" => "User ID bắt buộc"]);
        exit();
    }

    // Lấy thiết bị của user
    $stmt = $pdo->prepare("
        SELECT d.id, d.name, d.serial_number, d.status
        FROM devices d
        WHERE d.user_id = ?
        ORDER BY d.name ASC
    ");
    $stmt->execute([$user_id]);

    echo json_encode($stmt->fetchAll());
    exit();
}

// Fallback for unsupported methods
http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
