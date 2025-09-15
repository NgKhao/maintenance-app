<?php
// Include CORS helper
include __DIR__ . '/../config/cors.php';
setCorsHeaders();

include __DIR__ . '/../config/db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM MaintenancePackages");
    echo json_encode($stmt->fetchAll());
}

if ($method === 'POST') {
    $name = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';
    $price = $_POST['price'] ?? 0;
    $duration = $_POST['duration_months'] ?? 12;

    if ($name == '' || $price <= 0) {
        http_response_code(400);
        echo json_encode(["error" => "Tên và giá gói bắt buộc"]);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO MaintenancePackages (name,description,price,duration_months) VALUES (?,?,?,?)");
    if ($stmt->execute([$name, $description, $price, $duration])) {
        echo json_encode(["success" => true, "message" => "Thêm gói thành công"]);
    }
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? 0;
    $stmt = $pdo->prepare("DELETE FROM MaintenancePackages WHERE id=?");
    if ($stmt->execute([$id])) {
        echo json_encode(["success" => true, "message" => "Xóa gói thành công"]);
    }
}
