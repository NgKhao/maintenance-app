<?php
// Load environment variables
require_once __DIR__ . '/env.php';

// CORS Configuration Helper
function setCorsHeaders()
{
    // Get allowed origins from environment
    $allowedOriginsString = env('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:3001');
    $allowedOrigins = explode(',', $allowedOriginsString);
    $defaultOrigin = env('CORS_DEFAULT_ORIGIN', 'http://localhost:3001');

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($origin, $allowedOrigins)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        header("Access-Control-Allow-Origin: $defaultOrigin");
    }

    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Credentials: true");
    header("Content-Type: application/json; charset=UTF-8");

    // Handle preflight OPTIONS request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}
