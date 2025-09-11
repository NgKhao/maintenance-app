<?php
include './config/db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $email = $_GET['email'] ?? '';
    if (!$email) {
        http_response_code(400);
        echo json_encode(["error" => "Email bắt buộc"]);
        exit;
    }

    // Lấy technician_id theo email
    $stmtTech = $pdo->prepare("SELECT id, name FROM Technicians WHERE email=?");
    $stmtTech->execute([$email]);
    $tech = $stmtTech->fetch();
    if (!$tech) {
        http_response_code(404);
        echo json_encode(["error"=>"Technician không tồn tại"]);
        exit;
    }

    $tech_id = $tech['id'];

    // Lấy lịch của technician
    $stmt = $pdo->prepare("
        SELECT ms.id, u.name AS user_name, d.name AS device_name, ms.scheduled_date, ms.note, ms.status
        FROM MaintenanceSchedules ms
        JOIN Orders o ON ms.order_id = o.id
        JOIN Users u ON o.user_id = u.id
        JOIN Devices d ON ms.device_id = d.id
        WHERE ms.technician_id=?
    ");
    $stmt->execute([$tech_id]);
    echo json_encode($stmt->fetchAll());
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $schedule_id = $data['schedule_id'] ?? 0;
    $status = $data['status'] ?? '';

    if (!$schedule_id || !in_array($status, ['completed','busy'])) {
        http_response_code(400);
        echo json_encode(["error"=>"schedule_id và status hợp lệ bắt buộc"]);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE MaintenanceSchedules SET status=? WHERE id=?");
    if ($stmt->execute([$status, $schedule_id])) {
        echo json_encode(["success"=>true, "message"=>"Cập nhật trạng thái thành công"]);
    }
}
?>