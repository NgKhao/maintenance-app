<?php

/**
 * ZaloPay Callback Handler
 * Nhận thông báo từ ZaloPay khi thanh toán thành công
 */

// Include config và database
require_once __DIR__ . '/../config/env.php';
include __DIR__ . '/../config/cors.php';
setCorsHeaders();
include __DIR__ . '/../config/db.php';

// Log request để debug
$requestBody = file_get_contents('php://input');
if (env('APP_DEBUG', false)) {
    error_log("ZaloPay Callback received: " . $requestBody);
}

// ZaloPay sẽ gửi POST request với data
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = $_POST['data'] ?? '';
    $mac = $_POST['mac'] ?? '';
    $type = $_POST['type'] ?? 0;

    if (!$data || !$mac) {
        http_response_code(400);
        echo json_encode([
            "return_code" => -1,
            "return_message" => "Invalid callback data"
        ]);
        exit;
    }

    // Verify MAC để đảm bảo callback từ ZaloPay (cho phép manual update từ frontend)
    if ($mac !== 'manual_update') {
        $key2 = env('ZALOPAY_KEY2');
        $calculatedMac = hash_hmac("sha256", $data, $key2);

        if ($calculatedMac !== $mac) {
            http_response_code(400);
            echo json_encode([
                "return_code" => -1,
                "return_message" => "Invalid MAC signature"
            ]);
            exit;
        }
    }

    // Parse callback data
    $callbackData = json_decode($data, true);

    if (!$callbackData) {
        http_response_code(400);
        echo json_encode([
            "return_code" => -1,
            "return_message" => "Invalid JSON data"
        ]);
        exit;
    }

    // Lấy thông tin từ callback
    $app_trans_id = $callbackData['app_trans_id'] ?? '';
    $zp_trans_id = $callbackData['zp_trans_id'] ?? '';
    $amount = $callbackData['amount'] ?? 0;
    $server_time = $callbackData['server_time'] ?? time();

    if (!$app_trans_id) {
        echo json_encode([
            "return_code" => -1,
            "return_message" => "Missing app_trans_id"
        ]);
        exit;
    }

    try {
        // Tìm order theo app_trans_id
        $stmt = $pdo->prepare("SELECT * FROM orders WHERE app_trans_id = ? AND payment_status = 'pending'");
        $stmt->execute([$app_trans_id]);
        $order = $stmt->fetch();

        if (!$order) {
            // Order không tồn tại hoặc đã được xử lý
            echo json_encode([
                "return_code" => 1,
                "return_message" => "Order not found or already processed"
            ]);
            exit;
        }

        // Verify amount (optional nhưng nên có)
        if ($amount != $order['amount']) {
            error_log("Amount mismatch: Expected {$order['amount']}, Got {$amount}");
        }

        // Cập nhật order thành công với đầy đủ thông tin ZaloPay
        $stmt = $pdo->prepare("
            UPDATE orders 
            SET payment_status = 'paid',
                zalo_trans_id = ?,
                paid_at = NOW()
            WHERE app_trans_id = ?
        ");

        if ($stmt->execute([$zp_trans_id, $app_trans_id])) {
            // **NẾU LÀ EXTENSION ORDER → CẬP NHẬT CONTRACT_REQUEST**
            if ($order['is_extension'] == 1 && $order['parent_order_id']) {
                // Cập nhật status từ 'pending_payment' → 'pending' (chờ admin duyệt)
                $stmt = $pdo->prepare("
                    UPDATE contract_requests 
                    SET status = 'pending',
                        request_date = NOW()
                    WHERE extension_order_id = ? AND status = 'pending_payment'
                ");
                $result = $stmt->execute([$order['id']]);

                // Log cho debug
                if (env('APP_DEBUG', false)) {
                    error_log("Updated contract_request for extension_order_id: {$order['id']}, affected rows: " . $stmt->rowCount());
                }

                // Nếu không có request nào được cập nhật (có thể đã bị xóa), tạo mới
                if ($stmt->rowCount() == 0) {
                    $stmt = $pdo->prepare("
                        INSERT INTO contract_requests (
                            order_id, request_type, note, 
                            extend_months, old_end_date, extension_order_id,
                            status, request_date
                        ) 
                        SELECT 
                            parent_order_id, 
                            'extend', 
                            CONCAT('Thanh toán gia hạn ', extension_months, ' tháng'),
                            extension_months,
                            (SELECT end_date FROM orders WHERE id = parent_order_id),
                            ?,
                            'pending',
                            NOW()
                        FROM orders WHERE id = ?
                    ");
                    $stmt->execute([$order['id'], $order['id']]);

                    if (env('APP_DEBUG', false)) {
                        error_log("Created new contract_request for extension_order_id: {$order['id']}");
                    }
                }
            }

            // Log thành công
            if (env('APP_DEBUG', false)) {
                error_log("Payment successful for order ID: {$order['id']}, app_trans_id: {$app_trans_id}");
            }

            // Trả về success cho ZaloPay
            echo json_encode([
                "return_code" => 1,
                "return_message" => "Payment processed successfully"
            ]);
        } else {
            // Lỗi database
            error_log("Failed to update order payment status: " . json_encode($stmt->errorInfo()));
            echo json_encode([
                "return_code" => 0,
                "return_message" => "Database update failed"
            ]);
        }
    } catch (Exception $e) {
        error_log("ZaloPay Callback Error: " . $e->getMessage());
        echo json_encode([
            "return_code" => 0,
            "return_message" => "Internal server error"
        ]);
    }
} else {
    // Method không được hỗ trợ
    http_response_code(405);
    echo json_encode([
        "return_code" => -1,
        "return_message" => "Method not allowed"
    ]);
}
