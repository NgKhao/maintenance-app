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

include './config/db.php';
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    $user_id = $_GET['user_id'] ?? null;
    $technician_id = $_GET['technician_id'] ?? null;

    if ($technician_id) {
        // Lấy lịch cho kỹ thuật viên cụ thể
        $stmt = $pdo->prepare("
            SELECT s.*, 
                   u.name as user_name, u.email as user_email,
                   d.name as device_name, d.serial_number,
                   t.name as technician_name
            FROM maintenanceschedules s
            JOIN orders o ON s.order_id = o.id
            JOIN users u ON o.user_id = u.id
            JOIN devices d ON s.device_id = d.id
            JOIN technicians t ON s.technician_id = t.id
            WHERE s.technician_id = ?
            ORDER BY s.scheduled_date ASC
        ");
        $stmt->execute([$technician_id]);
    } elseif ($user_id) {
        // Lấy lịch cho user cụ thể (thông qua orders)
        $stmt = $pdo->prepare("
            SELECT s.*, 
                   u.name as user_name, u.email as user_email,
                   d.name as device_name, d.serial_number,
                   t.name as technician_name
            FROM maintenanceschedules s
            JOIN orders o ON s.order_id = o.id
            JOIN users u ON o.user_id = u.id
            JOIN devices d ON s.device_id = d.id
            JOIN technicians t ON s.technician_id = t.id
            WHERE o.user_id = ?
            ORDER BY s.scheduled_date ASC
        ");
        $stmt->execute([$user_id]);
    } else {
        // Lấy tất cả lịch (admin)
        $stmt = $pdo->query("
            SELECT s.*, 
                   u.name as user_name, u.email as user_email,
                   d.name as device_name, d.serial_number,
                   t.name as technician_name
            FROM maintenanceschedules s
            JOIN orders o ON s.order_id = o.id
            JOIN users u ON o.user_id = u.id
            JOIN devices d ON s.device_id = d.id
            JOIN technicians t ON s.technician_id = t.id
            ORDER BY s.scheduled_date ASC
        ");
    }

    echo json_encode($stmt->fetchAll());
    exit();
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $order_id = $data['order_id'] ?? 0;
    $technician_id = $data['technician_id'] ?? 0;
    $device_id = $data['device_id'] ?? 0;
    $scheduled_date = $data['scheduled_date'] ?? date('Y-m-d H:i:s');
    $note = trim($data['note'] ?? '');

    if (!$order_id || !$technician_id || !$device_id) {
        http_response_code(400);
        echo json_encode(["error" => "Order, Technician, Device bắt buộc"]);
        exit();
    }

    // Kiểm tra xem order có tồn tại không
    $stmt = $pdo->prepare("SELECT id FROM orders WHERE id = ?");
    $stmt->execute([$order_id]);
    if ($stmt->rowCount() === 0) {
        http_response_code(400);
        echo json_encode(["error" => "Đơn hàng không tồn tại"]);
        exit();
    }

    // Kiểm tra xem technician có available không
    $stmt = $pdo->prepare("SELECT status FROM technicians WHERE id = ?");
    $stmt->execute([$technician_id]);
    $tech = $stmt->fetch();
    if (!$tech) {
        http_response_code(400);
        echo json_encode(["error" => "Kỹ thuật viên không tồn tại"]);
        exit();
    }

    $stmt = $pdo->prepare("INSERT INTO maintenanceschedules (order_id, technician_id, device_id, scheduled_date, note) VALUES (?, ?, ?, ?, ?)");
    if ($stmt->execute([$order_id, $technician_id, $device_id, $scheduled_date, $note])) {
        echo json_encode(["success" => true, "message" => "Đặt lịch bảo trì thành công"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Lỗi server, không thể đặt lịch"]);
    }
    exit();
}

// Cập nhật trạng thái lịch
if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);

    $id = $data['id'] ?? 0;
    $status = $data['status'] ?? '';
    $note = trim($data['note'] ?? '');

    if (!$id || !$status) {
        http_response_code(400);
        echo json_encode(["error" => "ID và trạng thái bắt buộc"]);
        exit();
    }

    $stmt = $pdo->prepare("UPDATE maintenanceschedules SET status = ?, note = ? WHERE id = ?");
    if ($stmt->execute([$status, $note, $id])) {
        echo json_encode(["success" => true, "message" => "Cập nhật lịch bảo trì thành công"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Lỗi server, không thể cập nhật"]);
    }
    exit();
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? 0;

    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "ID lịch bắt buộc"]);
        exit();
    }

    $stmt = $pdo->prepare("DELETE FROM maintenanceschedules WHERE id = ?");
    if ($stmt->execute([$id])) {
        echo json_encode(["success" => true, "message" => "Xóa lịch bảo trì thành công"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Lỗi server, không thể xóa lịch"]);
    }
    exit();
}

// Fallback for unsupported methods
http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
