import axios from 'axios';

const API_URL = 'http://localhost:8000/api/schedules.php';

// Lấy danh sách lịch bảo trì
export const getSchedules = async (userId = null, technicianId = null) => {
  let url = API_URL;

  if (technicianId) {
    url += `?technician_id=${technicianId}`;
  } else if (userId) {
    url += `?user_id=${userId}`;
  }

  const res = await axios.get(url);
  return res.data;
};

// Tạo lịch bảo trì mới
export const createSchedule = async (scheduleData) => {
  const res = await axios.post(API_URL, scheduleData, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
};

// Cập nhật trạng thái lịch bảo trì
export const updateScheduleStatus = async (scheduleId, status, note = '') => {
  const res = await axios.put(
    API_URL,
    {
      id: scheduleId,
      status: status,
      note: note,
    },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return res.data;
};

// Xóa lịch bảo trì
export const deleteSchedule = async (id) => {
  const res = await axios.delete(`${API_URL}?id=${id}`);
  return res.data;
};
