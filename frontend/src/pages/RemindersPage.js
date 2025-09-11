import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function RemindersPage() {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'schedule_id', label: 'Lịch ID' },
    { key: 'reminder_date', label: 'Ngày nhắc' }
  ];

  const formFields = [
    { key: 'schedule_id', label: 'Lịch ID' },
    { key: 'reminder_date', label: 'Ngày nhắc' }
  ];

  const [data, setData] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({});
  const role = localStorage.getItem('role');
  const canAdd = role === 'user'; // chỉ user mới được thêm
  const canDelete = role === 'admin'; // admin có quyền xóa nếu muốn

  const API_URL = 'http://localhost:8000/index.php?api=reminders';

  const fetchData = async () => {
    try {
      const res = await axios.get(API_URL);
      setData(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi tải dữ liệu');
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append('schedule_id', formData.schedule_id || '');
      form.append('reminder_date', formData.reminder_date || '');

      await axios.post(API_URL, form);
      setFormData({});
      setFormVisible(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi thêm nhắc lịch');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa nhắc lịch này?')) return;
    try {
      await axios.delete(`${API_URL}?id=${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi xóa nhắc lịch');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Danh sách Nhắc lịch</h2>
        {canAdd && (
          <button
            onClick={() => setFormVisible(!formVisible)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all 
              ${formVisible ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
          >
            {formVisible ? 'Hủy' : 'Thêm nhắc lịch'}
          </button>
        )}
      </div>

      {formVisible && canAdd && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-6 bg-white rounded-xl shadow-lg border space-y-4 transition-all"
        >
          {formFields.map(field => (
            <div key={field.key}>
              <label className="block mb-1 font-medium text-gray-700">{field.label}</label>
              <input
                type={field.key.includes('date') ? 'datetime-local' : 'text'}
                value={formData[field.key] || ''}
                onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>
          ))}
          <button
            type="submit"
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all"
          >
            Lưu
          </button>
        </form>
      )}

      <div className="overflow-x-auto bg-white rounded-xl shadow-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-indigo-50">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
              {canDelete && <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Hành động</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, idx) => (
              <tr
                key={row.id}
                className={`transition-colors ${idx % 2 === 0 ? 'bg-gray-50' : ''} hover:bg-gray-100`}
              >
                {columns.map(col => (
                  <td key={col.key} className="px-6 py-4 whitespace-nowrap text-gray-800">
                    {row[col.key]}
                  </td>
                ))}
                {canDelete && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                    >
                      Xóa
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length + (canDelete ? 1 : 0)} className="text-center py-4 text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
