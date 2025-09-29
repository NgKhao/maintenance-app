<?php
// Include CORS helper
include __DIR__ . '/../config/cors.php';
setCorsHeaders();

include __DIR__ . '/../config/db.php';
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    $user_id = $_GET['user_id'] ?? null;

    if ($action === 'contracts' && $user_id) {
        // Lấy hợp đồng của user với thông tin chi tiết
        $stmt = $pdo->prepare("
            SELECT o.*, 
                   u.name as user_name, u.email as user_email,
                   p.name as package_name, p.description as package_description, 
                   p.price as package_price, p.duration_months
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN maintenancepackages p ON o.package_id = p.id
            WHERE o.user_id = ?
            ORDER BY o.created_at DESC
        ");
        $stmt->execute([$user_id]);
        echo json_encode($stmt->fetchAll());
    } elseif ($user_id) {
        // Lấy đơn hàng của user cụ thể
        $stmt = $pdo->prepare("SELECT * FROM orders WHERE user_id = ?");
        $stmt->execute([$user_id]);
        echo json_encode($stmt->fetchAll());
    } else {
        // Lấy tất cả đơn hàng với thông tin user và package
        $stmt = $pdo->query("
            SELECT o.*, 
                   u.name as user_name, u.email as user_email,
                   p.name as package_name, p.price as package_price
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN maintenancepackages p ON o.package_id = p.id
            ORDER BY o.created_at DESC
        ");
        echo json_encode($stmt->fetchAll());
    }
}

if ($method === 'POST') {
    // Đọc JSON từ frontend
    $data = json_decode(file_get_contents("php://input"), true);
    $action = $data['action'] ?? 'user_register';

    // Admin tạo hợp đồng trực tiếp
    if ($action === 'admin_create') {
        $user_id = $data['user_id'] ?? 0;
        $package_id = $data['package_id'] ?? 0;
        $payment_status = $data['payment_status'] ?? 'pending';
        $start_date = $data['start_date'] ?? date('Y-m-d');
        $custom_price = $data['custom_price'] ?? null;
        $admin_note = $data['admin_note'] ?? '';

        if (!$user_id || !$package_id) {
            http_response_code(400);
            echo json_encode(["error" => "User và gói bảo trì bắt buộc"]);
            exit;
        }

        // Lấy thông tin package
        $stmt = $pdo->prepare("SELECT * FROM maintenancepackages WHERE id = ?");
        $stmt->execute([$package_id]);
        $package = $stmt->fetch();

        if (!$package) {
            http_response_code(400);
            echo json_encode(["error" => "Gói bảo trì không tồn tại"]);
            exit;
        }

        $end_date = date('Y-m-d', strtotime($start_date . ' + ' . $package['duration_months'] . ' months'));
        $amount = $custom_price ? $custom_price : $package['price'];
        $app_trans_id = 'ADMIN_' . date('ymd') . '_' . $user_id . '_' . time();

        // Tạo order do admin
        $stmt = $pdo->prepare("
            INSERT INTO orders (user_id, package_id, payment_status, start_date, end_date, app_trans_id, amount) 
            VALUES (?,?,?,?,?,?,?)
        ");

        if ($stmt->execute([$user_id, $package_id, $payment_status, $start_date, $end_date, $app_trans_id, $amount])) {
            $order_id = $pdo->lastInsertId();
            echo json_encode([
                "success" => true,
                "message" => "Tạo hợp đồng thành công",
                "order_id" => $order_id,
                "app_trans_id" => $app_trans_id
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Lỗi server, không thể tạo hợp đồng"]);
        }
        exit;
    }

    // User đăng ký dịch vụ (code cũ) 
    $user_id = $data['user_id'] ?? 0;
    $package_id = $data['package_id'] ?? 0;
    $start_date = $data['start_date'] ?? date('Y-m-d');

    if (!$user_id || !$package_id) {
        http_response_code(400);
        echo json_encode(["error" => "User và gói bảo trì bắt buộc"]);
        exit;
    }

    // Lấy thông tin gói bảo trì
    $stmt = $pdo->prepare("SELECT * FROM maintenancepackages WHERE id = ?");
    $stmt->execute([$package_id]);
    $package = $stmt->fetch();

    if (!$package) {
        http_response_code(400);
        echo json_encode(["error" => "Gói bảo trì không tồn tại"]);
        exit;
    }

    $end_date = date('Y-m-d', strtotime($start_date . ' + ' . $package['duration_months'] . ' months'));

    // Tạo mã giao dịch unique
    $app_trans_id = date('ymd') . '_' . $user_id . '_' . time();
    $amount = $package['price'];

    // Tạo order với thông tin ZaloPay
    $stmt = $pdo->prepare("
        INSERT INTO orders (user_id, package_id, payment_status, start_date, end_date, app_trans_id, amount) 
        VALUES (?,?,?,?,?,?,?)
    ");

    if ($stmt->execute([$user_id, $package_id, 'pending', $start_date, $end_date, $app_trans_id, $amount])) {
        $order_id = $pdo->lastInsertId();

        // Luôn sử dụng ZaloPay cho user registration
        // Đánh dấu rằng file đang được include, không phải gọi trực tiếp
        $GLOBALS['zalopay_included'] = true;

        // Gọi ZaloPay API để tạo payment URL
        include_once __DIR__ . '/zalopay_create.php';

        // Debug info
        if (env('APP_DEBUG', false)) {
            error_log("ZaloPay Debug - Order ID: $order_id, Amount: $amount, App Trans ID: $app_trans_id");
        }

        $zalopay_result = createZaloPayOrder($order_id, $amount, "Thanh toán gói bảo trì: " . $package['name'], $app_trans_id);

        // Debug response
        if (env('APP_DEBUG', false)) {
            error_log("ZaloPay Response: " . json_encode($zalopay_result));
        }

        if ($zalopay_result && $zalopay_result['return_code'] == 1) {
            echo json_encode([
                "success" => true,
                "message" => "Đăng ký dịch vụ thành công",
                "order_id" => $order_id,
                "payment_url" => $zalopay_result['order_url'],
                "order_url" => $zalopay_result['order_url'], // Backwards compatibility
                "app_trans_id" => $app_trans_id,
                "zp_trans_token" => $zalopay_result['zp_trans_token']
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "error" => "Không thể tạo liên kết thanh toán ZaloPay",
                "details" => $zalopay_result['return_message'] ?? 'Unknown error'
            ]);
        }
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Lỗi server, không thể tạo đơn hàng"]);
    }
}

// Cập nhật trạng thái thanh toán
if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id'] ?? 0;
    $payment_status = $data['payment_status'] ?? '';

    if (!$id || !$payment_status) {
        http_response_code(400);
        echo json_encode(["error" => "ID và trạng thái thanh toán bắt buộc"]);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE orders SET payment_status = ? WHERE id = ?");
    if ($stmt->execute([$payment_status, $id])) {
        echo json_encode(["success" => true, "message" => "Cập nhật trạng thái thành công"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Lỗi server, không thể cập nhật"]);
    }
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? 0;

    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "ID đơn hàng bắt buộc"]);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM orders WHERE id = ?");
    if ($stmt->execute([$id])) {
        echo json_encode(["success" => true, "message" => "Xóa đơn hàng thành công"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Lỗi server, không thể xóa đơn hàng"]);
    }
}

// Fallback for unsupported methods
if (!in_array($method, ['GET', 'POST', 'PUT', 'DELETE'])) {
    http_response_code(405);
    echo json_encode(["error" => "Method không được hỗ trợ"]);
}
