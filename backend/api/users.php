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

// Lấy danh sách users với filter theo role
if ($method === 'GET') {
    $role = $_GET['role'] ?? '';
    $active = $_GET['active'] ?? '';

    $whereClause = "";
    $params = [];

    if ($role) {
        $whereClause = "WHERE role = ?";
        $params[] = $role;

        if ($active !== '') {
            $whereClause .= " AND active = ?";
            $params[] = (int)$active;
        }
    } elseif ($active !== '') {
        $whereClause = "WHERE active = ?";
        $params[] = (int)$active;
    }

    $stmt = $pdo->prepare("
        SELECT 
            u.id, 
            u.name, 
            u.email, 
            u.role, 
            u.active, 
            u.phone, 
            u.address, 
            u.created_at,
            CASE 
                WHEN u.role = 'technician' THEN 
                    (SELECT COUNT(*) FROM maintenanceschedules ms WHERE ms.user_id = u.id AND ms.status IN ('assigned', 'confirmed', 'in_progress'))
                ELSE 0 
            END as active_jobs
        FROM users u
        $whereClause 
        ORDER BY u.created_at DESC
    ");
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll());
    exit();
}

// Thêm user mới
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $name = trim($data['name'] ?? '');
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $role = $data['role'] ?? 'user';
    $phone = trim($data['phone'] ?? '');
    $address = trim($data['address'] ?? '');
    $active = isset($data['active']) ? (int)$data['active'] : 1;

    if (!$name || !$email || !$password) {
        http_response_code(400);
        echo json_encode(["error" => "Tên, email và mật khẩu là bắt buộc"]);
        exit();
    }

    // Kiểm tra email đã tồn tại
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(["error" => "Email đã tồn tại"]);
        exit();
    }

    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("
        INSERT INTO users (name, email, password, role, phone, address, active) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");

    if ($stmt->execute([$name, $email, $hashed, $role, $phone, $address, $active])) {
        echo json_encode([
            "success" => true,
            "message" => "Thêm " . ($role === 'technician' ? 'kỹ thuật viên' : 'người dùng') . " thành công"
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Lỗi server, không thể thêm user"]);
    }
    exit();
}

// Cập nhật thông tin user
if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    $action = $data['action'] ?? 'update';

    if ($action === 'reset_password') {
        // Reset mật khẩu - tự động generate password mới
        $id = $_GET['id'] ?? $data['id'] ?? 0;

        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "ID user là bắt buộc"]);
            exit();
        }

        // Kiểm tra user tồn tại
        $stmt = $pdo->prepare("SELECT name, email FROM users WHERE id = ?");
        $stmt->execute([$id]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(404);
            echo json_encode(["error" => "Người dùng không tồn tại"]);
            exit();
        }

        // Generate password mới (8 ký tự random)
        $new_password = substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'), 0, 8);
        $hashed = password_hash($new_password, PASSWORD_DEFAULT);

        $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");

        if ($stmt->execute([$hashed, $id])) {
            echo json_encode([
                "success" => true,
                "message" => "Reset mật khẩu thành công",
                "new_password" => $new_password,
                "user_name" => $user['name'],
                "user_email" => $user['email']
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Lỗi server, không thể reset mật khẩu"]);
        }
    } elseif ($action === 'toggle_active') {
        // Toggle trạng thái active
        $id = $_GET['id'] ?? $data['id'] ?? 0;
        $active = $data['active'] ?? 1;

        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "ID user là bắt buộc"]);
            exit();
        }

        $stmt = $pdo->prepare("UPDATE users SET active = ? WHERE id = ?");

        if ($stmt->execute([$active, $id])) {
            $status = $active ? 'Kích hoạt' : 'Vô hiệu hóa';
            echo json_encode(["success" => true, "message" => "$status tài khoản thành công"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Lỗi server, không thể thay đổi trạng thái"]);
        }
    } else {
        // Cập nhật thông tin thường
        $id = $_GET['id'] ?? $data['id'] ?? 0;
        $name = trim($data['name'] ?? '');
        $email = trim($data['email'] ?? '');
        $phone = trim($data['phone'] ?? '');
        $role = $data['role'] ?? '';
        $active = isset($data['active']) ? (int)$data['active'] : 1;

        if (!$id || !$name || !$email) {
            http_response_code(400);
            echo json_encode(["error" => "ID, tên và email là bắt buộc"]);
            exit();
        }

        // Kiểm tra email đã tồn tại (trừ user hiện tại)
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        $stmt->execute([$email, $id]);
        if ($stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(["error" => "Email đã tồn tại"]);
            exit();
        }

        $stmt = $pdo->prepare("
            UPDATE users 
            SET name = ?, email = ?, phone = ?, role = ?, active = ? 
            WHERE id = ?
        ");

        if ($stmt->execute([$name, $email, $phone, $role, $active, $id])) {
            echo json_encode(["success" => true, "message" => "Cập nhật thông tin thành công"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Lỗi server, không thể cập nhật"]);
        }
    }
    exit();
}

// Xóa user (soft delete bằng cách set active = 0)
if ($method === 'DELETE') {
    $id = $_GET['id'] ?? 0;

    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "ID user là bắt buộc"]);
        exit();
    }

    // Kiểm tra user có đang có dữ liệu liên quan không
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count FROM orders WHERE user_id = ?
        UNION ALL
        SELECT COUNT(*) as count FROM devices WHERE user_id = ?
        UNION ALL
        SELECT COUNT(*) as count FROM maintenanceschedules WHERE user_id = ?
    ");
    $stmt->execute([$id, $id, $id]);
    $results = $stmt->fetchAll();

    $hasRelatedData = false;
    foreach ($results as $result) {
        if ($result['count'] > 0) {
            $hasRelatedData = true;
            break;
        }
    }

    if ($hasRelatedData) {
        // Soft delete - chỉ deactivate
        $stmt = $pdo->prepare("UPDATE users SET active = 0 WHERE id = ?");
        if ($stmt->execute([$id])) {
            echo json_encode(["success" => true, "message" => "Vô hiệu hóa tài khoản thành công"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Lỗi server, không thể vô hiệu hóa"]);
        }
    } else {
        // Hard delete - xóa hoàn toàn
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        if ($stmt->execute([$id])) {
            echo json_encode(["success" => true, "message" => "Xóa tài khoản thành công"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Lỗi server, không thể xóa"]);
        }
    }
    exit();
}

// Fallback for unsupported methods
http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
