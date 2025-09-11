import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const API_URL = 'http://localhost:8000/index.php?api=users';

  // Lấy danh sách user
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setUsers(res.data);
    } catch (error) {
      console.error(error);
      alert('Lỗi khi tải dữ liệu');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Thêm user
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      for (let key in form) formData.append(key, form[key]);

      const res = await axios.post(API_URL, formData);
      alert(res.data.message);
      setForm({ name: '', email: '', password: '', role: 'user' });
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Lỗi khi thêm user');
    }
  };

  // Xóa user
  const handleDeleteUser = async (id) => {
    try {
      const res = await axios.delete(`${API_URL}&id=${id}`);
      alert(res.data.message);
      fetchUsers();
      setDeleteId(null);
    } catch (error) {
      console.error(error);
      alert('Lỗi khi xóa user');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Quản lý Users</h1>

      {/* --- Form thêm user --- */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Thêm User Mới</h2>
        <form className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end" onSubmit={handleAddUser}>
          <input
            type="text"
            placeholder="Tên"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 rounded focus:ring-2 focus:ring-blue-400 w-full"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border p-2 rounded focus:ring-2 focus:ring-blue-400 w-full"
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border p-2 rounded focus:ring-2 focus:ring-blue-400 w-full"
          />
          <div className="flex gap-2">
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="border p-2 rounded focus:ring-2 focus:ring-blue-400 w-full"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="technician">Technician</option>
            </select>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-all"
            >
              Thêm
            </button>
          </div>
        </form>
      </div>

      {/* --- Bảng users --- */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left text-gray-700">ID</th>
              <th className="py-3 px-4 text-left text-gray-700">Tên</th>
              <th className="py-3 px-4 text-left text-gray-700">Email</th>
              <th className="py-3 px-4 text-left text-gray-700">Vai trò</th>
              <th className="py-3 px-4 text-left text-gray-700">Ngày tạo</th>
              <th className="py-3 px-4 text-left text-gray-700">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-4">Đang tải...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4">Không có dữ liệu</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2 px-4">{user.id}</td>
                  <td className="py-2 px-4">{user.name}</td>
                  <td className="py-2 px-4">{user.email}</td>
                  <td className="py-2 px-4">{user.role}</td>
                  <td className="py-2 px-4">{user.created_at}</td>
                  <td className="py-2 px-4">
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-all"
                      onClick={() => setDeleteId(user.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- Modal confirm xóa --- */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-80">
            <h3 className="text-lg font-semibold mb-4">Xác nhận xóa</h3>
            <p className="mb-4">Bạn có chắc muốn xóa user ID {deleteId} không?</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                onClick={() => setDeleteId(null)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                onClick={() => handleDeleteUser(deleteId)}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
