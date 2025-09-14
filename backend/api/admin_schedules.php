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

include __DIR__ . '/../config/db.php';
$method = $_SERVER['REQUEST_METHOD'];

// Admin xem tất cả yêu cầu đặt lịch
if ($method === 'GET') {
    $status = $_GET['status'] ?? '';

    $whereClause = "";
    $params = [];

    if ($status) {
        $whereClause = "WHERE ms.status = ?";
        $params[] = $status;
    }

    $stmt = $pdo->prepare("
        SELECT 
            ms.id,
            ms.scheduled_date,
            ms.note as customer_note,
            ms.status,
            ms.created_at,
            u.name as customer_name,
            u.phone as customer_phone,
            d.name as device_name,
            d.serial_number,
            t.name as technician_name,
            mp.name as package_name
        FROM maintenanceschedules ms
        LEFT JOIN orders o ON ms.order_id = o.id
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN devices d ON ms.device_id = d.id
        LEFT JOIN users t ON ms.user_id = t.id AND t.role = 'technician'
        LEFT JOIN maintenancepackages mp ON o.package_id = mp.id
        $whereClause
        ORDER BY ms.created_at DESC
    ");

    $stmt->execute($params);
    echo json_encode($stmt->fetchAll());
    exit();
}

// Admin phân công kỹ thuật viên cho yêu cầu đặt lịch
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $schedule_id = $data['schedule_id'] ?? 0;
    $technician_id = $data['technician_id'] ?? 0;
    $scheduled_date = $data['scheduled_date'] ?? '';

    if (!$schedule_id || !$technician_id || !$scheduled_date) {
        http_response_code(400);
        echo json_encode(["error" => "Lịch, kỹ thuật viên và ngày hẹn bắt buộc"]);
        exit();
    }

    // Kiểm tra technician tồn tại
    $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ? AND role = 'technician' AND active = 1");
    $stmt->execute([$technician_id]);
    if ($stmt->rowCount() === 0) {
        http_response_code(400);
        echo json_encode(["error" => "Kỹ thuật viên không tồn tại hoặc không hoạt động"]);
        exit();
    }

    // Cập nhật phân công
    $stmt = $pdo->prepare("
        UPDATE maintenanceschedules 
        SET user_id = ?, scheduled_date = ?, status = 'assigned'
        WHERE id = ?
    ");

    if ($stmt->execute([$technician_id, $scheduled_date, $schedule_id])) {
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                "success" => true,
                "message" => "Phân công kỹ thuật viên thành công"
            ]);
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Lịch không tồn tại"]);
        }
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Lỗi server"]);
    }
    exit();
}

// Admin lấy danh sách kỹ thuật viên
if ($method === 'PUT') {
    $stmt = $pdo->prepare("
        SELECT id, name, phone, active as status 
        FROM users 
        WHERE role = 'technician' AND active = 1
        ORDER BY name ASC
    ");
    $stmt->execute();
    echo json_encode($stmt->fetchAll());
    exit();
}

// Fallback for unsupported methods
http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
