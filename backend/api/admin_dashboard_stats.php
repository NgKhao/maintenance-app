<?php

include __DIR__ . '/../config/cors.php';
setCorsHeaders();
include __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // 1. THỐNG KÊ DOANH THU
        // Đếm tổng doanh thu từ orders đã thanh toán (payment_status = 'paid')
        $revenue = $pdo->query("
            SELECT 
                COUNT(*) as total_orders,
                COALESCE(SUM(amount), 0) as total_revenue,
                COALESCE(SUM(CASE WHEN MONTH(paid_at) = MONTH(CURRENT_DATE()) 
                    THEN amount ELSE 0 END), 0) as month_revenue
            FROM orders 
            WHERE payment_status = 'paid'
        ")->fetch(PDO::FETCH_ASSOC);

        // 2. THỐNG KÊ HỢP ĐỒNG
        // Đếm hợp đồng theo trạng thái (active = đã thanh toán, pending = chờ thanh toán)
        $contracts = $pdo->query("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending
            FROM orders
        ")->fetch(PDO::FETCH_ASSOC);

        // 3. HIỆU SUẤT KỸ THUẬT VIÊN
        // Top 5 KTV có nhiều lịch hoàn thành nhất + rating trung bình
        $technicians = $pdo->query("
            SELECT 
                u.id,
                u.name,
                COUNT(ms.id) as total_schedules,
                SUM(CASE WHEN ms.status = 'completed' THEN 1 ELSE 0 END) as completed,
                COALESCE(AVG(r.rating), 0) as avg_rating
            FROM users u
            LEFT JOIN maintenanceschedules ms ON u.id = ms.user_id
            LEFT JOIN reviews r ON u.id = r.technician_id
            WHERE u.role = 'technician'
            GROUP BY u.id, u.name
            ORDER BY completed DESC
            LIMIT 5
        ")->fetchAll(PDO::FETCH_ASSOC);

        // Format response
        echo json_encode([
            'success' => true,
            'data' => [
                'revenue' => [
                    'total' => (float)$revenue['total_revenue'],
                    'this_month' => (float)$revenue['month_revenue'],
                    'orders_count' => (int)$revenue['total_orders']
                ],
                'contracts' => [
                    'total' => (int)$contracts['total'],
                    'active' => (int)$contracts['active'],
                    'pending' => (int)$contracts['pending']
                ],
                'technicians' => array_map(function ($t) {
                    return [
                        'id' => (int)$t['id'],
                        'name' => $t['name'],
                        'completed_schedules' => (int)$t['completed'],
                        'total_schedules' => (int)$t['total_schedules'],
                        'rating' => round((float)$t['avg_rating'], 1)
                    ];
                }, $technicians)
            ]
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}