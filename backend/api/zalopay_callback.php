<?php

/**
 * ZaloPay Callback Handler
 * Nhận thông báo từ ZaloPay khi thanh toán thành công
 */

// Include config và database
require_once __DIR__ . '/../config/env.php';
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

    // Verify MAC để đảm bảo callback từ ZaloPay
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

        // Cập nhật order thành công
        $stmt = $pdo->prepare("
            UPDATE orders 
            SET payment_status = 'paid',
                zalo_trans_id = ?,
                paid_at = FROM_UNIXTIME(?)
            WHERE app_trans_id = ?
        ");

        if ($stmt->execute([$zp_trans_id, $server_time, $app_trans_id])) {
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
