import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ContractRequestsPage({ user }) {
  const [data, setData] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({});
  const role = user?.role || 'user';
  const canEdit = role === 'admin'; // admin mới được xóa

  const API_URL = 'http://localhost:8000/index.php?api=contract_requests';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(API_URL);
        const allData = res.data;
        if (role === 'admin') setData(allData); // admin xem tất cả
        else setData(allData.filter(r => r.user_id === user.id)); // user chỉ xem dữ liệu của mình
      } catch (err) {
        alert(err.response?.data?.error || 'Lỗi khi tải dữ liệu');
      }
    };
    fetchData();
  }, [role, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append('order_id', formData.order_id);
      form.append('note', formData.note || '');
      form.append('status', formData.status || 'pending');
      await axios.post(API_URL, form);
      setFormData({});
      setFormVisible(false);
      // reload dữ liệu
      const res = await axios.get(API_URL);
      const allData = res.data;
      setData(role === 'admin' ? allData : allData.filter(r => r.user_id === user.id));
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi gửi yêu cầu');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa?')) return;
    try {
      await axios.delete(`${API_URL}?id=${id}`);
      setData(data.filter(d => d.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi xóa yêu cầu');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Yêu cầu kết thúc hợp đồng</h2>
      {formVisible && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white rounded shadow space-y-4">
          <div>
            <label>Order ID:</label>
            <input
              type="number"
              value={formData.order_id || ''}
              onChange={e => setFormData({ ...formData, order_id: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Note:</label>
            <input
              type="text"
              value={formData.note || ''}
              onChange={e => setFormData({ ...formData, note: e.target.value })}
            />
          </div>
          <button type="submit" className="bg-green-500 px-4 py-2 text-white rounded">Gửi</button>
        </form>
      )}
      <button onClick={() => setFormVisible(!formVisible)} className="mb-4 bg-blue-500 px-4 py-2 text-white rounded">
        {formVisible ? 'Hủy' : 'Tạo mới'}
      </button>

      <table className="min-w-full bg-white rounded shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Order ID</th>
            <th className="px-4 py-2">Note</th>
            <th className="px-4 py-2">Status</th>
            {canEdit && <th className="px-4 py-2">Hành động</th>}
          </tr>
        </thead>
        <tbody>
          {data.map(r => (
            <tr key={r.id}>
              <td className="border px-4 py-2">{r.id}</td>
              <td className="border px-4 py-2">{r.order_id}</td>
              <td className="border px-4 py-2">{r.note}</td>
              <td className="border px-4 py-2">{r.status}</td>
              {canEdit && (
                <td className="border px-4 py-2">
                  <button onClick={() => handleDelete(r.id)} className="bg-red-500 px-2 py-1 text-white rounded">Xóa</button>
                </td>
              )}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={canEdit ? 5 : 4} className="text-center py-2">Không có dữ liệu</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
