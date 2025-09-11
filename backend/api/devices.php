<?php
// Allow from any origin
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include './config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $user_id = $_GET['user_id'] ?? null;

    if ($user_id) {
        // Lấy thiết bị của user cụ thể với thông tin user
        $stmt = $pdo->prepare("
            SELECT d.*, u.name as user_name, u.email as user_email
            FROM devices d
            JOIN users u ON d.user_id = u.id
            WHERE d.user_id = ?
            ORDER BY d.created_at DESC
        ");
        $stmt->execute([$user_id]);
    } else {
        // Lấy tất cả thiết bị với thông tin user
        $stmt = $pdo->query("
            SELECT d.*, u.name as user_name, u.email as user_email
            FROM devices d
            JOIN users u ON d.user_id = u.id
            ORDER BY d.created_at DESC
        ");
    }

    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit();
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $user_id = $data['user_id'] ?? 0;
    $name = trim($data['name'] ?? '');
    $serial = trim($data['serial_number'] ?? '');
    $status = $data['status'] ?? 'normal';
    $technician_note = trim($data['technician_note'] ?? '');

    if (!$user_id || !$name) {
        http_response_code(400);
        echo json_encode(["error" => "Thiết bị phải có user và tên"]);
        exit();
    }

    // Kiểm tra serial number trùng (nếu có)
    if ($serial) {
        $stmt = $pdo->prepare("SELECT id FROM devices WHERE serial_number = ?");
        $stmt->execute([$serial]);
        if ($stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(["error" => "Serial number đã tồn tại"]);
            exit();
        }
    }

    $stmt = $pdo->prepare("INSERT INTO devices (user_id,name,serial_number,status,technician_note) VALUES (?,?,?,?,?)");
    if ($stmt->execute([$user_id, $name, $serial, $status, $technician_note])) {
        echo json_encode(["success" => true, "message" => "Thêm thiết bị thành công"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Lỗi server, không thể thêm thiết bị"]);
    }
    exit();
}

// ✅ UPDATE thiết bị
if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id'] ?? 0;

    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "ID thiết bị là bắt buộc"]);
        exit();
    }

    // Kiểm tra có trường nào để update
    $updateFields = [];
    $updateValues = [];

    if (isset($data['name']) && trim($data['name']) !== '') {
        $updateFields[] = "name = ?";
        $updateValues[] = trim($data['name']);
    }

    if (isset($data['serial_number'])) {
        $serial = trim($data['serial_number']);
        // Kiểm tra serial number trùng (trừ chính nó)
        if ($serial) {
            $stmt = $pdo->prepare("SELECT id FROM devices WHERE serial_number = ? AND id != ?");
            $stmt->execute([$serial, $id]);
            if ($stmt->rowCount() > 0) {
                http_response_code(400);
                echo json_encode(["error" => "Serial number đã tồn tại"]);
                exit();
            }
        }
        $updateFields[] = "serial_number = ?";
        $updateValues[] = $serial;
    }

    if (isset($data['status'])) {
        $updateFields[] = "status = ?";
        $updateValues[] = $data['status'];
    }

    if (isset($data['technician_note'])) {
        $updateFields[] = "technician_note = ?";
        $updateValues[] = trim($data['technician_note']);
    }

    if (empty($updateFields)) {
        http_response_code(400);
        echo json_encode(["error" => "Không có trường nào để cập nhật"]);
        exit();
    }

    $updateValues[] = $id; // Thêm ID vào cuối cho WHERE clause
    $sql = "UPDATE devices SET " . implode(", ", $updateFields) . " WHERE id = ?";

    $stmt = $pdo->prepare($sql);
    if ($stmt->execute($updateValues)) {
        echo json_encode(["success" => true, "message" => "Cập nhật thiết bị thành công"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Lỗi server, không thể cập nhật thiết bị"]);
    }
    exit();
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? 0;

    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "ID thiết bị bắt buộc"]);
        exit();
    }

    $stmt = $pdo->prepare("DELETE FROM devices WHERE id=?");
    if ($stmt->execute([$id])) {
        echo json_encode(["success" => true, "message" => "Xóa thiết bị thành công"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Lỗi server, không thể xóa thiết bị"]);
    }
    exit();
}

// Fallback for unsupported methods
http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
