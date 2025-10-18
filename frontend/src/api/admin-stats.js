// Admin Statistics API
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/admin_dashboard_stats.php';

/**
 * Lấy thống kê tổng quan cho admin dashboard
 * Bao gồm: Doanh thu, Hợp đồng, Hiệu suất kỹ thuật viên
 */
export const getAdminStats = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};
