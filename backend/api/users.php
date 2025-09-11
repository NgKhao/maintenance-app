<?php
include './config/db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT id,name,email,role,created_at FROM Users");
    echo json_encode($stmt->fetchAll());
}

if ($method === 'POST') {
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $role = $_POST['role'] ?? 'user';

    if (!$name || !$email || !$password) {
        http_response_code(400);
        echo json_encode(["error"=>"Vui lòng nhập đầy đủ thông tin"]);
        exit;
    }

    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO Users (name,email,password,role) VALUES (?,?,?,?)");
    if ($stmt->execute([$name,$email,$hashed,$role])) {
        echo json_encode(["success"=>true, "message"=>"Thêm user thành công"]);
    }
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? 0;
    $stmt = $pdo->prepare("DELETE FROM Users WHERE id=?");
    if ($stmt->execute([$id])) {
        echo json_encode(["success"=>true, "message"=>"Xóa user thành công"]);
    }
}
?>