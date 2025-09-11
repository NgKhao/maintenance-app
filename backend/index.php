<?php
header("Content-Type: application/json");

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
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
?>