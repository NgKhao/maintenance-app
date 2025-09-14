<?php
include __DIR__ . '/config/db.php';

try {
    $stmt = $pdo->query("SELECT COUNT(*) as user_count FROM users");
    $result = $stmt->fetch();
    echo json_encode([
        "status" => "Database connected successfully",
        "user_count" => $result['user_count']
    ]);
} catch (Exception $e) {
    echo json_encode([
        "status" => "Database connection failed",
        "error" => $e->getMessage()
    ]);
}
