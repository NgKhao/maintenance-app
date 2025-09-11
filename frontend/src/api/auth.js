import axios from 'axios';

const API_URL = 'http://localhost:8000/index.php?api=auth';

// Login user
export const loginUser = async (email, password) => {
  try {
    const payload = { email, password };

    const res = await axios.post(`${API_URL}&action=login`, payload, {
      headers: { 'Content-Type': 'application/json' } // gửi JSON
    });

    // Lưu role vào localStorage nếu login thành công
    if (res.data.success && res.data.user?.role) {
      localStorage.setItem('role', res.data.user.role);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }

    return res.data;
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
};

// Register user
export const registerUser = async (name, email, password) => {
  try {
    const payload = { name, email, password };

    const res = await axios.post(`${API_URL}&action=register`, payload, {
      headers: { 'Content-Type': 'application/json' } // gửi JSON
    });

    return res.data;
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
};

// Logout (xóa dữ liệu localStorage)
export const logoutUser = () => {
  localStorage.removeItem('role');
  localStorage.removeItem('user');
};
