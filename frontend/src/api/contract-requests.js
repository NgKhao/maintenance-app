import axios from 'axios';
import { getPackages } from './packages';

const API_URL = 'http://localhost:8000/index.php?api=contract_requests';

// Lấy danh sách yêu cầu contract
export const getContractRequests = async (params = {}) => {
  const { user_id, status, admin_view = false } = params;

  let url = `${API_URL}&action=list`;

  if (user_id) url += `&user_id=${user_id}`;
  if (status) url += `&status=${status}`;
  if (admin_view) url += `&admin_view=true`;

  const res = await axios.get(url);
  return res.data;
};

// Tạo yêu cầu gia hạn/kết thúc hợp đồng (Customer)
export const createContractRequest = async (requestData) => {
  const res = await axios.post(
    API_URL,
    {
      action: 'create',
      ...requestData,
    },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return res.data;
};

// Admin xử lý yêu cầu (approve/reject)
export const processContractRequest = async (processData) => {
  const res = await axios.post(
    API_URL,
    {
      action: 'process',
      ...processData,
    },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return res.data;
};

// Cập nhật yêu cầu (Customer - chỉ khi pending)
export const updateContractRequest = async (requestId, updateData) => {
  const res = await axios.put(
    API_URL,
    {
      id: requestId,
      ...updateData,
    },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return res.data;
};

// Hủy yêu cầu (Customer - chỉ khi pending)
export const deleteContractRequest = async (requestId) => {
  const res = await axios.delete(`${API_URL}&id=${requestId}`);
  return res.data;
};

// Admin tạo hợp đồng trực tiếp
export const createContractByAdmin = async (contractData) => {
  const res = await axios.post(
    'http://localhost:8000/index.php?api=orders',
    {
      action: 'admin_create',
      ...contractData,
    },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return res.data;
};

// Re-export getPackages để tương thích với code hiện tại
export { getPackages };

// Lấy danh sách users để hiển thị trong form admin
export const getUsers = async () => {
  const res = await axios.get('http://localhost:8000/api/users.php');
  return res.data;
};
