<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include './config/db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Lấy danh sách technicians
    $stmt = $pdo->query("SELECT * FROM Technicians");
    echo json_encode($stmt->fetchAll());
    exit();
}

if ($method === 'POST') {
    // User đặt lịch
    $user_id = $_POST['user_id'] ?? 0;
    $technician_id = $_POST['technician_id'] ?? 0;
    $device_id = $_POST['device_id'] ?? 0;
    $scheduled_date = $_POST['scheduled_date'] ?? date('Y-m-d H:i:s');
    $note = $_POST['note'] ?? '';

    if (!$user_id || !$technician_id || !$device_id) {
        http_response_code(400);
        echo json_encode(["error" => "User, Technician và Device bắt buộc"]);
        exit;
    }

    // Kiểm tra technician có rảnh vào thời gian này chưa
    $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM MaintenanceSchedules WHERE technician_id=? AND scheduled_date=? AND status='pending'");
    $stmt->execute([$technician_id, $scheduled_date]);
    $busy = $stmt->fetch();
    if ($busy['cnt'] > 0) {
        http_response_code(400);
        echo json_encode(["error" => "Technician đã bận vào thời gian này"]);
        exit;
    }

    // Tạo lịch
    $stmt = $pdo->prepare("INSERT INTO MaintenanceSchedules (order_id, technician_id, device_id, scheduled_date, status, note) VALUES (?, ?, ?, ?, 'pending', ?)");
    // order_id tạm = 0 nếu user chưa tạo order, hoặc bạn có thể gắn order thực tế
    if ($stmt->execute([0, $technician_id, $device_id, $scheduled_date, $note])) {
        echo json_encode(["success" => true, "message" => "Đặt lịch thành công, chờ technician duyệt"]);
    }
}
?>