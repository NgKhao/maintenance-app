<?php

/**
 * ZaloPay Create Order API
 * Tạo đơn hàng thanh toán ZaloPay
 */

// Include environment configuration
require_once __DIR__ . '/../config/env.php';

/**
 * Tạo đơn hàng ZaloPay
 */
function createZaloPayOrder($order_id, $amount, $description, $app_trans_id)
{
    // Lấy config từ environment
    $config = [
        "app_id" => env('ZALOPAY_APP_ID'),
        "key1" => env('ZALOPAY_KEY1'),
        "key2" => env('ZALOPAY_KEY2'),
        "endpoint" => env('ZALOPAY_ENDPOINT'),
        "callback_url" => env('ZALOPAY_CALLBACK_URL'),
        "return_url" => env('ZALOPAY_RETURN_URL')
    ];

    // Kiểm tra config
    if (!$config["app_id"] || !$config["key1"] || !$config["endpoint"]) {
        return [
            "return_code" => 0,
            "return_message" => "ZaloPay configuration missing"
        ];
    }

    // Embed data chứa thông tin đơn hàng
    $embeddata = json_encode([
        'order_id' => $order_id,
        'redirecturl' => $config["return_url"]
    ]);

    // Items (có thể để trống cho dịch vụ)
    $items = json_encode([]);

    // Tạo order data
    $order = [
        "app_id" => $config["app_id"],
        "app_user" => "user_" . $order_id,
        "app_time" => round(microtime(true) * 1000), // milliseconds
        "amount" => (int)$amount,
        "app_trans_id" => $app_trans_id,
        "embed_data" => $embeddata,
        "item" => $items,
        "description" => $description,
        "bank_code" => "",
        "callback_url" => $config["callback_url"],
        "return_url" => $config["return_url"]
    ];

    // Tạo MAC theo format ZaloPay
    $data = $order["app_id"] . "|" . $order["app_trans_id"] . "|" . $order["app_user"] . "|" . $order["amount"]
        . "|" . $order["app_time"] . "|" . $order["embed_data"] . "|" . $order["item"];
    $order["mac"] = hash_hmac("sha256", $data, $config["key1"]);

    // Gọi ZaloPay API
    $context = stream_context_create([
        "http" => [
            "header" => "Content-type: application/x-www-form-urlencoded\r\n",
            "method" => "POST",
            "content" => http_build_query($order)
        ]
    ]);

    $resp = file_get_contents($config["endpoint"], false, $context);
    $result = json_decode($resp, true);

    // Log request và response cho debug (nếu cần)
    if (env('APP_DEBUG', false)) {
        error_log("ZaloPay Request: " . json_encode($order));
        error_log("ZaloPay Response: " . $resp);
    }

    return $result;
}

// Nếu file được gọi trực tiếp qua HTTP (chỉ khi không được include từ file khác)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($GLOBALS['zalopay_included'])) {
    // Include CORS helper
    include __DIR__ . '/../config/cors.php';
    setCorsHeaders();

    $data = json_decode(file_get_contents("php://input"), true);

    $order_id = $data['order_id'] ?? 0;
    $amount = $data['amount'] ?? 0;
    $description = $data['description'] ?? 'Thanh toán dịch vụ bảo trì';
    $app_trans_id = $data['app_trans_id'] ?? '';

    if (!$order_id || !$amount || !$app_trans_id) {
        http_response_code(400);
        echo json_encode([
            "return_code" => 0,
            "return_message" => "Missing required parameters: order_id, amount, app_trans_id"
        ]);
        exit;
    }

    $result = createZaloPayOrder($order_id, $amount, $description, $app_trans_id);
    echo json_encode($result);
}
