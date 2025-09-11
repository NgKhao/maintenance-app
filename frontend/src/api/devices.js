import axios from 'axios';

const API_URL = 'http://localhost:8000/index.php?api=devices';

// Lấy danh sách thiết bị (có thể lọc theo user_id)
export const getDevices = async (userId = null) => {
  const url = userId ? `${API_URL}&user_id=${userId}` : API_URL;
  const res = await axios.get(url);
  return res.data;
};

// Thêm thiết bị
export const addDevice = async (device) => {
  const res = await axios.post(API_URL, device, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
};

// ✅ Cập nhật thiết bị (PUT)
export const updateDevice = async (device) => {
  const res = await axios.put(API_URL, device, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
};

// Xóa thiết bị
export const deleteDevice = async (id) => {
  const res = await axios.delete(`${API_URL}&id=${id}`);
  return res.data;
};
