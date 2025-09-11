import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PackagesPage() {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Tên gói' },
    { key: 'description', label: 'Mô tả' },
    { key: 'price', label: 'Giá' },
    { key: 'duration_months', label: 'Thời gian (tháng)' },
    { key: 'created_at', label: 'Ngày tạo' }
  ];

  const formFields = [
    { key: 'name', label: 'Tên gói' },
    { key: 'description', label: 'Mô tả' },
    { key: 'price', label: 'Giá' },
    { key: 'duration_months', label: 'Thời gian (tháng)' }
  ];

  const [data, setData] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const role = localStorage.getItem('role');
  const canEdit = role === 'admin';

  const API_URL = 'http://localhost:8000/index.php?api=packages';

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
      form.append('name', formData.name);
      form.append('description', formData.description || '');
      form.append('price', formData.price || '');
      form.append('duration_months', formData.duration_months || 12);

      await axios.post(API_URL, form);
      setFormData({});
      setFormVisible(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi thêm gói');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa?')) return;
    try {
      await axios.delete(`${API_URL}?id=${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi xóa gói');
    }
  };

  const handleEdit = (row) => {
    setEditingId(row.id);
    setEditData({
      name: row.name,
      description: row.description,
      price: row.price,
      duration_months: row.duration_months
    });
  };

  const saveEdit = async (id) => {
    try {
      const form = new FormData();
      form.append('name', editData.name);
      form.append('description', editData.description);
      form.append('price', editData.price);
      form.append('duration_months', editData.duration_months);
      await axios.post(`${API_URL}?id=${id}`, form);
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi cập nhật gói');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Danh sách Gói</h2>
        {canEdit && (
          <button
            onClick={() => setFormVisible(!formVisible)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all 
            ${formVisible ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
          >
            {formVisible ? 'Hủy' : 'Thêm gói mới'}
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
                type={field.key === 'duration_months' || field.key === 'price' ? 'number' : 'text'}
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
                    {editingId === row.id && col.key !== 'id' ? (
                      <input
                        type={col.key === 'duration_months' || col.key === 'price' ? 'number' : 'text'}
                        value={editData[col.key]}
                        onChange={e => setEditData({ ...editData, [col.key]: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    ) : (
                      row[col.key]
                    )}
                  </td>
                ))}
                {canEdit && (
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    {editingId === row.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(row.id)}
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
                        >
                          Lưu
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition-all"
                        >
                          Hủy
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(row)}
                          className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-all"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                        >
                          Xóa
                        </button>
                      </>
                    )}
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
