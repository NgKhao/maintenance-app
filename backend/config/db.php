<?php
// Load environment variables
require_once __DIR__ . '/env.php';

header("Content-Type: application/json");

// Get CORS origins from environment
$allowedOrigins = explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:3000'));
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: " . env('CORS_DEFAULT_ORIGIN', 'http://localhost:3000'));
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// Database configuration from environment variables
$host = env('DB_HOST', 'localhost:3308');
$db   = env('DB_NAME', 'maintenance_app');
$user = env('DB_USER', 'root');
$pass = env('DB_PASS', '');
$charset = env('DB_CHARSET', 'utf8mb4');

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
    exit;
}
