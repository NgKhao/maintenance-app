import axios from 'axios';

const API_URL = 'http://localhost:8000/api/reviews.php';

// Tạo đánh giá mới cho kỹ thuật viên
export const createReview = async (reviewData) => {
  const res = await axios.post(API_URL, reviewData, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
};

// Lấy danh sách đánh giá của kỹ thuật viên
export const getReviews = async (technicianId) => {
  const res = await axios.get(`${API_URL}?technician_id=${technicianId}`);
  return res.data;
};

// Lấy thống kê đánh giá của tất cả kỹ thuật viên (cho admin)
export const getTechnicianStats = async () => {
  const res = await axios.get('http://localhost:8000/api/technician_stats.php');
  return res.data;
};
