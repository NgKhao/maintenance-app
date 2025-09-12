import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function UsersPage() {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Họ tên' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Số điện thoại' },
    { key: 'role', label: 'Vai trò' },
    { key: 'active', label: 'Trạng thái' },
    { key: 'created_at', label: 'Ngày tạo' },
  ];

  const formFields = [
    { key: 'name', label: 'Họ tên', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true },
    { key: 'phone', label: 'Số điện thoại', type: 'tel', required: false },
    { key: 'password', label: 'Mật khẩu', type: 'password', required: true },
    {
      key: 'role',
      label: 'Vai trò',
      type: 'select',
      required: true,
      options: [
        { value: 'user', label: 'Khách hàng' },
        { value: 'technician', label: 'Kỹ thuật viên' },
      ],
    },
  ];

  const [data, setData] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem('role');
  const canEdit = role === 'admin';

  const API_URL = 'http://localhost:8000/api/users.php';

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      // Lọc ra admin accounts - chỉ hiển thị user và technician
      const filteredData = res.data.filter((user) => user.role !== 'admin');
      setData(filteredData);
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi tải dữ liệu người dùng');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        password: formData.password,
        role: formData.role,
      };

      await axios.post(API_URL, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      setFormData({});
      setFormVisible(false);
      fetchData();
      alert('Thêm người dùng thành công');
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi thêm người dùng');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    try {
      await axios.delete(`${API_URL}?id=${id}`);
      fetchData();
      alert('Xóa người dùng thành công');
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi xóa người dùng');
    }
  };

  const handleEdit = (row) => {
    setEditingId(row.id);
    setEditData({
      name: row.name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      active: row.active,
    });
  };

  const saveEdit = async (id) => {
    try {
      const payload = {
        name: editData.name,
        email: editData.email,
        phone: editData.phone || '',
        role: editData.role,
        active: editData.active,
        action: 'update',
      };

      await axios.put(`${API_URL}?id=${id}`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      setEditingId(null);
      fetchData();
      alert('Cập nhật người dùng thành công');
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi cập nhật người dùng');
    }
  };

  const toggleActive = async (id, currentActive) => {
    try {
      const payload = {
        active: currentActive ? 0 : 1,
        action: 'toggle_active',
      };

      await axios.put(`${API_URL}?id=${id}`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      fetchData();
      alert(
        `${currentActive ? 'Vô hiệu hóa' : 'Kích hoạt'} người dùng thành công`
      );
    } catch (err) {
      alert(
        err.response?.data?.error || 'Lỗi khi thay đổi trạng thái người dùng'
      );
    }
  };

  const resetPassword = async (id) => {
    if (!window.confirm('Bạn có chắc muốn reset mật khẩu cho người dùng này?'))
      return;
    try {
      const payload = {
        action: 'reset_password',
      };

      await axios.put(`${API_URL}?id=${id}`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      alert('Reset mật khẩu thành công. Mật khẩu mới đã được gửi qua email.');
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi reset mật khẩu');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'user':
        return 'Khách hàng';
      case 'technician':
        return 'Kỹ thuật viên';
      case 'admin':
        return 'Quản trị viên';
      default:
        return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'user':
        return 'bg-blue-100 text-blue-800';
      case 'technician':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActiveDisplay = (active) => {
    return active ? 'Hoạt động' : 'Vô hiệu hóa';
  };

  const getActiveColor = (active) => {
    return active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className='w-full max-w-6xl mx-auto p-6'>
        <div className='text-center py-8'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full max-w-6xl mx-auto p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-bold text-gray-800'>Quản lý Tài khoản</h2>
        {canEdit && (
          <button
            onClick={() => setFormVisible(!formVisible)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all 
            ${
              formVisible
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {formVisible ? 'Hủy' : 'Thêm tài khoản mới'}
          </button>
        )}
      </div>

      {formVisible && canEdit && (
        <form
          onSubmit={handleSubmit}
          className='mb-6 p-6 bg-white rounded-xl shadow-lg border space-y-4 transition-all'
        >
          {formFields.map((field) => (
            <div key={field.key}>
              <label className='block mb-1 font-medium text-gray-700'>
                {field.label}
              </label>
              {field.type === 'select' ? (
                <select
                  value={formData[field.key] || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, [field.key]: e.target.value })
                  }
                  className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400'
                  required={field.required}
                >
                  <option value=''>Chọn {field.label.toLowerCase()}</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || 'text'}
                  value={formData[field.key] || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, [field.key]: e.target.value })
                  }
                  className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400'
                  required={field.required}
                />
              )}
            </div>
          ))}
          <button
            type='submit'
            className='px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all'
          >
            Lưu
          </button>
        </form>
      )}

      <div className='overflow-x-auto bg-white rounded-xl shadow-lg border'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-indigo-50'>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className='px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider'
                >
                  {col.label}
                </th>
              ))}
              {canEdit && (
                <th className='px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider'>
                  Hành động
                </th>
              )}
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {data.map((row, idx) => (
              <tr
                key={row.id}
                className={`transition-colors ${
                  idx % 2 === 0 ? 'bg-gray-50' : ''
                } hover:bg-gray-100`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className='px-6 py-4 whitespace-nowrap text-gray-800'
                  >
                    {editingId === row.id &&
                    col.key !== 'id' &&
                    col.key !== 'created_at' ? (
                      col.key === 'role' ? (
                        <select
                          value={editData[col.key]}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              [col.key]: e.target.value,
                            })
                          }
                          className='w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400'
                        >
                          <option value='user'>Khách hàng</option>
                          <option value='technician'>Kỹ thuật viên</option>
                        </select>
                      ) : col.key === 'active' ? (
                        <select
                          value={editData[col.key]}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              [col.key]: parseInt(e.target.value),
                            })
                          }
                          className='w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400'
                        >
                          <option value={1}>Hoạt động</option>
                          <option value={0}>Vô hiệu hóa</option>
                        </select>
                      ) : (
                        <input
                          type={
                            col.key === 'email'
                              ? 'email'
                              : col.key === 'phone'
                              ? 'tel'
                              : 'text'
                          }
                          value={editData[col.key]}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              [col.key]: e.target.value,
                            })
                          }
                          className='w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400'
                        />
                      )
                    ) : col.key === 'role' ? (
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                          row[col.key]
                        )}`}
                      >
                        {getRoleDisplay(row[col.key])}
                      </span>
                    ) : col.key === 'active' ? (
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getActiveColor(
                          row[col.key]
                        )}`}
                      >
                        {getActiveDisplay(row[col.key])}
                      </span>
                    ) : col.key === 'created_at' ? (
                      new Date(row[col.key]).toLocaleDateString('vi-VN')
                    ) : (
                      row[col.key]
                    )}
                  </td>
                ))}
                {canEdit && (
                  <td className='px-6 py-4 whitespace-nowrap space-x-2'>
                    {editingId === row.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(row.id)}
                          className='px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all'
                        >
                          Lưu
                        </button>
                        <button
                          onClick={cancelEdit}
                          className='px-3 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition-all'
                        >
                          Hủy
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(row)}
                          className='px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-all'
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => toggleActive(row.id, row.active)}
                          className={`px-3 py-1 ${
                            row.active
                              ? 'bg-orange-500 hover:bg-orange-600'
                              : 'bg-green-500 hover:bg-green-600'
                          } text-white rounded-lg transition-all`}
                        >
                          {row.active ? 'Vô hiệu' : 'Kích hoạt'}
                        </button>
                        <button
                          onClick={() => resetPassword(row.id)}
                          className='px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-all'
                        >
                          Reset MK
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          className='px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all'
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
                <td
                  colSpan={columns.length + (canEdit ? 1 : 0)}
                  className='text-center py-4 text-gray-500'
                >
                  Không có dữ liệu người dùng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
