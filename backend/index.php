<?php
header("Content-Type: application/json");

// Determine origin
$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: http://localhost:3001");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
// Lấy thông tin API từ URL
$api = $_GET['api'] ?? '';
$action = $_GET['action'] ?? '';

// Đường dẫn đến thư mục api
$apiFile = __DIR__ . "/api/$api.php";

// Kiểm tra file api có tồn tại
if (file_exists($apiFile)) {
    include $apiFile;
} else {
    http_response_code(404);
    echo json_encode([
        "error" => "API '$api' không tồn tại"
    ]);
}
