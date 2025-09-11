import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function TechnicianSchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const email = localStorage.getItem('email'); // email technician
  const API_URL = 'http://localhost:8000/index.php?api=technician_approve';

  const fetchSchedules = async () => {
    if (!email) return;
    try {
      const res = await axios.get(`${API_URL}?email=${email}`);
      setSchedules(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi tải lịch bảo trì');
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.post(API_URL, {
        schedule_id: id,
        status: status
      });
      fetchSchedules();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi cập nhật trạng thái');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Danh sách lịch chờ duyệt</h2>
      <table className="min-w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <thead className="bg-indigo-50">
          <tr>
            <th className="px-6 py-3 text-left">ID</th>
            <th className="px-6 py-3 text-left">User</th>
            <th className="px-6 py-3 text-left">Device</th>
            <th className="px-6 py-3 text-left">Ngày</th>
            <th className="px-6 py-3 text-left">Ghi chú</th>
            <th className="px-6 py-3 text-left">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map(s => (
            <tr key={s.id} className="hover:bg-gray-100">
              <td className="px-6 py-4">{s.id}</td>
              <td className="px-6 py-4">{s.user_name}</td>
              <td className="px-6 py-4">{s.device_name}</td>
              <td className="px-6 py-4">{s.scheduled_date}</td>
              <td className="px-6 py-4">{s.note}</td>
              <td className="px-6 py-4 space-x-2">
                <button
                  onClick={() => handleUpdateStatus(s.id, 'completed')}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                >
                  Hoàn thành
                </button>
                <button
                  onClick={() => handleUpdateStatus(s.id, 'busy')}
                  className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
                >
                  Bận
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
