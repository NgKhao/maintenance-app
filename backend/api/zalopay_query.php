<?php
/**
 * ZaloPay Query Status API
 * Kiểm tra trạng thái thanh toán từ ZaloPay
 */

// Include CORS helper
include __DIR__ . '/../config/cors.php';
setCorsHeaders();

// Include config
require_once __DIR__ . '/../config/env.php';

/**
 * Query trạng thái giao dịch từ ZaloPay
 */
function queryZaloPayTransaction($app_trans_id) {
    $config = [
        "app_id" => env('ZALOPAY_APP_ID'),
        "key1" => env('ZALOPAY_KEY1'),
        "query_endpoint" => "https://sb-openapi.zalopay.vn/v2/query" // Sandbox endpoint
    ];

    // Nếu production, đổi endpoint
    if (!env('ZALOPAY_IS_SANDBOX', true)) {
        $config["query_endpoint"] = "https://openapi.zalopay.vn/v2/query";
    }

    // Tạo query data
    $data = $config["app_id"] . "|" . $app_trans_id . "|" . $config["key1"];
    $mac = hash_hmac("sha256", $data, $config["key1"]);

    $postData = [
        "app_id" => $config["app_id"],
        "app_trans_id" => $app_trans_id,
        "mac" => $mac
    ];

    // Gọi ZaloPay Query API
    $context = stream_context_create([
        "http" => [
            "header" => "Content-type: application/x-www-form-urlencoded\r\n",
            "method" => "POST",
            "content" => http_build_query($postData)
        ]
    ]);

    $response = file_get_contents($config["query_endpoint"], false, $context);
    $result = json_decode($response, true);

    // Log cho debug
    if (env('APP_DEBUG', false)) {
        error_log("ZaloPay Query Request: " . json_encode($postData));
        error_log("ZaloPay Query Response: " . $response);
    }

    return $result;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $app_trans_id = $data['app_trans_id'] ?? '';

    if (!$app_trans_id) {
        http_response_code(400);
        echo json_encode([
            "return_code" => 0,
            "return_message" => "Missing app_trans_id"
        ]);
        exit;
    }

    $result = queryZaloPayTransaction($app_trans_id);
    echo json_encode($result);
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Cho phép query qua GET với parameter
    $app_trans_id = $_GET['app_trans_id'] ?? '';

    if (!$app_trans_id) {
        http_response_code(400);
        echo json_encode([
            "return_code" => 0,
            "return_message" => "Missing app_trans_id parameter"
        ]);
        exit;
    }

    $result = queryZaloPayTransaction($app_trans_id);
    echo json_encode($result);
    
} else {
    http_response_code(405);
    echo json_encode([
        "return_code" => 0,
        "return_message" => "Method not allowed"
    ]);
}
?>