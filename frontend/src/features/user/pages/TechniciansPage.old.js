import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState([]);
  const [selectedTech, setSelectedTech] = useState(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [note, setNote] = useState('');

  const userId = localStorage.getItem('userId'); // ID user hiện tại
  const deviceId = localStorage.getItem('deviceId'); // device user muốn bảo trì
  const API_URL = 'http://localhost:8000/index.php?api=technicians';

  useEffect(() => {
    const fetchTechs = async () => {
      try {
        const res = await axios.get(API_URL);
        setTechnicians(res.data);
      } catch (err) {
        alert('Lỗi tải danh sách technician');
      }
    };
    fetchTechs();
  }, []);

  const handleBooking = async () => {
    if (!selectedTech || !scheduledDate) {
      alert('Vui lòng chọn technician và ngày giờ');
      return;
    }
    const form = new FormData();
    form.append('user_id', userId);
    form.append('technician_id', selectedTech);
    form.append('device_id', deviceId);
    form.append('scheduled_date', scheduledDate);
    form.append('note', note);

    try {
      const res = await axios.post(API_URL, form);
      alert(res.data.message);
      setSelectedTech(null);
      setScheduledDate('');
      setNote('');
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi đặt lịch');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Danh sách Technicians</h2>
      <table className="min-w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <thead className="bg-indigo-50">
          <tr>
            <th className="px-6 py-3 text-left">ID</th>
            <th className="px-6 py-3 text-left">Tên</th>
            <th className="px-6 py-3 text-left">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {technicians.map(t => (
            <tr key={t.id} className="hover:bg-gray-100">
              <td className="px-6 py-4">{t.id}</td>
              <td className="px-6 py-4">{t.name}</td>
              <td className="px-6 py-4">{t.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 p-6 bg-white rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Đặt lịch bảo trì</h3>
        <div className="space-y-4">
          <select
            value={selectedTech || ''}
            onChange={e => setSelectedTech(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Chọn Technician</option>
            {technicians.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <input
            type="datetime-local"
            value={scheduledDate}
            onChange={e => setScheduledDate(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="text"
            placeholder="Ghi chú"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={handleBooking}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold"
          >
            Đặt lịch
          </button>
        </div>
      </div>
    </div>
  );
}
