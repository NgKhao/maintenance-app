import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function OrdersPage() {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'user_id', label: 'User ID' },
    { key: 'package_id', label: 'Gói bảo trì' },
    { key: 'payment_status', label: 'Trạng thái thanh toán' },
    { key: 'start_date', label: 'Ngày bắt đầu' },
    { key: 'end_date', label: 'Ngày kết thúc' }
  ];

  const formFields = [
    { key: 'user_id', label: 'User ID' },
    { key: 'package_id', label: 'Gói bảo trì ID' },
    { key: 'payment_status', label: 'Trạng thái' },
    { key: 'start_date', label: 'Ngày bắt đầu' },
    { key: 'end_date', label: 'Ngày kết thúc' }
  ];

  const [data, setData] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({});
  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('user_id'); // ID của user đang đăng nhập
  const canEdit = role === 'admin'; // chỉ admin được thêm/xóa

  const API_URL = 'http://localhost:8000/index.php?api=orders';

  // Lấy dữ liệu
  const fetchData = async () => {
    try {
      let url = API_URL;
      if (role !== 'admin' && userId) {
        // Nếu không phải admin, chỉ lấy đơn hàng của chính mình
        url += `&user_id=${userId}`;
      }
      const res = await axios.get(url);
      setData(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi tải dữ liệu');
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Thêm đơn hàng (chỉ admin)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append('user_id', formData.user_id || '');
      form.append('package_id', formData.package_id || '');
      form.append('payment_status', formData.payment_status || 'pending');
      form.append('start_date', formData.start_date || '');
      form.append('end_date', formData.end_date || '');

      await axios.post(API_URL, form);
      setFormData({});
      setFormVisible(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi tạo đơn hàng');
    }
  };

  // Xóa đơn (chỉ admin)
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa đơn hàng?')) return;
    try {
      await axios.delete(`${API_URL}?id=${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi xóa đơn hàng');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Danh sách Đơn hàng</h2>
        {canEdit && (
          <button
            onClick={() => setFormVisible(!formVisible)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all 
              ${formVisible ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
          >
            {formVisible ? 'Hủy' : 'Tạo đơn mới'}
          </button>
        )}
      </div>

      {formVisible && canEdit && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-6 bg-white rounded-xl shadow-lg border space-y-4 transition-all"
        >
          {formFields.map(field => (
            <div key={field.key}>
              <label className="block mb-1 font-medium text-gray-700">{field.label}</label>
              <input
                type={field.key.includes('date') ? 'date' : 'text'}
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
              {canEdit && <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Hành động</th>}
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
                {canEdit && (
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
                <td colSpan={columns.length + (canEdit ? 1 : 0)} className="text-center py-4 text-gray-500">
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
