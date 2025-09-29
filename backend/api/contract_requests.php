<?php

/**
 * Contract Requests API
 * Xử lý yêu cầu gia hạn/kết thúc hợp đồng từ khách hàng
 * 
 * Usage: /index.php?api=contract_requests&action=create|process|list
 */

// Include CORS helper
include __DIR__ . '/../config/cors.php';
setCorsHeaders();

include __DIR__ . '/../config/db.php';
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    if ($action === 'list') {
        // Lấy danh sách yêu cầu: /index.php?api=contract_requests&action=list&user_id=6&status=pending&admin_view=true
        $user_id = $_GET['user_id'] ?? null;
        $status = $_GET['status'] ?? null;
        $admin_view = $_GET['admin_view'] ?? false;

        try {
            $sql = "
                SELECT cr.*, 
                       o.user_id, o.package_id, o.start_date, o.end_date, o.amount,
                       u.name as user_name, u.email as user_email,
                       p.name as package_name, p.price as package_price,
                       admin.name as admin_name
                FROM contract_requests cr
                LEFT JOIN orders o ON cr.order_id = o.id
                LEFT JOIN users u ON o.user_id = u.id
                LEFT JOIN maintenancepackages p ON o.package_id = p.id
                LEFT JOIN users admin ON cr.admin_id = admin.id
                WHERE 1=1
            ";

            $params = [];

            if (!$admin_view && $user_id) {
                $sql .= " AND o.user_id = ?";
                $params[] = $user_id;
            }

            if ($status) {
                $sql .= " AND cr.status = ?";
                $params[] = $status;
            }

            $sql .= " ORDER BY cr.request_date DESC";

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $requests = $stmt->fetchAll();

            echo json_encode($requests);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Lỗi server: " . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Action không hợp lệ. Sử dụng action=list"]);
    }
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $action = $data['action'] ?? 'create';

    if ($action === 'create') {
        // Khách hàng tạo yêu cầu mới
        $order_id = $data['order_id'] ?? 0;
        $request_type = $data['request_type'] ?? ''; // 'extend' hoặc 'terminate'
        $note = $data['note'] ?? '';

        // Thông tin gia hạn
        $extend_package_id = $data['extend_package_id'] ?? null;
        $extend_months = $data['extend_months'] ?? null;

        // Thông tin kết thúc
        $requested_end_date = $data['requested_end_date'] ?? null;

        if (!$order_id || !$request_type) {
            http_response_code(400);
            echo json_encode(["error" => "Order ID và loại yêu cầu bắt buộc"]);
            exit;
        }

        if (!in_array($request_type, ['extend', 'terminate'])) {
            http_response_code(400);
            echo json_encode(["error" => "Loại yêu cầu không hợp lệ"]);
            exit;
        }

        // Kiểm tra order tồn tại và đã thanh toán
        $stmt = $pdo->prepare("SELECT * FROM orders WHERE id = ? AND payment_status = 'paid'");
        $stmt->execute([$order_id]);
        $order = $stmt->fetch();

        if (!$order) {
            http_response_code(400);
            echo json_encode(["error" => "Hợp đồng không tồn tại hoặc chưa thanh toán"]);
            exit;
        }

        // Kiểm tra đã có yêu cầu pending chưa
        $stmt = $pdo->prepare("
            SELECT COUNT(*) FROM contract_requests 
            WHERE order_id = ? AND status = 'pending'
        ");
        $stmt->execute([$order_id]);
        $pending_count = $stmt->fetchColumn();

        if ($pending_count > 0) {
            http_response_code(400);
            echo json_encode(["error" => "Đã có yêu cầu đang chờ xử lý cho hợp đồng này"]);
            exit;
        }

        try {
            // Tạo yêu cầu mới
            $stmt = $pdo->prepare("
                INSERT INTO contract_requests (
                    order_id, request_type, note, 
                    extend_package_id, extend_months, requested_end_date
                ) VALUES (?,?,?,?,?,?)
            ");

            if ($stmt->execute([$order_id, $request_type, $note, $extend_package_id, $extend_months, $requested_end_date])) {
                $request_id = $pdo->lastInsertId();

                echo json_encode([
                    "success" => true,
                    "message" => "Yêu cầu đã được gửi thành công",
                    "request_id" => $request_id
                ]);
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Không thể tạo yêu cầu"]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Lỗi server: " . $e->getMessage()]);
        }
    } elseif ($action === 'process') {
        // Admin xử lý yêu cầu
        $request_id = $data['request_id'] ?? 0;
        $status = $data['status'] ?? ''; // 'approved' hoặc 'rejected'
        $admin_id = $data['admin_id'] ?? 0;
        $admin_note = $data['admin_note'] ?? '';

        if (!$request_id || !$status || !$admin_id) {
            http_response_code(400);
            echo json_encode(["error" => "Thiếu thông tin bắt buộc"]);
            exit;
        }

        if (!in_array($status, ['approved', 'rejected'])) {
            http_response_code(400);
            echo json_encode(["error" => "Trạng thái không hợp lệ"]);
            exit;
        }

        try {
            // Lấy thông tin yêu cầu
            $stmt = $pdo->prepare("
                SELECT cr.*, o.end_date as current_end_date
                FROM contract_requests cr
                LEFT JOIN orders o ON cr.order_id = o.id
                WHERE cr.id = ? AND cr.status = 'pending'
            ");
            $stmt->execute([$request_id]);
            $request = $stmt->fetch();

            if (!$request) {
                http_response_code(400);
                echo json_encode(["error" => "Yêu cầu không tồn tại hoặc đã được xử lý"]);
                exit;
            }

            $pdo->beginTransaction();

            // Cập nhật trạng thái yêu cầu
            $stmt = $pdo->prepare("
                UPDATE contract_requests 
                SET status = ?, admin_id = ?, admin_note = ?, processed_date = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$status, $admin_id, $admin_note, $request_id]);

            if ($status === 'approved') {
                if ($request['request_type'] === 'extend') {
                    // Gia hạn hợp đồng
                    $extend_months = $request['extend_months'] ?: 12; // Default 12 tháng
                    $new_end_date = date('Y-m-d', strtotime($request['current_end_date'] . ' + ' . $extend_months . ' months'));

                    // Cập nhật ngày kết thúc
                    $stmt = $pdo->prepare("UPDATE orders SET end_date = ? WHERE id = ?");
                    $stmt->execute([$new_end_date, $request['order_id']]);

                    // Lưu thông tin backup
                    $stmt = $pdo->prepare("
                        UPDATE contract_requests 
                        SET old_end_date = ?, new_end_date = ?
                        WHERE id = ?
                    ");
                    $stmt->execute([$request['current_end_date'], $new_end_date, $request_id]);
                } elseif ($request['request_type'] === 'terminate') {
                    // Kết thúc hợp đồng
                    $end_date = $request['requested_end_date'] ?: date('Y-m-d');

                    $stmt = $pdo->prepare("UPDATE orders SET end_date = ? WHERE id = ?");
                    $stmt->execute([$end_date, $request['order_id']]);

                    // Lưu thông tin backup
                    $stmt = $pdo->prepare("
                        UPDATE contract_requests 
                        SET old_end_date = ?, new_end_date = ?
                        WHERE id = ?
                    ");
                    $stmt->execute([$request['current_end_date'], $end_date, $request_id]);
                }
            }

            $pdo->commit();

            echo json_encode([
                "success" => true,
                "message" => $status === 'approved' ? "Yêu cầu đã được duyệt" : "Yêu cầu đã bị từ chối"
            ]);
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(["error" => "Lỗi xử lý: " . $e->getMessage()]);
        }
    }
}

if ($method === 'PUT') {
    // Cập nhật yêu cầu (khách hàng có thể chỉnh sửa trước khi admin xử lý)
    $data = json_decode(file_get_contents("php://input"), true);
    $request_id = $data['id'] ?? 0;

    if (!$request_id) {
        http_response_code(400);
        echo json_encode(["error" => "ID yêu cầu bắt buộc"]);
        exit;
    }

    // Chỉ cho phép cập nhật khi status = pending
    $stmt = $pdo->prepare("SELECT * FROM contract_requests WHERE id = ? AND status = 'pending'");
    $stmt->execute([$request_id]);
    $request = $stmt->fetch();

    if (!$request) {
        http_response_code(400);
        echo json_encode(["error" => "Yêu cầu không tồn tại hoặc đã được xử lý"]);
        exit;
    }

    try {
        $fields = [];
        $params = [];

        if (isset($data['note'])) {
            $fields[] = "note = ?";
            $params[] = $data['note'];
        }

        if (isset($data['extend_months'])) {
            $fields[] = "extend_months = ?";
            $params[] = $data['extend_months'];
        }

        if (isset($data['requested_end_date'])) {
            $fields[] = "requested_end_date = ?";
            $params[] = $data['requested_end_date'];
        }

        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(["error" => "Không có thông tin cần cập nhật"]);
            exit;
        }

        $params[] = $request_id;
        $sql = "UPDATE contract_requests SET " . implode(', ', $fields) . " WHERE id = ?";

        $stmt = $pdo->prepare($sql);

        if ($stmt->execute($params)) {
            echo json_encode([
                "success" => true,
                "message" => "Cập nhật yêu cầu thành công"
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Không thể cập nhật yêu cầu"]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Lỗi server: " . $e->getMessage()]);
    }
}

if ($method === 'DELETE') {
    // Hủy yêu cầu (chỉ khi status = pending)
    $request_id = $_GET['id'] ?? 0;

    if (!$request_id) {
        http_response_code(400);
        echo json_encode(["error" => "ID yêu cầu bắt buộc"]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM contract_requests WHERE id = ? AND status = 'pending'");

        if ($stmt->execute([$request_id])) {
            if ($stmt->rowCount() > 0) {
                echo json_encode([
                    "success" => true,
                    "message" => "Hủy yêu cầu thành công"
                ]);
            } else {
                http_response_code(400);
                echo json_encode(["error" => "Yêu cầu không tồn tại hoặc đã được xử lý"]);
            }
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Không thể hủy yêu cầu"]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Lỗi server: " . $e->getMessage()]);
    }
}
