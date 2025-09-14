import React, { useState, useEffect, useCallback } from 'react';
import {
  getSchedules,
  createSchedule,
  updateScheduleStatus,
  deleteSchedule,
} from '../api/schedules';
import { getOrders } from '../api/orders';
import { getDevices } from '../api/devices';

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [orders, setOrders] = useState([]);
  const [devices, setDevices] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    order_id: '',
    technician_id: '',
    device_id: '',
    scheduled_date: '',
    note: '',
  });

  // Lấy thông tin user từ localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user?.role || 'user';
  const canEdit = role === 'admin';

  // Fetch data functions
  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const userId = role === 'user' ? user.id : null;
      const data = await getSchedules(userId);
      setSchedules(data);
    } catch (err) {
      console.error(err);
      alert('Lỗi khi tải danh sách lịch bảo trì');
    }
    setLoading(false);
  }, [role, user.id]);

  const fetchOptions = useCallback(async () => {
    if (!canEdit) return; // User thường không cần load options

    try {
      const [ordersData, devicesData] = await Promise.all([
        getOrders(),
        getDevices(),
      ]);

      setOrders(ordersData);
      setDevices(devicesData);

      // Fetch technicians
      const techRes = await fetch('http://localhost:8000/api/technicians.php');
      const techData = await techRes.json();
      setTechnicians(techData);
    } catch (err) {
      console.error(err);
      alert('Lỗi khi tải dữ liệu');
    }
  }, [canEdit]);

  useEffect(() => {
    fetchSchedules();
    fetchOptions();
  }, [fetchSchedules, fetchOptions]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSchedule(formData);
      setFormVisible(false);
      setFormData({
        order_id: '',
        technician_id: '',
        device_id: '',
        scheduled_date: '',
        note: '',
      });
      fetchSchedules();
      alert('Đặt lịch bảo trì thành công');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Lỗi khi đặt lịch');
    }
  };

  const handleStatusUpdate = async (scheduleId, newStatus) => {
    try {
      await updateScheduleStatus(scheduleId, newStatus);
      fetchSchedules();
      alert('Cập nhật trạng thái thành công');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Lỗi khi cập nhật');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa lịch này?')) return;
    try {
      await deleteSchedule(id);
      fetchSchedules();
      alert('Xóa lịch thành công');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Lỗi khi xóa');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='w-full max-w-6xl mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Lịch Bảo Trì</h1>

      {canEdit && (
        <button
          onClick={() => setFormVisible(true)}
          className='mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
        >
          Đặt lịch mới
        </button>
      )}

      {/* Form đặt lịch */}
      {formVisible && canEdit && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg w-full max-w-md'>
            <h2 className='text-xl font-bold mb-4'>Đặt Lịch Bảo Trì</h2>
            <form onSubmit={handleSubmit}>
              <div className='mb-4'>
                <label className='block text-sm font-medium mb-2'>
                  Đơn hàng
                </label>
                <select
                  name='order_id'
                  value={formData.order_id}
                  onChange={handleInputChange}
                  className='w-full border rounded px-3 py-2'
                  required
                >
                  <option value=''>Chọn đơn hàng</option>
                  {orders.map((order) => (
                    <option key={order.id} value={order.id}>
                      #{order.id} - {order.user_name} ({order.package_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className='mb-4'>
                <label className='block text-sm font-medium mb-2'>
                  Kỹ thuật viên
                </label>
                <select
                  name='technician_id'
                  value={formData.technician_id}
                  onChange={handleInputChange}
                  className='w-full border rounded px-3 py-2'
                  required
                >
                  <option value=''>Chọn kỹ thuật viên</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name} - {tech.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className='mb-4'>
                <label className='block text-sm font-medium mb-2'>
                  Thiết bị
                </label>
                <select
                  name='device_id'
                  value={formData.device_id}
                  onChange={handleInputChange}
                  className='w-full border rounded px-3 py-2'
                  required
                >
                  <option value=''>Chọn thiết bị</option>
                  {devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name} ({device.user_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className='mb-4'>
                <label className='block text-sm font-medium mb-2'>
                  Ngày giờ dự kiến
                </label>
                <input
                  type='datetime-local'
                  name='scheduled_date'
                  value={formData.scheduled_date}
                  onChange={handleInputChange}
                  className='w-full border rounded px-3 py-2'
                  required
                />
              </div>

              <div className='mb-4'>
                <label className='block text-sm font-medium mb-2'>
                  Ghi chú
                </label>
                <textarea
                  name='note'
                  value={formData.note}
                  onChange={handleInputChange}
                  className='w-full border rounded px-3 py-2'
                  rows='3'
                />
              </div>

              <div className='flex gap-2'>
                <button
                  type='submit'
                  className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600'
                >
                  Đặt lịch
                </button>
                <button
                  type='button'
                  onClick={() => setFormVisible(false)}
                  className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600'
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Danh sách lịch */}
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full bg-white border rounded-lg'>
            <thead className='bg-gray-100'>
              <tr>
                <th className='py-2 px-4 border-b text-left'>ID</th>
                <th className='py-2 px-4 border-b text-left'>Khách hàng</th>
                <th className='py-2 px-4 border-b text-left'>Thiết bị</th>
                <th className='py-2 px-4 border-b text-left'>Kỹ thuật viên</th>
                <th className='py-2 px-4 border-b text-left'>Ngày dự kiến</th>
                <th className='py-2 px-4 border-b text-left'>Trạng thái</th>
                <th className='py-2 px-4 border-b text-left'>Ghi chú</th>
                {canEdit && (
                  <th className='py-2 px-4 border-b text-left'>Hành động</th>
                )}
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr key={schedule.id} className='hover:bg-gray-50'>
                  <td className='py-2 px-4 border-b'>#{schedule.id}</td>
                  <td className='py-2 px-4 border-b'>{schedule.user_name}</td>
                  <td className='py-2 px-4 border-b'>
                    {schedule.device_name}
                    {schedule.serial_number && <br />}
                    <small className='text-gray-500'>
                      {schedule.serial_number}
                    </small>
                  </td>
                  <td className='py-2 px-4 border-b'>
                    {schedule.technician_name}
                  </td>
                  <td className='py-2 px-4 border-b'>
                    {formatDate(schedule.scheduled_date)}
                  </td>
                  <td className='py-2 px-4 border-b'>
                    <span
                      className={`px-2 py-1 rounded text-xs ${getStatusColor(
                        schedule.status
                      )}`}
                    >
                      {schedule.status === 'pending'
                        ? 'Chờ thực hiện'
                        : schedule.status === 'completed'
                        ? 'Hoàn thành'
                        : schedule.status === 'assigned'
                        ? 'Đã bàn giao'
                        : 'Đã hủy'}
                    </span>
                  </td>
                  <td className='py-2 px-4 border-b'>{schedule.note}</td>
                  {canEdit && (
                    <td className='py-2 px-4 border-b'>
                      <div className='flex gap-1'>
                        {schedule.status === 'pending' && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusUpdate(schedule.id, 'completed')
                              }
                              className='px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600'
                            >
                              Hoàn thành
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(schedule.id, 'cancelled')
                              }
                              className='px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600'
                            >
                              Hủy
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className='px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600'
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {schedules.length === 0 && (
            <p className='text-center py-4 text-gray-500'>
              Chưa có lịch bảo trì nào
            </p>
          )}
        </div>
      )}
    </div>
  );
}
