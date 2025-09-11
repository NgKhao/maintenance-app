<?php
include './config/db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM ContractEndRequests");
    echo json_encode($stmt->fetchAll());
}

if ($method === 'POST') {
    $order_id = $_POST['order_id'] ?? 0;
    $note = $_POST['note'] ?? '';
    $status = $_POST['status'] ?? 'pending';

    if (!$order_id) {
        http_response_code(400);
        echo json_encode(["error"=>"Order_id bắt buộc"]);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO ContractEndRequests (order_id,note,status) VALUES (?,?,?)");
    if ($stmt->execute([$order_id,$note,$status])) {
        echo json_encode(["success"=>true, "message"=>"Gửi yêu cầu kết thúc hợp đồng thành công"]);
    }
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? 0;
    $stmt = $pdo->prepare("DELETE FROM ContractEndRequests WHERE id=?");
    if ($stmt->execute([$id])) {
        echo json_encode(["success"=>true, "message"=>"Xóa yêu cầu kết thúc hợp đồng thành công"]);
    }
}
?>