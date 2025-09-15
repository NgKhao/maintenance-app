<?php
// Include CORS helper
include __DIR__ . '/../config/cors.php';
setCorsHeaders();

include __DIR__ . '/../config/db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Lấy danh sách technicians từ users table
    $stmt = $pdo->prepare("
        SELECT id, name, email, phone, active as status
        FROM users 
        WHERE role = 'technician' AND active = 1
        ORDER BY name ASC
    ");
    $stmt->execute();
    echo json_encode($stmt->fetchAll());
    exit();
}

if ($method === 'POST') {
    // API này chỉ để lấy danh sách technicians
    // Việc đặt lịch được xử lý ở schedules.php
    http_response_code(405);
    echo json_encode(["error" => "POST method not supported. Use schedules.php for booking."]);
    exit();
}

// Fallback for unsupported methods
http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
