<?php
// Include CORS helper
include __DIR__ . '/../config/cors.php';
setCorsHeaders();

include __DIR__ . '/../config/db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM MaintenanceReminders");
    echo json_encode($stmt->fetchAll());
}

if ($method === 'POST') {
    $schedule_id = $_POST['schedule_id'] ?? 0;
    $reminder_date = $_POST['reminder_date'] ?? date('Y-m-d H:i:s');

    if (!$schedule_id) {
        http_response_code(400);
        echo json_encode(["error" => "Schedule_id bắt buộc"]);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO MaintenanceReminders (schedule_id,reminder_date) VALUES (?,?)");
    if ($stmt->execute([$schedule_id, $reminder_date])) {
        echo json_encode(["success" => true, "message" => "Thêm nhắc lịch thành công"]);
    }
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? 0;
    $stmt = $pdo->prepare("DELETE FROM MaintenanceReminders WHERE id=?");
    if ($stmt->execute([$id])) {
        echo json_encode(["success" => true, "message" => "Xóa nhắc lịch thành công"]);
    }
}
