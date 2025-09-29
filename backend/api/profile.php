<?php
// Include CORS helper
include __DIR__ . '/../config/cors.php';
setCorsHeaders();

include __DIR__ . '/../config/db.php';
$method = $_SERVER['REQUEST_METHOD'];

// Lấy thông tin profile theo ID user
if ($method === 'GET') {
    $user_id = $_GET['user_id'] ?? 0;

    if (!$user_id) {
        http_response_code(400);
        echo json_encode(["error" => "ID người dùng là bắt buộc"]);
        exit();
    }

    // Lấy thông tin user
    $stmt = $pdo->prepare("
        SELECT 
            id, 
            name, 
            email, 
            role, 
            phone, 
            address, 
            active as is_active,
            created_at
        FROM users 
        WHERE id = ? AND active = 1
    ");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode(["error" => "Người dùng không tồn tại hoặc đã bị vô hiệu hóa"]);
        exit();
    }

    // Nếu là technician, lấy thêm thông tin công việc
    if ($user['role'] === 'technician') {
        $stmt = $pdo->prepare("
            SELECT 
                COUNT(*) as total_jobs,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_jobs,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as active_jobs,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_jobs
            FROM maintenanceschedules 
            WHERE user_id = ?
        ");
        $stmt->execute([$user_id]);
        $job_stats = $stmt->fetch();
        $user['job_statistics'] = $job_stats;
    }

    // Nếu là customer, lấy thông tin orders và devices
    if ($user['role'] === 'user') {
        // Lấy thông tin orders
        $stmt = $pdo->prepare("
            SELECT 
                COUNT(*) as total_orders,
                SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_orders,
                SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending_orders
            FROM orders 
            WHERE user_id = ?
        ");
        $stmt->execute([$user_id]);
        $order_stats = $stmt->fetch();
        $user['order_statistics'] = $order_stats;

        // Lấy thông tin devices
        $stmt = $pdo->prepare("
            SELECT 
                COUNT(*) as total_devices,
                SUM(CASE WHEN status = 'normal' THEN 1 ELSE 0 END) as normal_devices,
                SUM(CASE WHEN status = 'issue' THEN 1 ELSE 0 END) as issue_devices,
                SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_devices
            FROM devices 
            WHERE user_id = ?
        ");
        $stmt->execute([$user_id]);
        $device_stats = $stmt->fetch();
        $user['device_statistics'] = $device_stats;
    }

    echo json_encode($user);
    exit();
}

// Cập nhật thông tin profile
if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    $user_id = $_GET['user_id'] ?? $data['user_id'] ?? 0;

    if (!$user_id) {
        http_response_code(400);
        echo json_encode(["error" => "ID người dùng là bắt buộc"]);
        exit();
    }

    // Kiểm tra user tồn tại và active
    $stmt = $pdo->prepare("SELECT id, email FROM users WHERE id = ? AND active = 1");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode(["error" => "Người dùng không tồn tại hoặc đã bị vô hiệu hóa"]);
        exit();
    }

    $action = $data['action'] ?? 'update_info';

    if ($action === 'change_password') {
        // Đổi mật khẩu
        $current_password = $data['current_password'] ?? '';
        $new_password = $data['new_password'] ?? '';
        $confirm_password = $data['confirm_password'] ?? '';

        if (!$current_password || !$new_password || !$confirm_password) {
            http_response_code(400);
            echo json_encode(["error" => "Vui lòng nhập đầy đủ thông tin mật khẩu"]);
            exit();
        }

        if ($new_password !== $confirm_password) {
            http_response_code(400);
            echo json_encode(["error" => "Mật khẩu mới và xác nhận mật khẩu không khớp"]);
            exit();
        }

        if (strlen($new_password) < 6) {
            http_response_code(400);
            echo json_encode(["error" => "Mật khẩu mới phải có ít nhất 6 ký tự"]);
            exit();
        }

        // Kiểm tra mật khẩu hiện tại
        $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $user_data = $stmt->fetch();

        if (!password_verify($current_password, $user_data['password'])) {
            http_response_code(400);
            echo json_encode(["error" => "Mật khẩu hiện tại không đúng"]);
            exit();
        }

        // Cập nhật mật khẩu mới
        $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");

        if ($stmt->execute([$hashed_password, $user_id])) {
            echo json_encode(["success" => true, "message" => "Đổi mật khẩu thành công"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Lỗi server, không thể đổi mật khẩu"]);
        }
    } else {
        // Cập nhật thông tin cá nhân
        $name = trim($data['name'] ?? '');
        $phone = trim($data['phone'] ?? '');
        $address = trim($data['address'] ?? '');

        if (!$name) {
            http_response_code(400);
            echo json_encode(["error" => "Tên là bắt buộc"]);
            exit();
        }

        // Kiểm tra email nếu có thay đổi
        $email = trim($data['email'] ?? '');
        if ($email && $email !== $user['email']) {
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
            $stmt->execute([$email, $user_id]);
            if ($stmt->rowCount() > 0) {
                http_response_code(400);
                echo json_encode(["error" => "Email đã tồn tại"]);
                exit();
            }
        }

        // Chuẩn bị câu lệnh update
        $updateFields = ["name = ?", "phone = ?", "address = ?"];
        $params = [$name, $phone, $address];

        if ($email && $email !== $user['email']) {
            $updateFields[] = "email = ?";
            $params[] = $email;
        }

        $params[] = $user_id;

        $sql = "UPDATE users SET " . implode(", ", $updateFields) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);

        if ($stmt->execute($params)) {
            // Trả về thông tin đã cập nhật
            $stmt = $pdo->prepare("
                SELECT id, name, email, role, phone, address, active as is_active, created_at 
                FROM users 
                WHERE id = ?
            ");
            $stmt->execute([$user_id]);
            $updated_user = $stmt->fetch();

            echo json_encode([
                "success" => true,
                "message" => "Cập nhật thông tin thành công",
                "user" => $updated_user
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Lỗi server, không thể cập nhật thông tin"]);
        }
    }
    exit();
}



// Fallback for unsupported methods
http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
