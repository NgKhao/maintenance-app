<?php
// Include CORS helper
include __DIR__ . '/../config/cors.php';
setCorsHeaders();

include __DIR__ . '/../config/db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        // Handle single package request
        if (isset($_GET['id']) && !empty($_GET['id'])) {
            $id = intval($_GET['id']);
            $stmt = $pdo->prepare("SELECT * FROM MaintenancePackages WHERE id = ?");
            $stmt->execute([$id]);
            $result = $stmt->fetch();

            if ($result) {
                echo json_encode($result);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Không tìm thấy gói bảo trì"]);
            }
        } else {
            // Get all packages
            $stmt = $pdo->query("SELECT * FROM MaintenancePackages ORDER BY created_at DESC");
            echo json_encode($stmt->fetchAll());
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Lỗi khi tải dữ liệu"]);
    }
}

if ($method === 'POST') {
    // Read JSON data from input stream
    $input = json_decode(file_get_contents('php://input'), true);

    $name = trim($input['name'] ?? '');
    $description = trim($input['description'] ?? '');
    $price = floatval($input['price'] ?? 0);
    $duration = intval($input['duration_months'] ?? 12);

    if (empty($name) || $price <= 0) {
        http_response_code(400);
        echo json_encode(["error" => "Tên và giá gói bắt buộc"]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO MaintenancePackages (name,description,price,duration_months) VALUES (?,?,?,?)");
        if ($stmt->execute([$name, $description, $price, $duration])) {
            echo json_encode(["success" => true, "message" => "Thêm gói thành công"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Lỗi khi thêm gói bảo trì"]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Lỗi database: " . $e->getMessage()]);
    }
}

if ($method === 'PUT') {
    // Read JSON data from input stream
    $input = json_decode(file_get_contents('php://input'), true);

    $id = intval($input['id'] ?? 0);
    $name = trim($input['name'] ?? '');
    $description = trim($input['description'] ?? '');
    $price = floatval($input['price'] ?? 0);
    $duration = intval($input['duration_months'] ?? 12);

    if ($id <= 0 || empty($name) || $price <= 0) {
        http_response_code(400);
        echo json_encode(["error" => "ID, tên và giá gói bắt buộc"]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("UPDATE MaintenancePackages SET name=?, description=?, price=?, duration_months=? WHERE id=?");
        if ($stmt->execute([$name, $description, $price, $duration, $id])) {
            if ($stmt->rowCount() > 0) {
                echo json_encode(["success" => true, "message" => "Cập nhật gói thành công"]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Không tìm thấy gói bảo trì hoặc không có thay đổi"]);
            }
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Lỗi khi cập nhật gói bảo trì"]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Lỗi database: " . $e->getMessage()]);
    }
}

if ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);

    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(["error" => "ID gói bảo trì không hợp lệ"]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM MaintenancePackages WHERE id=?");
        if ($stmt->execute([$id])) {
            if ($stmt->rowCount() > 0) {
                echo json_encode(["success" => true, "message" => "Xóa gói thành công"]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Không tìm thấy gói bảo trì"]);
            }
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Lỗi khi xóa gói bảo trì"]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Lỗi database: " . $e->getMessage()]);
    }
}