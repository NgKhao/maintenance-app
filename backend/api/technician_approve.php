<?php
// Include CORS helper
include __DIR__ . '/../config/cors.php';
setCorsHeaders();

include __DIR__ . '/../config/db.php';

// Load composer autoload for PHPMailer
require_once __DIR__ . '/../vendor/autoload.php';

// Load EmailService
require_once __DIR__ . '/../config/EmailService.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $email = $_GET['email'] ?? '';
    $technician_id = $_GET['technician_id'] ?? '';

    $tech_id = null;

    if ($email) {
        // Lấy technician_id theo email từ users table
        $stmtTech = $pdo->prepare("SELECT id, name FROM users WHERE email=? AND role='technician'");
        $stmtTech->execute([$email]);
        $tech = $stmtTech->fetch();
        if (!$tech) {
            http_response_code(404);
            echo json_encode(["error" => "Kỹ thuật viên không tồn tại"]);
            exit();
        }
        $tech_id = $tech['id'];
    } elseif ($technician_id) {
        $tech_id = $technician_id;
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Email hoặc technician_id bắt buộc"]);
        exit();
    }

    // Lấy lịch của technician với thông tin đầy đủ
    $stmt = $pdo->prepare("
        SELECT ms.id, 
               ms.order_id,
               ms.device_id,
               ms.scheduled_date, 
               ms.note, 
               ms.status,
               u.name AS user_name, 
               u.email AS user_email,
               u.phone AS user_phone,
               d.name AS device_name, 
               d.serial_number,
               d.status AS device_status,
               p.name AS package_name
        FROM maintenanceschedules ms
        JOIN orders o ON ms.order_id = o.id
        JOIN users u ON o.user_id = u.id
        JOIN devices d ON ms.device_id = d.id
        JOIN maintenancepackages p ON o.package_id = p.id
        WHERE ms.user_id = ?
        ORDER BY ms.scheduled_date ASC
    ");
    $stmt->execute([$tech_id]);
    echo json_encode($stmt->fetchAll());
    exit();
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $schedule_id = $data['schedule_id'] ?? 0;
    $status = $data['status'] ?? '';
    $note = trim($data['note'] ?? '');

    if (!$schedule_id || !$status) {
        http_response_code(400);
        echo json_encode(["error" => "schedule_id và status bắt buộc"]);
        exit();
    }

    // Kiểm tra status hợp lệ với thông báo cụ thể
    $validStatuses = [
        'pending' => 'Chờ xử lý',
        'confirmed' => 'Đã xác nhận',
        'rejected' => 'Từ chối',
        'in_progress' => 'Đang thực hiện',
        'completed' => 'Hoàn thành'
    ];

    if (!array_key_exists($status, $validStatuses)) {
        http_response_code(400);
        echo json_encode([
            "error" => "Status không hợp lệ",
            "valid_statuses" => $validStatuses
        ]);
        exit();
    }

    // Cập nhật trạng thái và ghi log
    $stmt = $pdo->prepare("UPDATE maintenanceschedules SET status = ?, note = ? WHERE id = ?");
    if ($stmt->execute([$status, $note, $schedule_id])) {

        // Nếu status là 'confirmed', gửi email thông báo cho khách hàng
        if ($status === 'confirmed') {
            try {
                // Lấy thông tin chi tiết của lịch bảo trì để gửi email
                $stmtSchedule = $pdo->prepare("
                    SELECT ms.id, 
                           ms.scheduled_date,
                           u.name AS user_name, 
                           u.email AS user_email,
                           d.name AS device_name, 
                           d.serial_number,
                           p.name AS package_name,
                           tech.name AS technician_name
                    FROM maintenanceschedules ms
                    JOIN orders o ON ms.order_id = o.id
                    JOIN users u ON o.user_id = u.id
                    JOIN devices d ON ms.device_id = d.id
                    JOIN maintenancepackages p ON o.package_id = p.id
                    JOIN users tech ON ms.user_id = tech.id
                    WHERE ms.id = ?
                ");
                $stmtSchedule->execute([$schedule_id]);
                $scheduleInfo = $stmtSchedule->fetch();

                if ($scheduleInfo && $scheduleInfo['user_email']) {
                    // Khởi tạo EmailService và gửi email
                    $emailService = new EmailService();
                    $emailSent = $emailService->sendMaintenanceConfirmation($scheduleInfo);

                    if ($emailSent) {
                        error_log("Email confirmation sent to: " . $scheduleInfo['user_email']);
                    } else {
                        error_log("Failed to send email to: " . $scheduleInfo['user_email']);
                    }
                }
            } catch (Exception $e) {
                // Log lỗi nhưng không làm fail request
                error_log("Email sending error: " . $e->getMessage());
            }
        }

        echo json_encode([
            "success" => true,
            "message" => "Cập nhật trạng thái thành công: " . $validStatuses[$status]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Lỗi server, không thể cập nhật"]);
    }
    exit();
}

// Fallback for unsupported methods
http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
