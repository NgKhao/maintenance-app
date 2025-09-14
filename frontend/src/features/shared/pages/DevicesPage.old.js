import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Devices as DevicesIcon
} from '@mui/icons-material';
import {
  getDevices,
  addDevice,
  updateDevice,
  deleteDevice,
} from '../api/devices';

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    serial_number: '',
    status: 'normal',
  });
  const [editing, setEditing] = useState(false);

  // Lấy thông tin user từ localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user?.role || 'user';

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    try {
      // Nếu là user thường, chỉ lấy thiết bị của mình
      const userId = role === 'user' ? user.id : null;
      const data = await getDevices(userId);
      setDevices(data);
    } catch (err) {
      console.error(err);
      alert('Lỗi khi tải danh sách thiết bị');
    }
    setLoading(false);
  }, [role, user.id]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]); // Dependencies để tự động reload khi user thay đổi

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'issue':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'normal':
        return 'Bình thường';
      case 'issue':
        return 'Có vấn đề';
      case 'maintenance':
        return 'Đang bảo trì';
      default:
        return status;
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    // Chỉ khách hàng (user) mới được thêm thiết bị
    if (role !== 'user') {
      alert('Chỉ khách hàng mới có thể thêm thiết bị');
      return;
    }

    setFormData({
      id: null,
      name: '',
      serial_number: '',
      status: 'normal',
      user_id: user.id,
      technician_note: '',
    });
    setEditing(false);
    setFormVisible(true);
  };

  const handleEdit = (device) => {
    setFormData({
      id: device.id,
      name: device.name || '',
      serial_number: device.serial_number || '',
      status: device.status || 'normal',
      user_id: device.user_id || user.id,
      technician_note: device.technician_note || '',
    });
    setEditing(true);
    setFormVisible(true);
  };

  const handleDelete = async (id) => {
    // Chỉ khách hàng (user) mới được xóa thiết bị của mình
    if (role !== 'user') {
      alert('Chỉ khách hàng mới có thể xóa thiết bị');
      return;
    }

    if (!window.confirm('Bạn có chắc muốn xóa thiết bị này?')) return;
    try {
      await deleteDevice(id);
      fetchDevices();
      alert('Xóa thiết bị thành công');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Lỗi khi xóa thiết bị');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let payload = { ...formData };

      // Xử lý payload theo role
      if (role === 'user') {
        // Khách hàng chỉ có thể sửa tên và thêm thiết bị mới
        payload.user_id = user.id;
      } else if (role === 'technician') {
        // Kỹ thuật viên chỉ có thể cập nhật trạng thái và ghi chú
        if (editing) {
          payload = {
            id: formData.id,
            status: formData.status,
            technician_note: formData.technician_note,
          };
        } else {
          alert('Kỹ thuật viên không thể thêm thiết bị mới');
          return;
        }
      }

      if (editing) {
        await updateDevice(payload);
        alert('Cập nhật thiết bị thành công');
      } else {
        if (role !== 'user') {
          alert('Chỉ khách hàng mới có thể thêm thiết bị mới');
          return;
        }
        await addDevice(payload);
        alert('Thêm thiết bị thành công');
      }
      setFormVisible(false);
      fetchDevices();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Lỗi khi lưu thiết bị');
    }
  };

  return (
    <div className='w-full max-w-6xl mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>
        {role === 'admin'
          ? 'Theo dõi thiết bị khách hàng'
          : role === 'technician'
          ? 'Cập nhật tình trạng thiết bị'
          : 'Quản lý thiết bị của tôi'}
      </h1>

      {/* Chỉ khách hàng mới có nút thêm thiết bị */}
      {role === 'user' && (
        <button
          onClick={handleAdd}
          className='mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
        >
          Thêm thiết bị
        </button>
      )}

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table className='min-w-full bg-white border rounded-lg overflow-hidden'>
          <thead className='bg-gray-100'>
            <tr>
              <th className='py-2 px-4 border-b'>ID</th>
              <th className='py-2 px-4 border-b'>Tên thiết bị</th>
              <th className='py-2 px-4 border-b'>Serial</th>
              <th className='py-2 px-4 border-b'>Trạng thái</th>
              {role === 'admin' && (
                <th className='py-2 px-4 border-b'>Chủ sở hữu</th>
              )}
              {role === 'technician' && (
                <th className='py-2 px-4 border-b'>Ghi chú kỹ thuật</th>
              )}
              <th className='py-2 px-4 border-b'>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((d) => (
              <tr key={d.id} className='text-center hover:bg-gray-50'>
                <td className='py-2 px-4 border-b'>{d.id}</td>
                <td className='py-2 px-4 border-b'>{d.name}</td>
                <td className='py-2 px-4 border-b'>{d.serial_number}</td>
                <td className='py-2 px-4 border-b'>
                  <span
                    className={`px-2 py-1 rounded text-xs ${getStatusColor(
                      d.status
                    )}`}
                  >
                    {getStatusText(d.status)}
                  </span>
                </td>
                {role === 'admin' && (
                  <td className='py-2 px-4 border-b'>
                    {d.user_name}
                    <br />
                    <small className='text-gray-500'>{d.user_email}</small>
                  </td>
                )}
                {role === 'technician' && (
                  <td className='py-2 px-4 border-b text-left'>
                    {d.technician_note || (
                      <em className='text-gray-400'>Chưa có ghi chú</em>
                    )}
                  </td>
                )}
                <td className='py-2 px-4 border-b space-x-2'>
                  {/* Khách hàng: Sửa và xóa thiết bị của mình */}
                  {role === 'user' && (
                    <>
                      <button
                        onClick={() => handleEdit(d)}
                        className='px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500'
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(d.id)}
                        className='px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600'
                      >
                        Xóa
                      </button>
                    </>
                  )}

                  {/* Kỹ thuật viên: Chỉ cập nhật trạng thái */}
                  {role === 'technician' && (
                    <button
                      onClick={() => handleEdit(d)}
                      className='px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600'
                    >
                      Cập nhật
                    </button>
                  )}

                  {/* Admin: Chỉ xem thông tin */}
                  {role === 'admin' && (
                    <button
                      onClick={() => handleEdit(d)}
                      className='px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600'
                    >
                      Xem chi tiết
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {devices.length === 0 && !loading && (
        <p className='text-center py-4 text-gray-500'>
          {role === 'user'
            ? 'Bạn chưa có thiết bị nào'
            : 'Không có thiết bị nào'}
        </p>
      )}

      {/* Form Add/Edit */}
      {formVisible && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
          <div className='bg-white p-6 rounded-lg w-full max-w-md'>
            <h2 className='text-xl font-bold mb-4'>
              {role === 'admin'
                ? 'Thông tin thiết bị'
                : role === 'technician'
                ? 'Cập nhật tình trạng thiết bị'
                : editing
                ? 'Sửa thiết bị'
                : 'Thêm thiết bị'}
            </h2>
            <form onSubmit={handleSubmit} className='space-y-4'>
              {/* Tên thiết bị - Chỉ khách hàng mới được sửa */}
              <div>
                <label className='block mb-1 font-medium'>Tên thiết bị</label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  required={role === 'user'}
                  disabled={role !== 'user'}
                  className={`w-full border px-3 py-2 rounded ${
                    role !== 'user' ? 'bg-gray-100' : ''
                  }`}
                />
              </div>

              {/* Serial - Chỉ khách hàng mới được thêm/sửa (nếu chưa có) */}
              <div>
                <label className='block mb-1 font-medium'>Serial Number</label>
                <input
                  type='text'
                  name='serial_number'
                  value={formData.serial_number}
                  onChange={handleInputChange}
                  required={role === 'user' && !editing}
                  disabled={role !== 'user' || editing}
                  className={`w-full border px-3 py-2 rounded ${
                    role !== 'user' || editing ? 'bg-gray-100' : ''
                  }`}
                />
              </div>

              {/* Trạng thái - Kỹ thuật viên có thể sửa */}
              <div>
                <label className='block mb-1 font-medium'>Trạng thái</label>
                <select
                  name='status'
                  value={formData.status}
                  onChange={handleInputChange}
                  disabled={role === 'admin'}
                  className={`w-full border px-3 py-2 rounded ${
                    role === 'admin' ? 'bg-gray-100' : ''
                  }`}
                >
                  <option value='normal'>Bình thường</option>
                  <option value='issue'>Có vấn đề</option>
                  <option value='maintenance'>Đang bảo trì</option>
                </select>
              </div>

              {/* Ghi chú kỹ thuật - Chỉ kỹ thuật viên mới thấy và sửa được */}
              {(role === 'technician' || (role === 'admin' && editing)) && (
                <div>
                  <label className='block mb-1 font-medium'>
                    Ghi chú kỹ thuật
                  </label>
                  <textarea
                    name='technician_note'
                    value={formData.technician_note}
                    onChange={handleInputChange}
                    disabled={role === 'admin'}
                    className={`w-full border px-3 py-2 rounded ${
                      role === 'admin' ? 'bg-gray-100' : ''
                    }`}
                    rows='3'
                    placeholder='Ghi chú về tình trạng thiết bị sau bảo trì...'
                  />
                </div>
              )}

              {/* Thông tin chủ sở hữu - Chỉ admin mới thấy */}
              {role === 'admin' && editing && (
                <div className='bg-gray-50 p-3 rounded'>
                  <h4 className='font-medium mb-2'>Thông tin chủ sở hữu:</h4>
                  <p>
                    <strong>Tên:</strong>{' '}
                    {devices.find((d) => d.id === formData.id)?.user_name}
                  </p>
                  <p>
                    <strong>Email:</strong>{' '}
                    {devices.find((d) => d.id === formData.id)?.user_email}
                  </p>
                </div>
              )}

              <div className='flex justify-end space-x-2'>
                <button
                  type='button'
                  onClick={() => setFormVisible(false)}
                  className='px-4 py-2 bg-gray-300 rounded hover:bg-gray-400'
                >
                  {role === 'admin' ? 'Đóng' : 'Hủy'}
                </button>

                {role !== 'admin' && (
                  <button
                    type='submit'
                    className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
                  >
                    {role === 'technician'
                      ? 'Cập nhật'
                      : editing
                      ? 'Lưu thay đổi'
                      : 'Thêm thiết bị'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
