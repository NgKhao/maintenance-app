<?php
// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include './config/db.php';
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST') {
    // Đọc JSON từ frontend
    $data = json_decode(file_get_contents("php://input"), true);

    $name = trim($data['name'] ?? '');
    $email = trim($data['email'] ?? '');
    $password = trim($data['password'] ?? '');

    if ($action === 'register') {
        if (!$name || !$email || !$password) {
            http_response_code(400);
            echo json_encode(["error" => "Vui lòng nhập đầy đủ thông tin"]);
            exit;
        }

        // Kiểm tra email tồn tại
        $stmt = $pdo->prepare("SELECT id FROM Users WHERE email=?");
        $stmt->execute([$email]);
        if ($stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(["error" => "Email đã tồn tại"]);
            exit;
        }

        // Hash password
        $hashed = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $pdo->prepare("INSERT INTO Users (name,email,password,role) VALUES (?,?,?,?)");
        $role = 'user'; // mặc định là user
        if ($stmt->execute([$name, $email, $hashed, $role])) {
            echo json_encode(["success" => true, "message" => "Đăng ký thành công"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Lỗi server, không thể đăng ký"]);
        }

    } elseif ($action === 'login') {
        if (!$email || !$password) {
            http_response_code(400);
            echo json_encode(["error" => "Vui lòng nhập email và password"]);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM Users WHERE email=?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            // Trả về thông tin user + role
            echo json_encode([
                "success" => true,
                "user" => [
                    "id" => $user['id'],
                    "name" => $user['name'],
                    "email" => $user['email'],
                    "role" => $user['role']
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["error" => "Email hoặc mật khẩu không đúng"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Action không hợp lệ"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method không được hỗ trợ"]);
}
?>