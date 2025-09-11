import axios from 'axios';

const API_URL = 'http://localhost:8000/index.php?api=orders';

// Lấy danh sách đơn hàng
export const getOrders = async (userId = null) => {
  const url = userId ? `${API_URL}&user_id=${userId}` : API_URL;
  const res = await axios.get(url);
  return res.data;
};

// Lấy hợp đồng của user với thông tin chi tiết
export const getUserContracts = async (userId) => {
  const res = await axios.get(`${API_URL}&action=contracts&user_id=${userId}`);
  return res.data;
};

// Đăng ký dịch vụ (tạo đơn hàng mới)
export const registerService = async (orderData) => {
  const res = await axios.post(API_URL, orderData, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
};

// Cập nhật trạng thái thanh toán
export const updatePaymentStatus = async (orderId, paymentStatus) => {
  const res = await axios.put(
    API_URL,
    {
      id: orderId,
      payment_status: paymentStatus,
    },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return res.data;
};

// Xóa đơn hàng
export const deleteOrder = async (id) => {
  const res = await axios.delete(`${API_URL}&id=${id}`);
  return res.data;
};
