import axios from 'axios';

const API_URL = 'http://localhost:8000/api/technicians.php';

// Lấy danh sách kỹ thuật viên
export const getTechnicians = async () => {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (error) {
    console.error('Error fetching technicians:', error);
    throw new Error('Không thể tải danh sách kỹ thuật viên');
  }
};
